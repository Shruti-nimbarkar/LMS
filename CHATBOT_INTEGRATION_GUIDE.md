# Chatbot Integration Guide

## Quick Start

The chatbot has been created as a modular, pluggable component according to the modular architecture. Here's how to use it:

### Frontend Integration (Already Done)

The chatbot widget is already integrated into the main app in `src/App.jsx`. It will appear as a floating button in the bottom-right corner.

### Configuration

Set these environment variables in your `.env` file:

```bash
# Chatbot API URL (FastAPI backend)
VITE_CHATBOT_API_URL=http://localhost:8000/api/v1/chat

# Enable/disable chatbot (optional, defaults to true)
VITE_CHATBOT_ENABLED=true
```

### Using the Chatbot

1. **Floating Button**: Click the chat icon in the bottom-right corner
2. **Chat Window**: Opens a chat interface
3. **Send Messages**: Type your question and press Enter
4. **Actions**: Chatbot can trigger actions like navigation

---

## Backend Setup (FastAPI)

### 1. Install Dependencies

```bash
cd backend_chatbot
pip install fastapi uvicorn langchain langchain-openai openai sqlalchemy
```

### 2. Create Tool Provider

Create `backend/app/tools/lms_tool_provider.py`:

```python
from backend_chatbot.app.tools.base import ToolProvider, Tool, UserContext
from typing import List
from sqlalchemy.orm import Session

class QueryProjectsTool(Tool):
    def __init__(self, db: Session, user_context: UserContext):
        super().__init__(
            name="query_projects",
            description="Query projects from the database. Can filter by status, customer, date range."
        )
        self.db = db
        self.user_context = user_context
    
    def execute(self, params: dict, user_context: UserContext):
        # Implement query logic
        from app.models.project import Project
        query = self.db.query(Project)
        
        if params.get("status"):
            query = query.filter(Project.status == params["status"])
        if params.get("customer_id"):
            query = query.filter(Project.client_id == params["customer_id"])
        
        projects = query.all()
        return [{"id": p.id, "name": p.name, "status": p.status} for p in projects]
    
    def _get_parameters_schema(self):
        return {
            "type": "object",
            "properties": {
                "status": {"type": "string"},
                "customer_id": {"type": "integer"},
            }
        }

class LMSToolProvider(ToolProvider):
    def __init__(self, db: Session):
        self.db = db
    
    def get_tools(self, user_context: UserContext) -> List[Tool]:
        return [
            QueryProjectsTool(self.db, user_context),
            # Add more tools here
        ]
```

### 3. Integrate in Main FastAPI App

In your main FastAPI app (`backend/app/main.py`):

```python
from fastapi import FastAPI
from backend_chatbot.app.chatbot_service import ChatbotService
from backend_chatbot.app.api.endpoints.chat import router as chat_router
from app.tools.lms_tool_provider import LMSToolProvider
from app.database import get_db

app = FastAPI()

# Initialize chatbot service
tool_provider = LMSToolProvider(get_db())
chatbot_service = ChatbotService(
    tool_provider=tool_provider,
    llm_config={
        "provider": "openai",
        "model": "gpt-4-turbo-preview",
        "api_key": os.getenv("OPENAI_API_KEY"),
        "temperature": 0
    }
)

# Store in app state for dependency injection
app.state.chatbot_service = chatbot_service
app.state.tool_provider = tool_provider

# Include chatbot routes
app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])
```

---

## Module Structure

```
src/components/chatbot/
├── components/
│   ├── ChatbotWidget.jsx      # Main widget (floating button)
│   ├── ChatWindow.jsx         # Chat interface
│   ├── MessageList.jsx        # Message list
│   ├── MessageItem.jsx        # Individual message
│   ├── MessageInput.jsx       # Input field
│   └── TypingIndicator.jsx    # Loading indicator
├── hooks/
│   └── useChatbot.js          # Main chatbot hook
├── services/
│   └── chatService.js         # API client
├── types/
│   └── index.js               # Type definitions (JSDoc)
└── index.js                   # Main export

backend_chatbot/
├── app/
│   ├── __init__.py
│   ├── chatbot_service.py     # Main chatbot service
│   ├── tools/
│   │   └── base.py            # Base tool classes
│   └── api/
│       └── endpoints/
│           └── chat.py        # API endpoints
└── README.md
```

---

## Customization

### Change Widget Position

```jsx
<ChatbotWidget
  apiUrl={chatbotConfig.apiUrl}
  config={{
    ...chatbotConfig,
    position: 'bottom-left', // or 'top-right', 'top-left'
  }}
  context={chatbotContext}
  onAction={handleChatbotAction}
/>
```

### Customize Branding

```jsx
config={{
  branding: {
    name: 'My Lab Assistant',
    logo: '/path/to/logo.svg',
    welcomeMessage: 'Welcome! How can I help?',
  }
}}
```

### Disable Chatbot

```jsx
config={{
  enabled: false
}}
```

Or set environment variable:
```bash
VITE_CHATBOT_ENABLED=false
```

---

## Next Steps

1. **Set up FastAPI backend** with chatbot service
2. **Create tool provider** with LMS-specific tools
3. **Implement query tools** for each entity type
4. **Test integration** end-to-end
5. **Deploy** to production

---

## Troubleshooting

### Chatbot not appearing?
- Check `VITE_CHATBOT_ENABLED` is not set to `false`
- Check browser console for errors
- Verify API URL is correct

### API errors?
- Ensure backend is running
- Check CORS configuration
- Verify authentication token

### No response from chatbot?
- Check OpenAI API key is set
- Verify backend logs
- Check network tab for API calls

