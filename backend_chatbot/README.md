# Chatbot Backend Module

Modular chatbot backend service that can be integrated into any FastAPI application.

## Installation

```bash
pip install langchain langchain-openai openai fastapi
```

## Usage

### 1. Create Tool Provider

```python
from chatbot_service.tools.base import ToolProvider, Tool, UserContext
from typing import List, Dict, Any

class MyToolProvider(ToolProvider):
    def get_tools(self, user_context: UserContext) -> List[Tool]:
        return [
            QueryProjectsTool(self.db, user_context),
            QueryTestPlansTool(self.db, user_context),
            # ... other tools
        ]
```

### 2. Initialize Chatbot Service

```python
from chatbot_service.chatbot_service import ChatbotService

tool_provider = MyToolProvider(db)
chatbot_service = ChatbotService(
    tool_provider=tool_provider,
    llm_config={
        "provider": "openai",
        "model": "gpt-4-turbo-preview",
        "api_key": os.getenv("OPENAI_API_KEY"),
        "temperature": 0
    }
)
```

### 3. Include Routes in FastAPI App

```python
from fastapi import FastAPI
from chatbot_service.api.endpoints import chat

app = FastAPI()

# Set chatbot service (dependency injection)
app.state.chatbot_service = chatbot_service
app.state.tool_provider = tool_provider

# Include routes
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
```

## Creating Custom Tools

```python
from chatbot_service.tools.base import Tool, UserContext
from typing import Dict, Any

class QueryProjectsTool(Tool):
    def __init__(self, db, user_context: UserContext):
        super().__init__(
            name="query_projects",
            description="Query projects from the database. Can filter by status, customer, date range, etc."
        )
        self.db = db
    
    def execute(self, params: Dict[str, Any], user_context: UserContext) -> Any:
        # Implement query logic
        # Respect user permissions
        # Return results
        pass
    
    def _get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "status": {"type": "string", "description": "Filter by project status"},
                "customer_id": {"type": "integer", "description": "Filter by customer ID"},
            },
            "required": []
        }
```

