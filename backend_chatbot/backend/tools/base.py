"""
Base Tool Classes
Abstract base classes for chatbot tools
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class UserContext(BaseModel):
    """User context passed to tools"""
    user_id: str
    user_role: str
    permissions: List[str] = []
    current_page: Optional[str] = None
    extra: Dict[str, Any] = {}


class Tool(ABC):
    """Base class for chatbot tools"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    @abstractmethod
    def execute(self, params: Dict[str, Any], user_context: UserContext) -> Any:
        """Execute the tool with given parameters"""
        pass
    
    def get_schema(self) -> Dict[str, Any]:
        """Get tool schema for LLM"""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self._get_parameters_schema()
        }
    
    @abstractmethod
    def _get_parameters_schema(self) -> Dict[str, Any]:
        """Get parameters schema for this tool"""
        pass


class ToolProvider(ABC):
    """Abstract base class for providing tools to chatbot"""
    
    @abstractmethod
    def get_tools(self, user_context: UserContext) -> List[Tool]:
        """Return list of tools available to chatbot for this user"""
        pass

