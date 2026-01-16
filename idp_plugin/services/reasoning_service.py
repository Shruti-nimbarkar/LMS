"""
Reasoning service for IDP plugin
Uses GPT-4.1-mini with RAG context for normalization, validation, and mapping suggestions
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import os
import json
from openai import OpenAI

from idp_plugin.services.rag_retrieval_service import RAGRetrievalService
from idp_plugin.models.extractions import Extraction


class ReasoningService:
    """
    Service for reasoning over extracted data with RAG context
    NEVER writes to DB, NEVER modifies extracted values
    Returns suggestions and reasoning only
    """
    
    def __init__(self, db: Session):
        """
        Initialize reasoning service
        
        Args:
            db: Database session
        """
        self.db = db
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.reasoning_model = os.getenv("REASONING_MODEL", "gpt-4.1-mini")
        self.rag_service = RAGRetrievalService(db)
    
    def normalize_field(
        self,
        field_value: str,
        field_path: str,
        document_type: str,
        extraction: Extraction
    ) -> Dict[str, Any]:
        """
        Normalize a field value using RAG context
        
        Args:
            field_value: Extracted field value
            field_path: JSON path to field
            document_type: Document type
            extraction: Extraction object
        
        Returns:
            Dictionary with normalization suggestions and reasoning
        """
        # Retrieve RAG context
        rag_context = self.rag_service.retrieve_for_field(
            field_value=field_value,
            field_path=field_path,
            document_type=document_type,
            query_intent="normalize"
        )
        
        # Build prompt
        prompt = self._build_normalization_prompt(
            field_value=field_value,
            field_path=field_path,
            rag_context=rag_context
        )
        
        # Call LLM
        response = self._call_reasoning_llm(prompt, task="normalize")
        
        return {
            "original_value": field_value,
            "suggested_normalized_value": response.get("normalized_value"),
            "confidence": response.get("confidence"),
            "reasoning": response.get("reasoning"),
            "alternatives": response.get("alternatives", []),
            "rag_context_used": {
                "knowledge_sources": [k["source"] for k in rag_context["knowledge"]],
                "schema_fields_referenced": [s["field_path"] for s in rag_context["schema"]]
            }
        }
    
    def validate_field(
        self,
        field_value: str,
        field_path: str,
        document_type: str,
        extraction: Extraction
    ) -> Dict[str, Any]:
        """
        Validate a field value using RAG context
        
        Args:
            field_value: Extracted field value
            field_path: JSON path to field
            document_type: Document type
            extraction: Extraction object
        
        Returns:
            Dictionary with validation results and reasoning
        """
        # Retrieve RAG context
        rag_context = self.rag_service.retrieve_for_field(
            field_value=field_value,
            field_path=field_path,
            document_type=document_type,
            query_intent="validate"
        )
        
        # Build prompt
        prompt = self._build_validation_prompt(
            field_value=field_value,
            field_path=field_path,
            rag_context=rag_context
        )
        
        # Call LLM
        response = self._call_reasoning_llm(prompt, task="validate")
        
        return {
            "field_value": field_value,
            "is_valid": response.get("is_valid"),
            "validation_errors": response.get("validation_errors", []),
            "suggestions": response.get("suggestions", []),
            "reasoning": response.get("reasoning"),
            "rag_context_used": {
                "knowledge_sources": [k["source"] for k in rag_context["knowledge"]],
                "schema_fields_referenced": [s["field_path"] for s in rag_context["schema"]]
            }
        }
    
    def suggest_field_mapping(
        self,
        field_path: str,
        field_value: Any,
        document_type: str,
        target_schema: str,
        extraction: Extraction
    ) -> Dict[str, Any]:
        """
        Suggest field mapping to target schema
        
        Args:
            field_path: Source field path
            field_value: Source field value
            document_type: Document type
            target_schema: Target schema identifier (e.g., "LMS")
            extraction: Extraction object
        
        Returns:
            Dictionary with mapping suggestions and reasoning
        """
        # Retrieve RAG context
        rag_context = self.rag_service.retrieve_for_field(
            field_value=str(field_value),
            field_path=field_path,
            document_type=document_type,
            query_intent="map"
        )
        
        # Build prompt
        prompt = self._build_mapping_prompt(
            field_path=field_path,
            field_value=field_value,
            target_schema=target_schema,
            rag_context=rag_context
        )
        
        # Call LLM
        response = self._call_reasoning_llm(prompt, task="map")
        
        return {
            "source_field": field_path,
            "source_value": field_value,
            "target_field": response.get("target_field"),
            "target_value": response.get("target_value"),
            "mapping_confidence": response.get("confidence"),
            "reasoning": response.get("reasoning"),
            "alternatives": response.get("alternatives", []),
            "rag_context_used": {
                "knowledge_sources": [k["source"] for k in rag_context["knowledge"]],
                "schema_fields_referenced": [s["field_path"] for s in rag_context["schema"]]
            }
        }
    
    def analyze_extraction(
        self,
        extraction: Extraction
    ) -> Dict[str, Any]:
        """
        Analyze entire extraction and provide suggestions
        
        Args:
            extraction: Extraction object
        
        Returns:
            Dictionary with analysis results
        """
        extracted_data = extraction.extracted_data
        document_type = extraction.document_type
        
        # Analyze each field
        field_analyses = []
        
        def analyze_nested(data: Any, path: str = ""):
            """Recursively analyze nested data"""
            if isinstance(data, dict):
                for key, value in data.items():
                    current_path = f"{path}.{key}" if path else key
                    if isinstance(value, (dict, list)):
                        analyze_nested(value, current_path)
                    else:
                        if value is not None:
                            # Normalize
                            norm_result = self.normalize_field(
                                field_value=str(value),
                                field_path=current_path,
                                document_type=document_type,
                                extraction=extraction
                            )
                            
                            # Validate
                            val_result = self.validate_field(
                                field_value=str(value),
                                field_path=current_path,
                                document_type=document_type,
                                extraction=extraction
                            )
                            
                            field_analyses.append({
                                "field_path": current_path,
                                "value": value,
                                "normalization": norm_result,
                                "validation": val_result
                            })
            elif isinstance(data, list):
                for idx, item in enumerate(data):
                    current_path = f"{path}[{idx}]"
                    analyze_nested(item, current_path)
        
        analyze_nested(extracted_data)
        
        return {
            "extraction_id": extraction.id,
            "document_type": document_type,
            "field_count": len(field_analyses),
            "field_analyses": field_analyses,
            "summary": {
                "total_fields": len(field_analyses),
                "fields_needing_normalization": sum(
                    1 for f in field_analyses
                    if f["normalization"]["suggested_normalized_value"] != f["normalization"]["original_value"]
                ),
                "fields_with_validation_issues": sum(
                    1 for f in field_analyses
                    if not f["validation"]["is_valid"]
                )
            }
        }
    
    def _build_normalization_prompt(
        self,
        field_value: str,
        field_path: str,
        rag_context: Dict[str, Any]
    ) -> str:
        """Build prompt for normalization"""
        knowledge_text = "\n".join([
            f"- {k['content']} (Source: {k['source']})"
            for k in rag_context["knowledge"]
        ])
        
        schema_text = "\n".join([
            f"- {s['field_name']} ({s['field_path']}): {s['description']}"
            for s in rag_context["schema"]
        ])
        
        return f"""Normalize the following field value using the provided knowledge base and schema context.

