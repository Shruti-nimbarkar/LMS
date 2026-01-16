"""
RAG ingestion service for IDP plugin
Loads knowledge base and schema descriptions, creates embeddings
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import os
import json
import uuid
from openai import OpenAI

from idp_plugin.models.rag_knowledge_vectors import RAGKnowledgeVector
from idp_plugin.models.rag_schema_vectors import RAGSchemaVector
from idp_plugin.core.database import SessionLocal


class RAGIngestionService:
    """
    Service for ingesting knowledge and schema into RAG vector database
    """
    
    def __init__(self, db: Optional[Session] = None):
        """
        Initialize RAG ingestion service
        
        Args:
            db: Database session (optional, creates new if not provided)
        """
        self.db = db or SessionLocal()
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
        self.embedding_dimensions = 1536
    
    def ingest_knowledge_base(self, knowledge_data: List[Dict[str, Any]]) -> int:
        """
        Ingest knowledge base items
        
        Args:
            knowledge_data: List of knowledge items, each with:
                - content_type: "standard", "test_name", "synonym", "domain_knowledge"
                - content_text: The knowledge text
                - source: Source of knowledge (optional)
                - source_version: Version (optional)
                - category: Category for filtering (optional)
                - metadata: Additional metadata (optional)
        
        Returns:
            Number of items ingested
        """
        count = 0
        
        for item in knowledge_data:
            # Create embedding
            embedding = self._create_embedding(item["content_text"])
            
            # Create vector record
            vector = RAGKnowledgeVector(
                id=str(uuid.uuid4()),
                content_type=item["content_type"],
                content_text=item["content_text"],
                embedding=embedding,
                source=item.get("source"),
                source_version=item.get("source_version"),
                category=item.get("category"),
                knowledge_metadata=item.get("metadata", {})
            )
            
            self.db.add(vector)
            count += 1
        
        self.db.commit()
        return count
    
    def ingest_schema_descriptions(self, schema_data: List[Dict[str, Any]]) -> int:
        """
        Ingest schema field descriptions
        
        Args:
            schema_data: List of schema items, each with:
                - document_type: "trf_jrf", "rfq", "certificate", "calibration_report"
                - field_path: JSON path to field (e.g., "customer.name")
                - field_name: Human-readable field name
                - description: Field description
                - data_type: "string", "number", "date", "array", etc. (optional)
                - schema_version: Schema version (optional)
                - is_required: "true" or "false" (optional)
                - validation_rules: Validation rules (optional)
                - metadata: Additional metadata (optional)
        
        Returns:
            Number of items ingested
        """
        count = 0
        
        for item in schema_data:
            # Create description text for embedding
            description_text = self._build_schema_description(item)
            
            # Create embedding
            embedding = self._create_embedding(description_text)
            
            # Create vector record
            vector = RAGSchemaVector(
                id=str(uuid.uuid4()),
                document_type=item["document_type"],
                field_path=item["field_path"],
                field_name=item["field_name"],
                description=item["description"],
                data_type=item.get("data_type"),
                embedding=embedding,
                schema_version=item.get("schema_version"),
                is_required=item.get("is_required", "false"),
                validation_rules=item.get("validation_rules"),
                schema_metadata=item.get("metadata", {})
            )
            
            self.db.add(vector)
            count += 1
        
        self.db.commit()
        return count
    
    def load_from_json_file(self, file_path: str, content_type: str = "knowledge") -> int:
        """
        Load knowledge or schema from JSON file
        
        Args:
            file_path: Path to JSON file
            content_type: "knowledge" or "schema"
        
        Returns:
            Number of items ingested
        """
        with open(file_path, "r") as f:
            data = json.load(f)
        
        if content_type == "knowledge":
            return self.ingest_knowledge_base(data)
        elif content_type == "schema":
            return self.ingest_schema_descriptions(data)
        else:
            raise ValueError(f"Invalid content_type: {content_type}")
    
    def _create_embedding(self, text: str) -> List[float]:
        """
        Create embedding for text
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector (list of floats)
        """
        try:
            response = self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=text,
                dimensions=self.embedding_dimensions
            )
            return response.data[0].embedding
        except Exception as e:
            raise Exception(f"Failed to create embedding: {str(e)}")
    
    def _build_schema_description(self, item: Dict[str, Any]) -> str:
        """
        Build description text for schema field embedding
        
        Args:
            item: Schema item dictionary
            
        Returns:
            Combined description text
        """
        parts = []
        
        # Field name
        parts.append(f"Field: {item['field_name']}")
        
        # Field path
        parts.append(f"Path: {item['field_path']}")
        
        # Description
        parts.append(f"Description: {item['description']}")
        
        # Data type
        if item.get("data_type"):
            parts.append(f"Type: {item['data_type']}")
        
        # Required status
        if item.get("is_required") == "true":
            parts.append("Required: Yes")
        
        # Validation rules
        if item.get("validation_rules"):
            parts.append(f"Validation: {json.dumps(item['validation_rules'])}")
        
        # Metadata (examples, synonyms)
        if item.get("metadata"):
            metadata_str = json.dumps(item['metadata'])
            parts.append(f"Additional info: {metadata_str}")
        
        return " | ".join(parts)
    
    def clear_knowledge_base(self) -> None:
        """Clear all knowledge vectors"""
        self.db.query(RAGKnowledgeVector).delete()
        self.db.commit()
    
    def clear_schema_vectors(self) -> None:
        """Clear all schema vectors"""
        self.db.query(RAGSchemaVector).delete()
        self.db.commit()


