from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine
from backend.customer.models import Customer
from backend.customer.routes import router as customer_router
from backend.RFQs.models import RFQ
from backend.RFQs.routes import router as rfq_router
from backend.Estimations.models import Estimation, EstimationTestItem
from backend.Estimations.routes import router as estimation_router
from backend.project.models import Project
from backend.project.routes import router as project_router
from backend.certification.routes import router as certifications_router
from backend.Audits.models import Audit
from backend.Audits.routes import router as audit_router
from backend.NCRs.models import NCR
from backend.NCRs.routes import router as ncr_router
from backend.Test_Plans.models import TestPlan
from backend.Test_Plans.routes import router as test_plan_router
from backend.Test_execution.models import TestExecution
from backend.Test_execution.routes import router as test_execution_router
from backend.test_results.models import TestResult
from backend.test_results.routes import router as test_result_router
from backend.samples.routes import router as samples_router
from backend.trf.routes import router as trfs_router
from backend.reports.routes import router as reports_router
from backend.document.routes import router as documents_router




app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 THIS LINE CREATES app.db + customers table
Customer.metadata.create_all(bind=engine)

app.include_router(customer_router)


RFQ.metadata.create_all(bind=engine)
app.include_router(rfq_router)


Customer.metadata.create_all(bind=engine)
RFQ.metadata.create_all(bind=engine)

app.include_router(customer_router)
app.include_router(rfq_router)


Estimation.metadata.create_all(bind=engine)
EstimationTestItem.metadata.create_all(bind=engine)

app.include_router(estimation_router)

Project.metadata.create_all(bind=engine)
app.include_router(project_router)

app.include_router(certifications_router)

app.include_router(audit_router)


app.include_router(ncr_router)

app.include_router(test_plan_router)

app.include_router(test_execution_router)

app.include_router(test_result_router)

app.include_router(samples_router)
app.include_router(trfs_router)
app.include_router(reports_router)
app.include_router(documents_router)


from backend.samples import models as sample_models
from backend.trf import models as trf_models
from backend.reports import models as report_models
from backend.document import models as document_models

# ✅ Create tables
# Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"status": "LMS Backend Running"}