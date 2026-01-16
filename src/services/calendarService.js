import { 
  testPlansService,
  testExecutionsService,
  auditsService,
  certificationsService,
  projectsService,
  samplesService,
  rfqsService
} from './labManagementApi'

/**
 * Calendar Service - Aggregates all date-related events from various services
 */

// Event types with color coding
export const EVENT_TYPES = {
  TEST_PLAN: {
    id: 'test_plan',
    label: 'Test Plan',
    color: '#3B82F6', // Blue
    icon: 'FlaskConical'
  },
  TEST_EXECUTION: {
    id: 'test_execution',
    label: 'Test Execution',
    color: '#10B981', // Green
    icon: 'Play'
  },
  AUDIT: {
    id: 'audit',
    label: 'Audit',
    color: '#F59E0B', // Amber
    icon: 'ClipboardCheck'
  },
  CERTIFICATION: {
    id: 'certification',
    label: 'Certification',
    color: '#8B5CF6', // Purple
    icon: 'Shield'
  },
  PROJECT: {
    id: 'project',
    label: 'Project',
    color: '#EC4899', // Pink
    icon: 'FolderKanban'
  },
  SAMPLE: {
    id: 'sample',
    label: 'Sample',
    color: '#14B8A6', // Teal
    icon: 'Package'
  },
  RFQ: {
    id: 'rfq',
    label: 'RFQ',
    color: '#6366F1', // Indigo
    icon: 'FileText'
  },
  CERTIFICATION_EXPIRY: {
    id: 'certification_expiry',
    label: 'Certification Expiry',
    color: '#EF4444', // Red
    icon: 'AlertCircle'
  }
}

/**
 * Fetch all calendar events from various services
 */
