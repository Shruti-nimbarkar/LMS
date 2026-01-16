"""
Chat API Endpoints
FastAPI endpoints for chatbot functionality
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from ...chatbot_service import ChatbotService
from ...tools.base import UserContext, ToolProvider

router = APIRouter()


# Request/Response Models
class ChatMessageRequest(BaseModel):
    content: str
    session_id: str
    context: Dict[str, Any]


class ChatMessageResponse(BaseModel):
    message: str
    session_id: str
    suggestions: Optional[List[str]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class CreateSessionRequest(BaseModel):
    user_id: str


class CreateSessionResponse(BaseModel):
    session_id: str
    created_at: datetime


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[Dict[str, Any]]


# Dependency to get chatbot service
def get_chatbot_service() -> ChatbotService:
    """Get chatbot service instance"""
    # This should be injected from main app
    # For now, return None - will be set by main app
    return None


# Dependency to get tool provider
def get_tool_provider() -> ToolProvider:
    """Get tool provider instance"""
    # This should be injected from main app
    return None


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest,
    chatbot_service: ChatbotService = Depends(get_chatbot_service),
    tool_provider: ToolProvider = Depends(get_tool_provider)
):
    """Send a message to the chatbot"""
    if not chatbot_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chatbot service not configured"
        )
    
    # Convert context to UserContext
    context = request.context
    user_context = UserContext(
        user_id=context.get("userId", ""),
        user_role=context.get("userRole", ""),
        permissions=context.get("permissions", []),
        current_page=context.get("currentPage"),
        extra=context
    )
    
    # Process message
    response = await chatbot_service.process_message(
        message=request.content,
        session_id=request.session_id,
        user_context=user_context
    )
    
    return ChatMessageResponse(**response)


@router.post("/session", response_model=CreateSessionResponse)
async def create_session(
    request: CreateSessionRequest
):
    """Create a new chat session"""
    import uuid
    session_id = f"session_{uuid.uuid4().hex[:12]}"
    
    return CreateSessionResponse(
        session_id=session_id,
        created_at=datetime.utcnow()
    )


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str
):
    """Get chat history for a session"""
    # TODO: Implement history retrieval from database
    # For now, return empty history
    return ChatHistoryResponse(
        session_id=session_id,
        messages=[]
    )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "chatbot"}