Field Path: {field_path}
Field Value: {field_value}

Knowledge Base Context:
{knowledge_text}

Schema Context:
{schema_text}

Provide:
1. Normalized value (if normalization is needed, otherwise return original)
2. Confidence score (0-1)
3. Reasoning for normalization
4. Alternative normalized forms (if any)

Return JSON with keys: normalized_value, confidence, reasoning, alternatives"""
    
    def _build_validation_prompt(
        self,
        field_value: str,
        field_path: str,
        rag_context: Dict[str, Any]
    ) -> str:
        """Build prompt for validation"""
        knowledge_text = "\n".join([
            f"- {k['content']} (Source: {k['source']})"
            for k in rag_context["knowledge"]
        ])
        
        schema_text = "\n".join([
            f"- {s['field_name']} ({s['field_path']}): {s['description']}"
            for s in rag_context["schema"]
        ])
        
        return f"""Validate the following field value using the provided knowledge base and schema context.

Field Path: {field_path}
Field Value: {field_value}

Knowledge Base Context:
{knowledge_text}

Schema Context:
{schema_text}

Provide:
1. Is valid (true/false)
2. Validation errors (if any)
3. Suggestions for correction (if invalid)
4. Reasoning

Return JSON with keys: is_valid, validation_errors, suggestions, reasoning"""
    
    def _build_mapping_prompt(
        self,
        field_path: str,
        field_value: Any,
        target_schema: str,
        rag_context: Dict[str, Any]
    ) -> str:
        """Build prompt for mapping"""
        knowledge_text = "\n".join([
            f"- {k['content']} (Source: {k['source']})"
            for k in rag_context["knowledge"]
        ])
        
        return f"""Suggest a mapping for the following field to the target schema.

Source Field: {field_path}
Source Value: {field_value}
Target Schema: {target_schema}

Knowledge Base Context:
{knowledge_text}

Provide:
1. Target field path
2. Mapped value (if transformation needed)
3. Mapping confidence (0-1)
4. Reasoning
5. Alternative mappings (if any)

Return JSON with keys: target_field, target_value, confidence, reasoning, alternatives"""
    
    def _call_reasoning_llm(self, prompt: str, task: str) -> Dict[str, Any]:
        """
        Call reasoning LLM
        
        Args:
            prompt: Prompt text
            task: Task type ("normalize", "validate", "map")
        
        Returns:
            Response dictionary
        """
        system_message = f"""You are a reasoning assistant for document processing.
Your role is to provide suggestions and reasoning based on knowledge base context.
You MUST NOT modify or change extracted values - only provide suggestions.

Task: {task}

Rules:
1. Provide suggestions only, not definitive changes
2. Include confidence scores
3. Explain reasoning clearly
4. Return valid JSON only"""
        
        try:
            response = self.openai_client.chat.completions.create(
                model=self.reasoning_model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Slightly higher than extraction for reasoning
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        
        except Exception as e:
            return {
                "error": str(e),
                "normalized_value" if task == "normalize" else "is_valid" if task == "validate" else "target_field": None,
                "confidence": 0.0,
                "reasoning": f"LLM call failed: {str(e)}"
            }





