"""
LLM extraction service for IDP plugin
Uses GPT-4.1 for deterministic extraction with schema locking
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime
import uuid
import json
import os
import jsonschema
from openai import OpenAI

from idp_plugin.models.documents import Document, DocumentStatus, DocumentType
from idp_plugin.models.extractions import Extraction
from idp_plugin.models.ocr_outputs import OCROutput
from idp_plugin.models.audit_logs import AuditLog, AuditAction
from idp_plugin.core.exceptions import ExtractionError


class ExtractionService:
    """
    Service for LLM-based extraction
    """
    
    def __init__(self, db: Session):
        """
        Initialize extraction service
        
        Args:
            db: Database session
        """
        self.db = db
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.extraction_model = os.getenv("EXTRACTION_MODEL", "gpt-4.1")
        self.temperature = 0  # Deterministic extraction
    
    def extract_from_document(
        self,
        document: Document,
        document_type: Optional[DocumentType] = None
    ) -> Extraction:
        """
        Extract structured data from document using LLM
        
        Args:
            document: Document object
            document_type: Document type (if not set, uses document.document_type)
            
        Returns:
            Extraction object
            
        Raises:
            ExtractionError: If extraction fails
        """
        try:
            # Determine document type
            doc_type = document_type or document.document_type
            if doc_type == DocumentType.UNKNOWN:
                raise ExtractionError("Document type must be specified for extraction")
            
            # Update document status
            document.status = DocumentStatus.EXTRACTION_PROCESSING
            self.db.commit()
            
            # Get OCR results
            ocr_outputs = self.db.query(OCROutput).filter(
                OCROutput.document_id == document.id
            ).order_by(OCROutput.page_number).all()
            
            if not ocr_outputs:
                raise ExtractionError("No OCR results found for document")
            
            # Combine OCR text
            ocr_text_parts = [
                f"\n\n--- Page {ocr.page_number} ---\n{ocr.text}"
                for ocr in ocr_outputs
            ]
            combined_text = "\n".join(ocr_text_parts)
            
            # Load schema
            schema = self._load_schema(doc_type)
            
            # Load prompt
            prompt = self._load_prompt(doc_type)
            
            # Perform extraction
            extracted_data = self._extract_with_llm(
                ocr_text=combined_text,
                document_type=doc_type,
                schema=schema,
                prompt=prompt
            )
            
            # Validate against schema
            try:
                jsonschema.validate(instance=extracted_data, schema=schema)
                is_valid = "valid"
                validation_errors = None
            except jsonschema.ValidationError as e:
                is_valid = "invalid"
                validation_errors = {"error": str(e), "path": list(e.path)}
            
            # Create extraction record
            extraction = Extraction(
                id=str(uuid.uuid4()),
                document_id=document.id,
                document_type=doc_type.value,
                extraction_model=self.extraction_model,
                extracted_data=extracted_data,
                is_valid=is_valid,
                validation_errors=validation_errors,
                extraction_metadata={
                    "temperature": self.temperature,
                    "schema_version": "1.0",
                    "ocr_pages": len(ocr_outputs)
                }
            )
            
            self.db.add(extraction)
            
            # Update document status
            if is_valid == "valid":
                document.status = DocumentStatus.EXTRACTION_COMPLETED
            else:
                document.status = DocumentStatus.EXTRACTION_FAILED
                document.error_message = f"Schema validation failed: {validation_errors}"
            
            document.processing_completed_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(extraction)
            
            # Create audit log
            self._create_audit_log(
                document_id=document.id,
                extraction_id=extraction.id,
                action=AuditAction.EXTRACTION_COMPLETED if is_valid == "valid" else AuditAction.EXTRACTION_FAILED,
                metadata={
                    "document_type": doc_type.value,
                    "is_valid": is_valid,
                    "validation_errors": validation_errors
                }
            )
            
            return extraction
        
        except Exception as e:
            # Update document status
            document.status = DocumentStatus.EXTRACTION_FAILED
            document.error_message = str(e)
            self.db.commit()
            
            # Create audit log
            self._create_audit_log(
                document_id=document.id,
                action=AuditAction.EXTRACTION_FAILED,
                metadata={"error": str(e)}
            )
            
            raise ExtractionError(f"Extraction failed: {str(e)}")
    
    def _extract_with_llm(
        self,
        ocr_text: str,
        document_type: DocumentType,
        schema: Dict[str, Any],
        prompt: str
    ) -> Dict[str, Any]:
        """
        Perform LLM extraction
        
        Args:
            ocr_text: Combined OCR text
            document_type: Document type
            schema: JSON schema
            prompt: Extraction prompt
            
        Returns:
            Extracted data as dictionary
        """
        # Build system message
        system_message = f"""You are a document extraction system. Extract ONLY explicit values from the document text.
        
