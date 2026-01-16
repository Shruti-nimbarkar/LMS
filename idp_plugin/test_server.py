"""
Standalone test server for IDP plugin
Run this to test the IDP plugin independently
"""

import os
import sys
from pathlib import Path

# Add parent directory to path so we can import idp_plugin
# This allows running from both project root and idp_plugin folder
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from idp_plugin.api.router import idp_router

# Create FastAPI app
app = FastAPI(
    title="IDP Plugin Test Server",
    description="Standalone test server for Intelligent Document Processing plugin",
    version="1.0.0"
)

# Add CORS middleware for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include IDP router
app.include_router(idp_router, prefix="/idp", tags=["IDP"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "IDP Plugin Test Server",
        "version": "1.0.0",
        "endpoints": {
            "upload": "POST /idp/upload",
            "process": "POST /idp/process/{document_id}",
            "extraction": "GET /idp/{document_id}/extraction",
            "confidence": "GET /idp/{document_id}/confidence",
            "mapping": "POST /idp/{document_id}/map?target=LMS",
            "docs": "GET /docs"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


