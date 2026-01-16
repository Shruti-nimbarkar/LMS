"""
Main API router for IDP plugin
Aggregates all endpoints
"""

from fastapi import APIRouter
from idp_plugin.api.endpoints import upload, process, extraction, confidence, mapping

# Create main router
idp_router = APIRouter()

# Include all endpoint routers
idp_router.include_router(upload.router, tags=["IDP - Upload"])
idp_router.include_router(process.router, tags=["IDP - Process"])
idp_router.include_router(extraction.router, tags=["IDP - Extraction"])
idp_router.include_router(confidence.router, tags=["IDP - Confidence"])
idp_router.include_router(mapping.router, tags=["IDP - Mapping"])





