"""
Validation utilities for IDP plugin
"""

import mimetypes
from typing import Tuple, Optional
from idp_plugin.core.exceptions import DocumentValidationError


# Allowed file types
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/tiff",
    "image/bmp"
}

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp"}

# Max file size: 50MB
MAX_FILE_SIZE = 50 * 1024 * 1024


def validate_file_type(filename: str, content_type: Optional[str] = None) -> Tuple[str, str]:
    """
    Validate file type
    
    Args:
        filename: Original filename
        content_type: MIME type (optional, will be guessed if not provided)
        
    Returns:
        Tuple of (mime_type, extension)
        
    Raises:
        DocumentValidationError: If file type is not allowed
    """
    # Get extension
    extension = None
    for ext in ALLOWED_EXTENSIONS:
        if filename.lower().endswith(ext):
            extension = ext
            break
    
    if not extension:
        raise DocumentValidationError(f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Get MIME type
    if not content_type:
        content_type, _ = mimetypes.guess_type(filename)
    
    if not content_type:
        # Fallback mapping
        mime_map = {
            ".pdf": "application/pdf",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".tiff": "image/tiff",
            ".tif": "image/tiff",
            ".bmp": "image/bmp"
        }
        content_type = mime_map.get(extension, "application/octet-stream")
    
    if content_type not in ALLOWED_MIME_TYPES:
        raise DocumentValidationError(f"MIME type not allowed: {content_type}")
    
    return content_type, extension


def validate_file_size(file_size: int) -> None:
    """
    Validate file size
    
    Args:
        file_size: File size in bytes
        
    Raises:
        DocumentValidationError: If file size exceeds limit
    """
    if file_size > MAX_FILE_SIZE:
        raise DocumentValidationError(
            f"File size ({file_size / 1024 / 1024:.2f} MB) exceeds maximum allowed size ({MAX_FILE_SIZE / 1024 / 1024} MB)"
        )
    
    if file_size == 0:
        raise DocumentValidationError("File is empty")

