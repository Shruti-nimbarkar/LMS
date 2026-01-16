"""
Configuration for IDP plugin
"""

import os
from typing import Optional


class IDPConfig:
    """IDP plugin configuration"""
    
    # Database
    # For quick testing, use SQLite: "sqlite:///./idp_test.db"
    # For production, use PostgreSQL: "postgresql://user:password@localhost:5432/idp_db"
    DATABASE_URL: str = os.getenv("IDP_DATABASE_URL", "sqlite:///./idp_test.db")
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    EXTRACTION_MODEL: str = os.getenv("EXTRACTION_MODEL", "gpt-4.1")
    REASONING_MODEL: str = os.getenv("REASONING_MODEL", "gpt-4.1-mini")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    
    # Storage
    STORAGE_PATH: str = os.getenv("IDP_STORAGE_PATH", "./idp_storage")
    
    # Processing
    EXTRACTION_TEMPERATURE: float = 0.0  # Deterministic
    REASONING_TEMPERATURE: float = 0.3
    
    # Timeouts
    OCR_TIMEOUT: int = int(os.getenv("IDP_OCR_TIMEOUT", "300"))  # 5 minutes
    EXTRACTION_TIMEOUT: int = int(os.getenv("IDP_EXTRACTION_TIMEOUT", "120"))  # 2 minutes
    LLM_TIMEOUT: int = int(os.getenv("IDP_LLM_TIMEOUT", "60"))  # 1 minute
    
    # Confidence weights
    OCR_WEIGHT: float = 0.3
    LLM_WEIGHT: float = 0.4
    RAG_WEIGHT: float = 0.3
    
    # File limits
    MAX_FILE_SIZE: int = int(os.getenv("IDP_MAX_FILE_SIZE", str(50 * 1024 * 1024)))  # 50MB
    
    # RAG
    RAG_TOP_K: int = int(os.getenv("IDP_RAG_TOP_K", "5"))
    
    # Error handling
    LLM_RETRY_ATTEMPTS: int = int(os.getenv("IDP_LLM_RETRY_ATTEMPTS", "3"))
    LLM_RETRY_DELAY: int = int(os.getenv("IDP_LLM_RETRY_DELAY", "2"))  # seconds


