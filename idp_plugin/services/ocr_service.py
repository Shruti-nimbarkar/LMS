"""
OCR service for IDP plugin
Uses pdfplumber for text-based PDFs and PaddleOCR for images/scanned PDFs
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import pdfplumber
from PIL import Image
import io
import numpy as np

try:
    from paddleocr import PaddleOCR
    PADDLEOCR_AVAILABLE = True
except ImportError:
    PADDLEOCR_AVAILABLE = False
    PaddleOCR = None

from idp_plugin.models.documents import Document, DocumentStatus
from idp_plugin.models.ocr_outputs import OCROutput
from idp_plugin.models.audit_logs import AuditLog, AuditAction
from idp_plugin.utils.storage import StorageService
from idp_plugin.core.exceptions import OCRProcessingError


class OCRResult:
    """OCR result structure"""
    def __init__(
        self,
        page_number: int,
        text: str,
        ocr_engine: str,
        confidence_score: Optional[float] = None,
        word_count: Optional[int] = None,
        character_count: Optional[int] = None,
        raw_data: Optional[Dict[str, Any]] = None
    ):
        self.page_number = page_number
        self.text = text
        self.ocr_engine = ocr_engine
        self.confidence_score = confidence_score
        self.word_count = word_count
        self.character_count = character_count
        self.raw_data = raw_data or {}


class OCRService:
    """
    OCR service for extracting text from documents
    """
    
    def __init__(self, db: Session, storage_service: Optional[StorageService] = None):
        """
        Initialize OCR service
        
        Args:
            db: Database session
            storage_service: Storage service instance
        """
        self.db = db
        self.storage_service = storage_service or StorageService()
        
        # Initialize PaddleOCR if available
        self.paddleocr = None
        if PADDLEOCR_AVAILABLE:
            try:
                self.paddleocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
            except Exception as e:
                print(f"Warning: PaddleOCR initialization failed: {e}")
    
    def process_document(self, document: Document) -> List[OCRResult]:
        """
        Process document through OCR
        
        Args:
            document: Document object
            
        Returns:
            List of OCRResult objects (one per page)
            
        Raises:
            OCRProcessingError: If OCR processing fails
        """
        try:
            # Update document status
            document.status = DocumentStatus.OCR_PROCESSING
            document.processing_started_at = datetime.utcnow()
            self.db.commit()
            
            # Get file path
            file_path = self.storage_service.get_file_path(document.file_path)
            
            # Determine OCR method based on file type
            if document.file_type == "application/pdf":
                results = self._process_pdf(file_path, document)
            else:
                # Image file
                results = self._process_image(file_path, document)
            
            # Store OCR results
            ocr_outputs = []
            for result in results:
                ocr_output = OCROutput(
                    id=str(uuid.uuid4()),
                    document_id=document.id,
                    page_number=result.page_number,
                    total_pages=len(results),
                    text=result.text,
                    ocr_engine=result.ocr_engine,
                    confidence_score=result.confidence_score,
                    word_count=result.word_count,
                    character_count=result.character_count,
                    raw_data=result.raw_data
                )
                self.db.add(ocr_output)
                ocr_outputs.append(ocr_output)
            
            # Update document
            document.status = DocumentStatus.OCR_COMPLETED
            document.page_count = len(results)
            self.db.commit()
            
            # Create audit log
            self._create_audit_log(
                document_id=document.id,
                action=AuditAction.OCR_COMPLETED,
                metadata={
                    "page_count": len(results),
                    "total_characters": sum(r.character_count or 0 for r in results),
                    "ocr_engines_used": list(set(r.ocr_engine for r in results))
                }
            )
            
            return results
        
        except Exception as e:
            # Update document status to failed
            document.status = DocumentStatus.OCR_FAILED
            document.error_message = str(e)
            self.db.commit()
            
            # Create audit log
            self._create_audit_log(
                document_id=document.id,
                action=AuditAction.OCR_FAILED,
                metadata={"error": str(e)}
            )
            
            raise OCRProcessingError(f"OCR processing failed: {str(e)}")
    
    def _process_pdf(self, file_path: str, document: Document) -> List[OCRResult]:
        """
        Process PDF file
        
        Tries pdfplumber first (for text-based PDFs), falls back to PaddleOCR
        """
        results = []
        
        try:
            # Try pdfplumber first (text-based PDFs)
            with pdfplumber.open(file_path) as pdf:
                total_pages = len(pdf.pages)
                
                for page_num, page in enumerate(pdf.pages, start=1):
                    text = page.extract_text()
                    
                    if text and len(text.strip()) > 0:
                        # Text-based PDF - use pdfplumber result
                        word_count = len(text.split())
                        char_count = len(text)
                        
                        results.append(OCRResult(
                            page_number=page_num,
                            text=text,
                            ocr_engine="pdfplumber",
                            confidence_score=1.0,  # Text-based PDFs have perfect confidence
                            word_count=word_count,
                            character_count=char_count,
                            raw_data={"method": "pdfplumber_text_extraction"}
                        ))
                    else:
                        # Scanned PDF - use PaddleOCR
                        if self.paddleocr:
                            result = self._ocr_page_with_paddleocr(page, page_num)
                            results.append(result)
                        else:
                            # No OCR available - empty result
                            results.append(OCRResult(
                                page_number=page_num,
                                text="",
                                ocr_engine="none",
                                confidence_score=0.0,
                                word_count=0,
                                character_count=0,
                                raw_data={"error": "No OCR engine available for scanned PDF"}
                            ))
        
        except Exception as e:
            # If pdfplumber fails, try PaddleOCR on entire PDF
            if self.paddleocr:
                return self._process_pdf_with_paddleocr(file_path)
            else:
                raise OCRProcessingError(f"PDF processing failed: {str(e)}")
        
        return results
    
    def _process_image(self, file_path: str, document: Document) -> List[OCRResult]:
        """
        Process image file using PaddleOCR
        """
        if not self.paddleocr:
            raise OCRProcessingError("PaddleOCR not available for image processing")
        
        try:
            # Use PaddleOCR
            ocr_result = self.paddleocr.ocr(str(file_path), cls=True)
            
            # Extract text from all detected text regions
            text_lines = []
            confidence_scores = []
            
            if ocr_result and ocr_result[0]:
                for line in ocr_result[0]:
                    if line and len(line) >= 2:
                        text_info = line[1]
                        if text_info:
                            text_lines.append(text_info[0])
                            if len(text_info) > 1:
                                confidence_scores.append(text_info[1])
            
            full_text = "\n".join(text_lines)
            avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
            
            return [OCRResult(
                page_number=1,
                text=full_text,
                ocr_engine="paddleocr",
                confidence_score=avg_confidence,
                word_count=len(full_text.split()),
                character_count=len(full_text),
                raw_data={"paddleocr_result": ocr_result}
            )]
        
        except Exception as e:
            raise OCRProcessingError(f"Image OCR processing failed: {str(e)}")
    
    def _ocr_page_with_paddleocr(self, pdf_page, page_num: int) -> OCRResult:
        """
        OCR a single PDF page using PaddleOCR
        """
        if not self.paddleocr:
            raise OCRProcessingError("PaddleOCR not available")
        
        # Convert PDF page to image
        try:
            # pdfplumber page to image
            page_image = pdf_page.to_image(resolution=300)
            img_array = np.array(page_image.original)
            
            # Run OCR
            ocr_result = self.paddleocr.ocr(img_array, cls=True)
            
            # Extract text
            text_lines = []
            confidence_scores = []
            
            if ocr_result and ocr_result[0]:
                for line in ocr_result[0]:
                    if line and len(line) >= 2:
                        text_info = line[1]
                        if text_info:
                            text_lines.append(text_info[0])
                            if len(text_info) > 1:
                                confidence_scores.append(text_info[1])
            
            full_text = "\n".join(text_lines)
            avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
            
            return OCRResult(
                page_number=page_num,
                text=full_text,
                ocr_engine="paddleocr",
                confidence_score=avg_confidence,
                word_count=len(full_text.split()),
                character_count=len(full_text),
                raw_data={"paddleocr_result": ocr_result}
            )
        
        except Exception as e:
            raise OCRProcessingError(f"Page OCR failed: {str(e)}")
    
    def _process_pdf_with_paddleocr(self, file_path: str) -> List[OCRResult]:
        """
        Process entire PDF with PaddleOCR (fallback method)
        """
        # This is a simplified version - in production, you'd convert PDF pages to images
        # For now, return empty results
        raise OCRProcessingError("PaddleOCR PDF processing not fully implemented")
    
    def _create_audit_log(
        self,
        document_id: str,
        action: AuditAction,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Create an audit log entry"""
        audit_log = AuditLog(
            id=str(uuid.uuid4()),
            document_id=document_id,
            action=action,
            performed_by="system",
            performed_by_type="system",
            audit_metadata=metadata or {}
        )
        self.db.add(audit_log)
        self.db.commit()