export const calendarService = {
  /**
   * Get all events for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of calendar events
   */
  async getEvents(startDate, endDate) {
    try {
      const [
        testPlans,
        testExecutions,
        audits,
        certifications,
        projects,
        samples,
        rfqs
      ] = await Promise.all([
        testPlansService.getAll().catch(() => []),
        testExecutionsService.getAll().catch(() => []),
        auditsService.getAll().catch(() => []),
        certificationsService.getAll().catch(() => []),
        projectsService.getAll().catch(() => []),
        samplesService.getAll().catch(() => []),
        rfqsService.getAll().catch(() => [])
      ])

      const events = []

      // Process Test Plans
      testPlans.forEach(plan => {
        // Use createdAt as fallback if no specific dates
        const planDate = plan.plannedStartDate || plan.actualStartDate || plan.createdAt
        if (planDate) {
          try {
            events.push({
              id: `test_plan_${plan.id}`,
              title: plan.name || 'Test Plan',
              start: new Date(planDate),
              end: new Date(planDate),
              allDay: true,
              type: EVENT_TYPES.TEST_PLAN.id,
              color: EVENT_TYPES.TEST_PLAN.color,
              resource: {
                type: 'test_plan',
                id: plan.id,
                data: plan
              }
            })
          } catch (e) {
            console.warn('Invalid date for test plan:', plan.id, e)
          }
        }
        
        // Add end dates if available
        if (plan.plannedEndDate || plan.actualEndDate) {
          try {
            const endDate = plan.plannedEndDate || plan.actualEndDate
            events.push({
              id: `test_plan_end_${plan.id}`,
              title: `${plan.name || 'Test Plan'} - End`,
              start: new Date(endDate),
              end: new Date(endDate),
              allDay: true,
              type: EVENT_TYPES.TEST_PLAN.id,
              color: EVENT_TYPES.TEST_PLAN.color,
              resource: {
                type: 'test_plan',
                id: plan.id,
                data: plan
              }
            })
          } catch (e) {
            console.warn('Invalid end date for test plan:', plan.id, e)
          }
        }
      })

      // Process Test Executions
      testExecutions.forEach(execution => {
        const execDate = execution.executionDate || execution.startedAt || execution.completedAt || execution.createdAt
        if (execDate) {
          try {
            events.push({
              id: `test_execution_${execution.id}`,
              title: `Test Execution: ${execution.testPlanName || execution.name || 'Execution'}`,
              start: new Date(execDate),
              end: new Date(execDate),
              allDay: !execution.startedAt && !execution.completedAt, // All day if no specific time
              type: EVENT_TYPES.TEST_EXECUTION.id,
              color: EVENT_TYPES.TEST_EXECUTION.color,
              resource: {
                type: 'test_execution',
                id: execution.id,
                data: execution
              }
            })
          } catch (e) {
            console.warn('Invalid date for test execution:', execution.id, e)
          }
        }
      })

      // Process Audits
      audits.forEach(audit => {
        const auditDate = audit.auditDate || audit.date || audit.createdAt
        if (auditDate) {
          try {
            events.push({
              id: `audit_${audit.id}`,
              title: audit.title || 'Audit',
              start: new Date(auditDate),
              end: new Date(auditDate),
              allDay: true,
              type: EVENT_TYPES.AUDIT.id,
              color: EVENT_TYPES.AUDIT.color,
              resource: {
                type: 'audit',
                id: audit.id,
                data: audit
              }
            })
          } catch (e) {
            console.warn('Invalid date for audit:', audit.id, e)
          }
        }
      })

      // Process Certifications
      certifications.forEach(cert => {
        const issueDate = cert.issueDate || cert.issuedDate || cert.date || cert.createdAt
        if (issueDate) {
          try {
            events.push({
              id: `cert_issue_${cert.id}`,
              title: `${cert.name || 'Certification'} - Issued`,
              start: new Date(issueDate),
              end: new Date(issueDate),
              allDay: true,
              type: EVENT_TYPES.CERTIFICATION.id,
              color: EVENT_TYPES.CERTIFICATION.color,
              resource: {
                type: 'certification',
                id: cert.id,
                data: cert
              }
            })
          } catch (e) {
            console.warn('Invalid issue date for certification:', cert.id, e)
          }
        }
        
        const expiryDate = cert.expiryDate || cert.expiresAt || cert.expirationDate
        if (expiryDate) {
          try {
            events.push({
              id: `cert_expiry_${cert.id}`,
              title: `${cert.name || 'Certification'} - Expires`,
              start: new Date(expiryDate),
              end: new Date(expiryDate),
              allDay: true,
              type: EVENT_TYPES.CERTIFICATION_EXPIRY.id,
              color: EVENT_TYPES.CERTIFICATION_EXPIRY.color,
              resource: {
                type: 'certification',
                id: cert.id,
                data: cert
              }
            })
          } catch (e) {
            console.warn('Invalid expiry date for certification:', cert.id, e)
          }
        }
      })

      // Process Projects
      projects.forEach(project => {
        const projectDate = project.startDate || project.createdAt
        if (projectDate) {
          try {
            events.push({
              id: `project_${project.id}`,
              title: `${project.name || project.code || 'Project'}`,
              start: new Date(projectDate),
              end: new Date(projectDate),
              allDay: true,
              type: EVENT_TYPES.PROJECT.id,
              color: EVENT_TYPES.PROJECT.color,
              resource: {
                type: 'project',
                id: project.id,
                data: project
              }
            })
          } catch (e) {
            console.warn('Invalid date for project:', project.id, e)
          }
        }
        
        if (project.endDate || project.deadline) {
          try {
            const endDate = project.endDate || project.deadline
            events.push({
              id: `project_end_${project.id}`,
              title: `${project.name || project.code || 'Project'} - ${project.deadline ? 'Deadline' : 'End'}`,
              start: new Date(endDate),
              end: new Date(endDate),
              allDay: true,
              type: EVENT_TYPES.PROJECT.id,
              color: EVENT_TYPES.PROJECT.color,
              resource: {
                type: 'project',
                id: project.id,
                data: project
              }
            })
          } catch (e) {
            console.warn('Invalid end date for project:', project.id, e)
          }
        }
      })

      // Process Samples
      samples.forEach(sample => {
        const sampleDate = sample.receivedDate || sample.date || sample.createdAt
        if (sampleDate) {
          try {
            events.push({
              id: `sample_${sample.id}`,
              title: `Sample Received: ${sample.sampleNumber || sample.name || 'Sample'}`,
              start: new Date(sampleDate),
              end: new Date(sampleDate),
              allDay: true,
              type: EVENT_TYPES.SAMPLE.id,
              color: EVENT_TYPES.SAMPLE.color,
              resource: {
                type: 'sample',
                id: sample.id,
                data: sample
              }
            })
          } catch (e) {
            console.warn('Invalid date for sample:', sample.id, e)
          }
        }
      })

      // Process RFQs
      rfqs.forEach(rfq => {
        const rfqDate = rfq.receivedDate || rfq.date || rfq.createdAt
        if (rfqDate) {
          try {
            events.push({
              id: `rfq_${rfq.id}`,
              title: `RFQ Received: ${rfq.product || rfq.customerName || 'RFQ'}`,
              start: new Date(rfqDate),
              end: new Date(rfqDate),
              allDay: true,
              type: EVENT_TYPES.RFQ.id,
              color: EVENT_TYPES.RFQ.color,
              resource: {
                type: 'rfq',
                id: rfq.id,
                data: rfq
              }
            })
          } catch (e) {
            console.warn('Invalid date for RFQ:', rfq.id, e)
          }
        }
      })

      // Filter events by date range
      const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.start)
        return eventDate >= startDate && eventDate <= endDate
      })

      return filteredEvents.sort((a, b) => new Date(a.start) - new Date(b.start))
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      return []
    }
  },

  /**
   * Get events for a specific date
   */
  async getEventsForDate(date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    return this.getEvents(startOfDay, endOfDay)
  },

  /**
   * Get events for current month
   */
  async getEventsForMonth(year, month) {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)
    return this.getEvents(startDate, endDate)
  }
}

