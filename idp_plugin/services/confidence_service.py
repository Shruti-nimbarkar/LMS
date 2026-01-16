"""
Confidence scoring service for IDP plugin
Calculates field-level confidence scores
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
import uuid
from datetime import datetime

from idp_plugin.models.extractions import Extraction
from idp_plugin.models.field_confidence import FieldConfidence
from idp_plugin.models.ocr_outputs import OCROutput
from idp_plugin.services.rag_retrieval_service import RAGRetrievalService


class ConfidenceService:
    """
    Service for calculating field-level confidence scores
    Formula: confidence = (OCR * 0.3) + (LLM * 0.4) + (RAG * 0.3)
    """
    
    def __init__(self, db: Session):
        """
        Initialize confidence service
        
        Args:
            db: Database session
        """
        self.db = db
        self.rag_service = RAGRetrievalService(db)
        
        # Weights for confidence calculation
        self.ocr_weight = 0.3
        self.llm_weight = 0.4
        self.rag_weight = 0.3
    
    def calculate_confidence_for_extraction(self, extraction: Extraction) -> List[FieldConfidence]:
        """
        Calculate confidence scores for all fields in an extraction
        
        Args:
            extraction: Extraction object
        
        Returns:
            List of FieldConfidence objects
        """
        # Get OCR outputs for document
        ocr_outputs = self.db.query(OCROutput).filter(
            OCROutput.document_id == extraction.document_id
        ).all()
        
        # Calculate OCR quality signal (average confidence across all pages)
        ocr_quality = self._calculate_ocr_quality(ocr_outputs)
        
        # Extract all fields from extraction data
        fields = self._extract_all_fields(extraction.extracted_data)
        
        # Calculate confidence for each field
        confidence_records = []
        
        for field_path, field_value in fields:
            if field_value is None:
                continue  # Skip null values
            
            # Calculate OCR confidence
            ocr_confidence = self._calculate_ocr_confidence(
                field_value=str(field_value),
                ocr_outputs=ocr_outputs,
                base_quality=ocr_quality
            )
            
            # Calculate LLM confidence (extraction certainty)
            llm_confidence = self._calculate_llm_confidence(
                field_value=str(field_value),
                extraction=extraction
            )
            
            # Calculate RAG confidence (similarity score)
            rag_confidence = self._calculate_rag_confidence(
                field_value=str(field_value),
                field_path=field_path,
                document_type=extraction.document_type
            )
            
            # Calculate overall confidence
            overall_confidence = (
                ocr_confidence * self.ocr_weight +
                llm_confidence * self.llm_weight +
                rag_confidence * self.rag_weight
            )
            
            # Create confidence record
            confidence_record = FieldConfidence(
                id=str(uuid.uuid4()),
                extraction_id=extraction.id,
                field_path=field_path,
                field_name=self._get_field_name(field_path),
                ocr_confidence=ocr_confidence,
                llm_confidence=llm_confidence,
                rag_confidence=rag_confidence,
                overall_confidence=overall_confidence,
                confidence_metadata={
                    "ocr_weight": self.ocr_weight,
                    "llm_weight": self.llm_weight,
                    "rag_weight": self.rag_weight,
                    "calculation_method": "weighted_average"
                }
            )
            
            self.db.add(confidence_record)
            confidence_records.append(confidence_record)
        
        self.db.commit()
        return confidence_records
    
    def _calculate_ocr_quality(self, ocr_outputs: List[OCROutput]) -> float:
        """
        Calculate overall OCR quality signal
        
        Args:
            ocr_outputs: List of OCR output objects
        
        Returns:
            Average OCR quality (0-1)
        """
        if not ocr_outputs:
            return 0.0
        
        # Average confidence scores
        confidences = [
            ocr.confidence_score
            for ocr in ocr_outputs
            if ocr.confidence_score is not None
        ]
        
        if not confidences:
            return 0.5  # Default if no confidence scores
        
        return sum(confidences) / len(confidences)
    
    def _calculate_ocr_confidence(
        self,
        field_value: str,
        ocr_outputs: List[OCROutput],
        base_quality: float
    ) -> float:
        """
        Calculate OCR confidence for a specific field value
        
        Args:
            field_value: Field value to check
            ocr_outputs: List of OCR output objects
            base_quality: Base OCR quality signal
        
        Returns:
            OCR confidence (0-1)
        """
        # Check if field value appears in OCR text
        field_lower = field_value.lower()
        
        found_in_ocr = False
        max_similarity = 0.0
        
        for ocr in ocr_outputs:
            ocr_text_lower = ocr.text.lower()
            
            # Exact match
            if field_lower in ocr_text_lower:
                found_in_ocr = True
                max_similarity = max(max_similarity, 1.0)
            
            # Partial match (simple word overlap)
            field_words = set(field_lower.split())
            ocr_words = set(ocr_text_lower.split())
            
            if field_words and ocr_words:
                overlap = len(field_words & ocr_words) / len(field_words)
                max_similarity = max(max_similarity, overlap)
        
        # Combine base quality with field-specific match
        if found_in_ocr:
            return min(1.0, base_quality + 0.2)
        else:
            # If not found, use base quality but reduce it
            return base_quality * 0.7
    
    def _calculate_llm_confidence(
        self,
        field_value: str,
        extraction: Extraction
    ) -> float:
        """
        Calculate LLM extraction confidence
        
        Args:
            field_value: Field value
            extraction: Extraction object
        
        Returns:
            LLM confidence (0-1)
        """
        # For now, use a default confidence based on extraction metadata
        # In production, this could use LLM token probabilities or other signals
        
        # Check if extraction is valid
        if extraction.is_valid == "valid":
            base_confidence = 0.8
        elif extraction.is_valid == "invalid":
            base_confidence = 0.4
        else:
            base_confidence = 0.6
        
        # Adjust based on field value characteristics
        if not field_value or field_value.strip() == "":
            return 0.0
        
        # Higher confidence for structured values (dates, numbers, etc.)
        if self._is_structured_value(field_value):
            return min(1.0, base_confidence + 0.1)
        
        return base_confidence
    
    def _calculate_rag_confidence(
        self,
        field_value: str,
        field_path: str,
        document_type: str
    ) -> float:
        """
        Calculate RAG similarity confidence
        
        Args:
            field_value: Field value
            field_path: Field path
            document_type: Document type
        
        Returns:
            RAG confidence (0-1)
        """
        # Retrieve RAG context
        rag_results = self.rag_service.retrieve_for_field(
            field_value=field_value,
            field_path=field_path,
            document_type=document_type,
            query_intent="normalize"
        )
        
        # Use maximum similarity from knowledge and schema
        max_similarity = 0.0
        
        # Knowledge similarity
        for knowledge in rag_results["knowledge"]:
            max_similarity = max(max_similarity, knowledge["similarity"])
        
        # Schema similarity
        for schema in rag_results["schema"]:
            max_similarity = max(max_similarity, schema["similarity"])
        
        return max_similarity
    
    def _extract_all_fields(self, data: Any, path: str = "") -> List[tuple]:
        """
        Recursively extract all fields from nested data
        
        Args:
            data: Data to extract fields from
            path: Current path prefix
        
        Returns:
            List of (field_path, field_value) tuples
        """
        fields = []
        
        if isinstance(data, dict):
            for key, value in data.items():
                current_path = f"{path}.{key}" if path else key
                if isinstance(value, (dict, list)):
                    fields.extend(self._extract_all_fields(value, current_path))
                else:
                    fields.append((current_path, value))
        elif isinstance(data, list):
            for idx, item in enumerate(data):
                current_path = f"{path}[{idx}]"
                if isinstance(item, (dict, list)):
                    fields.extend(self._extract_all_fields(item, current_path))
                else:
                    fields.append((current_path, item))
        
        return fields
    
    def _get_field_name(self, field_path: str) -> str:
        """
        Get human-readable field name from path
        
        Args:
            field_path: JSON path to field
        
        Returns:
            Human-readable field name
        """
        # Extract last part of path
        parts = field_path.split(".")
        last_part = parts[-1]
        
        # Remove array indices
        last_part = last_part.split("[")[0]
        
        # Convert snake_case to Title Case
        return last_part.replace("_", " ").title()
    
    def _is_structured_value(self, value: str) -> bool:
        """
        Check if value appears to be structured (date, number, etc.)
        
        Args:
            value: Value to check
        
        Returns:
            True if structured, False otherwise
        """
        # Check for date patterns
        if any(char.isdigit() for char in value) and any(char in value for char in ["-", "/", "."]):
            return True
        
        # Check for number patterns
        try:
            float(value.replace(",", ""))
            return True
        except ValueError:
            pass
        
        return False
    
    def get_confidence_summary(self, extraction: Extraction) -> Dict[str, Any]:
        """
        Get confidence summary for an extraction
        
        Args:
            extraction: Extraction object
        
        Returns:
            Summary dictionary
        """
        confidence_records = self.db.query(FieldConfidence).filter(
            FieldConfidence.extraction_id == extraction.id
        ).all()
        
        if not confidence_records:
            return {
                "extraction_id": extraction.id,
                "total_fields": 0,
                "average_confidence": 0.0,
                "confidence_distribution": {}
            }
        
        confidences = [c.overall_confidence for c in confidence_records]
        
        # Distribution buckets
        high_confidence = sum(1 for c in confidences if c >= 0.8)
        medium_confidence = sum(1 for c in confidences if 0.5 <= c < 0.8)
        low_confidence = sum(1 for c in confidences if c < 0.5)
        
        return {
            "extraction_id": extraction.id,
            "total_fields": len(confidence_records),
            "average_confidence": sum(confidences) / len(confidences),
            "min_confidence": min(confidences),
            "max_confidence": max(confidences),
            "confidence_distribution": {
                "high": high_confidence,
                "medium": medium_confidence,
                "low": low_confidence
            },
            "fields_below_threshold": [
                {
                    "field_path": c.field_path,
                    "confidence": c.overall_confidence
                }
                for c in confidence_records
                if c.overall_confidence < 0.5
            ]
        }





