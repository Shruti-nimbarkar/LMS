import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Filter,
  Plus,
  Clock,
  FlaskConical,
  Play,
  ClipboardCheck,
  Shield,
  FolderKanban,
  Package,
  FileText,
  AlertCircle,
  X
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays, subDays, startOfDay, isToday, parseISO } from 'date-fns'
import { calendarService, EVENT_TYPES } from '../../../services/calendarService'
import toast from 'react-hot-toast'
import Card from '../../../components/labManagement/Card'
import Button from '../../../components/labManagement/Button'
import Badge from '../../../components/labManagement/Badge'
import Modal from '../../../components/labManagement/Modal'

const VIEW_TYPES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
}

const iconMap = {
  FlaskConical,
  Play,
  ClipboardCheck,
  Shield,
  FolderKanban,
  Package,
  FileText,
  AlertCircle
}

function Calendar() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState(VIEW_TYPES.MONTH)
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [activeFilters, setActiveFilters] = useState(Object.keys(EVENT_TYPES))
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [currentDate, view])

  useEffect(() => {
    filterEvents()
  }, [events, activeFilters])

  const loadEvents = async () => {
    try {
      setLoading(true)
      let startDate, endDate

      if (view === VIEW_TYPES.MONTH) {
        startDate = startOfMonth(currentDate)
        endDate = endOfMonth(currentDate)
      } else if (view === VIEW_TYPES.WEEK) {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 })
      } else {
        startDate = startOfDay(currentDate)
        endDate = new Date(currentDate)
        endDate.setHours(23, 59, 59, 999)
      }

      const fetchedEvents = await calendarService.getEvents(startDate, endDate)
      setEvents(fetchedEvents)
    } catch (error) {
      toast.error('Failed to load calendar events')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    const filtered = events.filter(event => activeFilters.includes(event.type))
    setFilteredEvents(filtered)
  }

  const handlePrevious = () => {
    if (view === VIEW_TYPES.MONTH) {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (view === VIEW_TYPES.WEEK) {
      setCurrentDate(subDays(currentDate, 7))
    } else {
      setCurrentDate(subDays(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (view === VIEW_TYPES.MONTH) {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (view === VIEW_TYPES.WEEK) {
      setCurrentDate(addDays(currentDate, 7))
    } else {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleFilterToggle = (filterType) => {
    setActiveFilters(prev => 
      prev.includes(filterType)
        ? prev.filter(f => f !== filterType)
        : [...prev, filterType]
    )
  }

  const getEventsForDate = (date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start)
      return isSameDay(eventDate, date)
    })
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="col-span-7 grid grid-cols-7 bg-white">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 bg-white">
            {week.map(day => {
              const dayEvents = getEventsForDate(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isCurrentDay = isToday(day)

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                    !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                  } ${isCurrentDay ? 'ring-2 ring-primary ring-inset' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentDay 
                      ? 'text-primary font-bold' 
                      : isCurrentMonth 
                        ? 'text-gray-900' 
                        : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => {
                      const eventType = EVENT_TYPES[Object.keys(EVENT_TYPES).find(key => EVENT_TYPES[key].id === event.type)]
                      const Icon = iconMap[eventType?.icon] || CalendarIcon
                      return (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                          style={{ backgroundColor: `${event.color}20`, color: event.color }}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="flex flex-col h-[600px] overflow-auto">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="p-2 border-r border-gray-200"></div>
          {weekDays.map(day => (
            <div
              key={day.toISOString()}
              className={`p-2 text-center border-r border-gray-200 ${
                isToday(day) ? 'bg-primary/10' : ''
              }`}
            >
              <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
              <div className={`text-lg font-semibold ${
                isToday(day) ? 'text-primary' : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="grid grid-cols-8 flex-1">
          <div className="border-r border-gray-200">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b border-gray-100 p-1 text-xs text-gray-500">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
            ))}
          </div>
          {weekDays.map(day => {
            const dayEvents = getEventsForDate(day).filter(e => !e.allDay)
            return (
              <div key={day.toISOString()} className="border-r border-gray-200 relative">
                {hours.map(hour => (
                  <div key={hour} className="h-16 border-b border-gray-100"></div>
                ))}
                {/* Events */}
                <div className="absolute inset-0 pointer-events-none">
                  {dayEvents.map(event => {
                    const start = new Date(event.start)
                    const hour = start.getHours()
                    const minutes = start.getMinutes()
                    const top = (hour * 64) + (minutes / 60 * 64)
                    const eventType = EVENT_TYPES[Object.keys(EVENT_TYPES).find(key => EVENT_TYPES[key].id === event.type)]
                    const Icon = iconMap[eventType?.icon] || CalendarIcon
                    
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="absolute left-1 right-1 rounded p-1 text-xs cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto"
                        style={{
                          top: `${top}px`,
                          backgroundColor: `${event.color}20`,
                          color: event.color,
                          borderLeft: `3px solid ${event.color}`
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <Icon className="w-3 h-3" />
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                        {!event.allDay && (
                          <div className="text-xs opacity-75">
                            {format(start, 'h:mm a')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* All-day events */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-8">
            <div className="p-2 text-xs font-semibold text-gray-600 border-r border-gray-200">
              All Day
            </div>
            {weekDays.map(day => {
              const allDayEvents = getEventsForDate(day).filter(e => e.allDay)
              return (
                <div key={day.toISOString()} className="p-1 border-r border-gray-200 min-h-[60px]">
                  {allDayEvents.map(event => {
                    const eventType = EVENT_TYPES[Object.keys(EVENT_TYPES).find(key => EVENT_TYPES[key].id === event.type)]
                    const Icon = iconMap[eventType?.icon] || CalendarIcon
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="mb-1 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                        style={{ backgroundColor: `${event.color}20`, color: event.color }}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="truncate">{event.title}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayEvents = getEventsForDate(currentDate)

    return (
      <div className="flex flex-col h-[600px] overflow-auto">
        {/* Day header */}
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
          </div>
        </div>

        {/* Time slots */}
        <div className="flex-1 relative">
          <div className="grid grid-cols-12">
            <div className="col-span-2 border-r border-gray-200">
              {hours.map(hour => (
                <div key={hour} className="h-16 border-b border-gray-100 p-2 text-xs text-gray-500">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
              ))}
            </div>
            <div className="col-span-10 relative">
              {hours.map(hour => (
                <div key={hour} className="h-16 border-b border-gray-100"></div>
              ))}
              {/* Events */}
              <div className="absolute inset-0 pointer-events-none">
                {dayEvents.filter(e => !e.allDay).map(event => {
                  const start = new Date(event.start)
                  const hour = start.getHours()
                  const minutes = start.getMinutes()
                  const top = (hour * 64) + (minutes / 60 * 64)
                  const eventType = EVENT_TYPES[Object.keys(EVENT_TYPES).find(key => EVENT_TYPES[key].id === event.type)]
                  const Icon = iconMap[eventType?.icon] || CalendarIcon
                  
                  return (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="absolute left-2 right-2 rounded-lg p-3 cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto shadow-sm"
                      style={{
                        top: `${top}px`,
                        backgroundColor: `${event.color}15`,
                        color: event.color,
                        borderLeft: `4px solid ${event.color}`
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" />
                        <span className="font-semibold">{event.title}</span>
                      </div>
                      <div className="text-xs opacity-75">
                        {format(start, 'h:mm a')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* All-day events */}
          {dayEvents.filter(e => e.allDay).length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-600 mb-2">All Day</div>
              <div className="space-y-2">
                {dayEvents.filter(e => e.allDay).map(event => {
                  const eventType = EVENT_TYPES[Object.keys(EVENT_TYPES).find(key => EVENT_TYPES[key].id === event.type)]
                  const Icon = iconMap[eventType?.icon] || CalendarIcon
                  return (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2"
                      style={{ backgroundColor: `${event.color}20`, color: event.color }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{event.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (view) {
      case VIEW_TYPES.MONTH:
        return renderMonthView()
      case VIEW_TYPES.WEEK:
        return renderWeekView()
      case VIEW_TYPES.DAY:
        return renderDayView()
      default:
        return renderMonthView()
    }
  }

  const getViewTitle = () => {
    if (view === VIEW_TYPES.MONTH) {
      return format(currentDate, 'MMMM yyyy')
    } else if (view === VIEW_TYPES.WEEK) {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-primary" />
            Calendar
          </h1>
          <p className="text-gray-600">View all testing schedules and important dates</p>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="ml-4 text-lg font-semibold text-gray-900">
              {getViewTitle()}
            </div>
          </div>

          {/* View selector and filters */}
          <div className="flex items-center gap-2">
            {/* View buttons */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {Object.values(VIEW_TYPES).map(viewType => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                    view === viewType
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {viewType}
                </button>
              ))}
            </div>

            {/* Filter button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilters.length < Object.keys(EVENT_TYPES).length && (
                  <Badge variant="info" className="ml-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </button>

              {/* Filter dropdown */}
              {showFilters && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Event Types</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.values(EVENT_TYPES).map(eventType => (
                      <label
                        key={eventType.id}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={activeFilters.includes(eventType.id)}
                          onChange={() => handleFilterToggle(eventType.id)}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: eventType.color }}
                        />
                        <span className="text-sm text-gray-700">{eventType.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar View */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading calendar...</p>
          </div>
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          {renderView()}
        </Card>
      )}

      {/* Event Details Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setSelectedEvent(null)
        }}
        title="Event Details"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${selectedEvent.color}20` }}
              >
                {(() => {
                  const eventType = EVENT_TYPES[Object.keys(EVENT_TYPES).find(key => EVENT_TYPES[key].id === selectedEvent.type)]
                  const Icon = iconMap[eventType?.icon] || CalendarIcon
                  return <Icon className="w-6 h-6" style={{ color: selectedEvent.color }} />
                })()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {selectedEvent.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(selectedEvent.start), 'EEEE, MMMM d, yyyy')}
                    {!selectedEvent.allDay && ` at ${format(new Date(selectedEvent.start), 'h:mm a')}`}
                  </span>
                </div>
              </div>
            </div>

            {selectedEvent.resource?.data && (
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  {selectedEvent.resource.type === 'test_plan' && (
                    <>
                      <div><strong>Project:</strong> {selectedEvent.resource.data.projectName}</div>
                      <div><strong>Test Type:</strong> {selectedEvent.resource.data.testType}</div>
                      <div><strong>Status:</strong> {selectedEvent.resource.data.status}</div>
                      {selectedEvent.resource.data.assignedEngineerName && (
                        <div><strong>Assigned To:</strong> {selectedEvent.resource.data.assignedEngineerName}</div>
                      )}
                    </>
                  )}
                  {selectedEvent.resource.type === 'audit' && (
                    <>
                      <div><strong>Status:</strong> {selectedEvent.resource.data.status}</div>
                      {selectedEvent.resource.data.auditorName && (
                        <div><strong>Auditor:</strong> {selectedEvent.resource.data.auditorName}</div>
                      )}
                      {selectedEvent.resource.data.description && (
                        <div><strong>Description:</strong> {selectedEvent.resource.data.description}</div>
                      )}
                    </>
                  )}
                  {selectedEvent.resource.type === 'certification' && (
                    <>
                      <div><strong>Name:</strong> {selectedEvent.resource.data.name}</div>
                      {selectedEvent.resource.data.issuingBody && (
                        <div><strong>Issuing Body:</strong> {selectedEvent.resource.data.issuingBody}</div>
                      )}
                      {selectedEvent.resource.data.certificateNumber && (
                        <div><strong>Certificate Number:</strong> {selectedEvent.resource.data.certificateNumber}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  if (selectedEvent.resource) {
                    const routeMap = {
                      test_plan: '/lab/management/test-plans',
                      test_execution: '/lab/management/test-executions',
                      audit: '/lab/management/audits',
                      certification: '/lab/management/certifications',
                      project: '/lab/management/projects',
                      sample: '/lab/management/samples',
                      rfq: '/lab/management/rfqs'
                    }
                    const route = routeMap[selectedEvent.resource.type]
                    if (route) {
                      navigate(route)
                      setShowEventModal(false)
                    }
                  }
                }}
                variant="outline"
                className="flex-1"
              >
                View Details
              </Button>
              <Button
                onClick={() => {
                  setShowEventModal(false)
                  setSelectedEvent(null)
                }}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Calendar

