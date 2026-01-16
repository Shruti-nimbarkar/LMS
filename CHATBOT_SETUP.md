# Chatbot Setup & Quick Start

## ✅ What Has Been Created

A complete modular chatbot system following the modular architecture:

### Frontend Module (`src/components/chatbot/`)
- ✅ **ChatbotWidget** - Main floating button widget
- ✅ **ChatWindow** - Chat interface window
- ✅ **MessageList** - Message display component
- ✅ **MessageItem** - Individual message component
- ✅ **MessageInput** - Input field with send button
- ✅ **TypingIndicator** - Loading animation
- ✅ **useChatbot** - Main state management hook
- ✅ **ChatService** - API client service
- ✅ **Type definitions** - JSDoc types

### Backend Module (`backend_chatbot/`)
- ✅ **ChatbotService** - Main chatbot service class
- ✅ **ToolProvider** - Abstract base class for tools
- ✅ **Tool** - Base class for chatbot tools
- ✅ **API Endpoints** - FastAPI routes for chat
- ✅ **Integration interface** - Ready for tool provider

### Integration
- ✅ **Integrated in App.jsx** - Chatbot widget is already plugged in
- ✅ **Context injection** - User context automatically passed
- ✅ **Action handling** - Navigation and actions supported

---

## 🚀 Quick Start

### 1. Frontend (Already Done!)

The chatbot is already integrated. Just run your app:

```bash
npm run dev
```

You'll see a floating chat button in the bottom-right corner!

### 2. Backend Setup

#### Option A: Embedded in Main FastAPI App (Recommended)

1. **Copy chatbot backend to your main backend:**

```bash
# Copy backend_chatbot/app to your backend/app/chatbot
```

2. **Install dependencies:**

```bash
pip install langchain langchain-openai openai
```

3. **Create tool provider** (see `CHATBOT_INTEGRATION_GUIDE.md`)

4. **Integrate in main.py:**

```python
from app.chatbot.chatbot_service import ChatbotService
from app.chatbot.api.endpoints.chat import router as chat_router
from app.tools.lms_tool_provider import LMSToolProvider

# Initialize
tool_provider = LMSToolProvider(db)
chatbot_service = ChatbotService(
    tool_provider=tool_provider,
    llm_config={
        "provider": "openai",
        "model": "gpt-4-turbo-preview",
        "api_key": os.getenv("OPENAI_API_KEY"),
    }
)

app.include_router(chat_router, prefix="/api/v1/chat")
```

#### Option B: Separate Microservice

1. **Deploy chatbot service separately**
2. **Update frontend API URL** to point to chatbot service
3. **Configure CORS** on chatbot service

---

## 📝 Environment Variables

Create `.env` file:

```bash
# Frontend
VITE_CHATBOT_API_URL=http://localhost:8000/api/v1/chat
VITE_CHATBOT_ENABLED=true

# Backend
OPENAI_API_KEY=sk-your-api-key-here
LLM_MODEL=gpt-4-turbo-preview
```

---

## 🧪 Testing

### Test Frontend (Without Backend)

The chatbot will show errors but the UI will work. You can test:
- Opening/closing chat window
- UI interactions
- Message input

### Test with Backend

1. Start FastAPI backend
2. Set `VITE_CHATBOT_API_URL` in `.env`
3. Send a test message
4. Check backend logs

---

## 📦 Module Structure

```
src/components/chatbot/          # Frontend module
├── components/                 # UI components
├── hooks/                      # React hooks
├── services/                   # API client
├── types/                      # Type definitions
└── index.js                    # Main export

backend_chatbot/                # Backend module
├── app/
│   ├── chatbot_service.py      # Main service
│   ├── tools/                  # Tool base classes
│   └── api/                    # API endpoints
└── README.md
```

---

## 🔌 How to Use

### In Your App (Already Integrated)

The chatbot is already integrated in `App.jsx`. It will:
- Show floating button on all pages
- Use user context from auth
- Handle navigation actions
- Show errors gracefully

### Customize

Edit `App.jsx` to customize:

```jsx
const chatbotConfig = {
  apiUrl: import.meta.env.VITE_CHATBOT_API_URL,
  position: 'bottom-right',  // Change position
  branding: {
    name: 'My Assistant',     // Custom name
    welcomeMessage: 'Hi!',    // Custom message
  },
}
```

---

## 🛠️ Next Steps

1. **Set up FastAPI backend** with chatbot routes
2. **Create tool provider** with LMS-specific tools
3. **Implement query tools** for:
   - Projects
   - Test Plans
   - Customers
   - Audits
   - etc.
4. **Test end-to-end**
5. **Deploy**

---

## 📚 Documentation

- **CHATBOT_MODULAR_ARCHITECTURE.md** - Full architecture details
- **CHATBOT_ROADMAP.md** - Implementation roadmap
- **CHATBOT_INTEGRATION_GUIDE.md** - Integration instructions

---

## ✨ Features

- ✅ Modular design - can be used in other projects
- ✅ Pluggable - just import and configure
- ✅ Context-aware - knows user and current page
- ✅ Action support - can trigger navigation
- ✅ Error handling - graceful error messages
- ✅ Responsive - works on mobile
- ✅ Animated - smooth transitions
- ✅ Customizable - theme, position, branding

---

**Status**: Frontend module complete and integrated! ✅  
**Next**: Set up backend and create tool provider

