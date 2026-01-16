"""
Custom exceptions for IDP plugin
"""


class IDPException(Exception):
    """Base exception for IDP plugin"""
    pass


class DocumentValidationError(IDPException):
    """Raised when document validation fails"""
    pass


class OCRProcessingError(IDPException):
    """Raised when OCR processing fails"""
    pass


class ExtractionError(IDPException):
    """Raised when extraction fails"""
    pass


class MappingError(IDPException):
    """Raised when mapping fails"""
    pass


class StorageError(IDPException):
    """Raised when file storage operations fail"""
    pass





