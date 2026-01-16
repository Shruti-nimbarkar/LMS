"""
RAG retrieval service for IDP plugin
Retrieves relevant knowledge and schema chunks based on queries
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy import func
import numpy as np
from openai import OpenAI
import os

from idp_plugin.models.rag_knowledge_vectors import RAGKnowledgeVector
from idp_plugin.models.rag_schema_vectors import RAGSchemaVector


class RAGRetrievalService:
    """
    Service for retrieving relevant knowledge and schema using vector similarity
    """
    
    def __init__(self, db: Session):
        """
        Initialize RAG retrieval service
        
        Args:
            db: Database session
        """
        self.db = db
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
        self.embedding_dimensions = 1536
        self.default_top_k = 5
    
    def retrieve_knowledge(
        self,
        query: str,
        content_type: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = None
    ) -> List[Tuple[RAGKnowledgeVector, float]]:
        """
        Retrieve relevant knowledge chunks
        
        Args:
            query: Query text
            content_type: Filter by content type (optional)
            category: Filter by category (optional)
            top_k: Number of results to return (default: 5)
        
        Returns:
            List of tuples (RAGKnowledgeVector, similarity_score)
        """
        top_k = top_k or self.default_top_k
        
        # Create query embedding
        query_embedding = self._create_embedding(query)
        
        # Build query
        query_obj = self.db.query(RAGKnowledgeVector)
        
        # Apply filters
        if content_type:
            query_obj = query_obj.filter(RAGKnowledgeVector.content_type == content_type)
        if category:
            query_obj = query_obj.filter(RAGKnowledgeVector.category == category)
        
        # Get all candidates
        candidates = query_obj.all()
        
        # Calculate cosine similarity
        results = []
        for candidate in candidates:
            similarity = self._cosine_similarity(query_embedding, candidate.embedding)
            results.append((candidate, similarity))
        
        # Sort by similarity (descending) and return top_k
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]
    
    def retrieve_schema(
        self,
        query: str,
        document_type: Optional[str] = None,
        top_k: int = None
    ) -> List[Tuple[RAGSchemaVector, float]]:
        """
        Retrieve relevant schema field descriptions
        
        Args:
            query: Query text
            document_type: Filter by document type (optional)
            top_k: Number of results to return (default: 5)
        
        Returns:
            List of tuples (RAGSchemaVector, similarity_score)
        """
        top_k = top_k or self.default_top_k
        
        # Create query embedding
        query_embedding = self._create_embedding(query)
        
        # Build query
        query_obj = self.db.query(RAGSchemaVector)
        
        # Apply filters
        if document_type:
            query_obj = query_obj.filter(RAGSchemaVector.document_type == document_type)
        
        # Get all candidates
        candidates = query_obj.all()
        
        # Calculate cosine similarity
        results = []
        for candidate in candidates:
            similarity = self._cosine_similarity(query_embedding, candidate.embedding)
            results.append((candidate, similarity))
        
        # Sort by similarity (descending) and return top_k
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]
    
    def retrieve_for_field(
        self,
        field_value: str,
        field_path: str,
        document_type: str,
        query_intent: str = "normalize"
    ) -> Dict[str, Any]:
        """
        Retrieve relevant context for a field value
        
        Args:
            field_value: Extracted field value
            field_path: JSON path to field
            document_type: Document type
            query_intent: "normalize", "map", or "validate"
        
        Returns:
            Dictionary with knowledge and schema results
        """
        # Build query based on intent
        if query_intent == "normalize":
            query = f"Normalize or standardize: {field_value} for field {field_path}"
        elif query_intent == "map":
            query = f"Map field {field_path} with value {field_value} to target schema"
        elif query_intent == "validate":
            query = f"Validate field {field_path} with value {field_value}"
        else:
            query = f"{field_value} {field_path}"
        
        # Retrieve knowledge
        knowledge_results = self.retrieve_knowledge(
            query=query,
            top_k=3
        )
        
        # Retrieve schema
        schema_results = self.retrieve_schema(
            query=query,
            document_type=document_type,
            top_k=3
        )
        
        return {
            "knowledge": [
                {
                    "content": result[0].content_text,
                    "content_type": result[0].content_type,
                    "similarity": result[1],
                    "source": result[0].source,
                    "metadata": result[0].knowledge_metadata
                }
                for result in knowledge_results
            ],
            "schema": [
                {
                    "field_path": result[0].field_path,
                    "field_name": result[0].field_name,
                    "description": result[0].description,
                    "similarity": result[1],
                    "data_type": result[0].data_type,
                    "validation_rules": result[0].validation_rules,
                    "metadata": result[0].schema_metadata
                }
                for result in schema_results
            ]
        }
    
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
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors
        
        Args:
            vec1: First vector
            vec2: Second vector
        
        Returns:
            Cosine similarity score (0-1)
        """
        vec1_array = np.array(vec1)
        vec2_array = np.array(vec2)
        
        dot_product = np.dot(vec1_array, vec2_array)
        norm1 = np.linalg.norm(vec1_array)
        norm2 = np.linalg.norm(vec2_array)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))