Rules:
1. Extract ONLY values that are explicitly stated in the document
2. If a value is not found, use null (not empty string, not "N/A", not assumptions)
3. Do NOT infer, guess, or make assumptions
4. Output valid JSON only
5. Follow the provided JSON schema exactly
6. For arrays, include all items found, or empty array if none found
7. Preserve exact text values as they appear in the document

Schema:
{json.dumps(schema, indent=2)}
"""
        
        # Build user message
        user_message = f"""{prompt}

Document Text:
{ocr_text}

Extract the data and return ONLY valid JSON matching the schema. Use null for missing values."""
        
        try:
            # Call OpenAI API
            response = self.openai_client.chat.completions.create(
                model=self.extraction_model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message}
                ],
                temperature=self.temperature,
                response_format={"type": "json_object"}  # Force JSON output
            )
            
            # Parse response
            content = response.choices[0].message.content
            extracted_data = json.loads(content)
            
            return extracted_data
        
        except json.JSONDecodeError as e:
            raise ExtractionError(f"LLM returned invalid JSON: {str(e)}")
        except Exception as e:
            raise ExtractionError(f"LLM extraction failed: {str(e)}")
    
    def _load_schema(self, document_type: DocumentType) -> Dict[str, Any]:
        """Load JSON schema for document type"""
        schema_files = {
            DocumentType.TRF_JRF: "trf_jrf.json",
            DocumentType.RFQ: "rfq.json",
            DocumentType.CERTIFICATE: "certificate.json",
            DocumentType.CALIBRATION_REPORT: "calibration_report.json"
        }
        
        schema_file = schema_files.get(document_type)
        if not schema_file:
            raise ExtractionError(f"No schema defined for document type: {document_type}")
        
        schema_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "config",
            "schemas",
            schema_file
        )
        
        with open(schema_path, "r") as f:
            return json.load(f)
    
    def _load_prompt(self, document_type: DocumentType) -> str:
        """Load extraction prompt for document type"""
        prompt_files = {
            DocumentType.TRF_JRF: "trf_jrf_prompt.txt",
            DocumentType.RFQ: "rfq_prompt.txt",
            DocumentType.CERTIFICATE: "certificate_prompt.txt",
            DocumentType.CALIBRATION_REPORT: "calibration_report_prompt.txt"
        }
        
        prompt_file = prompt_files.get(document_type)
        if not prompt_file:
            raise ExtractionError(f"No prompt defined for document type: {document_type}")
        
        prompt_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "config",
            "prompts",
            prompt_file
        )
        
        with open(prompt_path, "r") as f:
            return f.read()
    
    def _create_audit_log(
        self,
        document_id: str,
        action: AuditAction,
        extraction_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Create an audit log entry"""
        audit_log = AuditLog(
            id=str(uuid.uuid4()),
            document_id=document_id,
            extraction_id=extraction_id,
            action=action,
            performed_by="system",
            performed_by_type="system",
            audit_metadata=metadata or {}
        )
        self.db.add(audit_log)
        self.db.commit()

