# Modular Chatbot Architecture - Plug & Play Design

## Executive Summary

This document outlines a **modular, pluggable chatbot architecture** that can be developed as a separate, reusable component and easily integrated into the Lab Management System (or any other system). This approach provides better maintainability, reusability, and allows independent development.

---

## Architecture Overview

### Modular Design Philosophy

The chatbot will be designed as a **self-contained module** with:
- **Clear interfaces** for integration
- **Configuration-based** setup
- **No tight coupling** to the main system
- **Reusable** across different projects
- **Testable** in isolation

```
┌─────────────────────────────────────────────────────────────┐
│              Main Application (LMS)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Integration Layer                           │  │
│  │  • ChatbotProvider component                         │  │
│  │  • Configuration                                      │  │
│  │  • Context injection                                  │  │
│  └───────────────────┬───────────────────────────────────┘  │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       │ Well-defined Interface
                       │
┌──────────────────────▼──────────────────────────────────────┐
│           Chatbot Module (Separate Package)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Frontend Widget                                     │  │
│  │  • UI Components                                     │  │
│  │  • State Management                                  │  │
│  │  • Chat Interface                                    │  │
│  └───────────────────┬───────────────────────────────────┘  │
│  ┌───────────────────▼───────────────────────────────────┐  │
│  │  Backend Service (API/Microservice)                  │  │
│  │  • Chat API                                           │  │
│  │  • LLM Integration                                    │  │
│  │  • Tool Execution                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Structure

### Option 1: NPM Package (Recommended for Frontend)

```
chatbot-module/
├── package.json
├── src/
│   ├── components/
│   │   ├── ChatbotWidget.tsx        # Main widget component
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useChatbot.ts
│   │   └── useChatHistory.ts
│   ├── services/
│   │   └── chatService.ts           # API client
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── config/
│   │   └── defaultConfig.ts         # Default configuration
│   └── index.ts                     # Main export
├── dist/                            # Built package
├── README.md
└── tsconfig.json
```

### Option 2: Separate Repository (Microservice Approach)

```
chatbot-service/
├── frontend/                        # Chatbot UI package
│   └── (same as Option 1)
├── backend/                         # Chatbot API service
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── services/
│   │   ├── agents/
│   │   └── tools/
│   ├── requirements.txt
│   └── Dockerfile
├── shared/                          # Shared types/configs
│   └── schemas/
└── docker-compose.yml
```

### Option 3: Monorepo (Current Structure)

```
LMS/
├── packages/
│   ├── chatbot/                     # Chatbot module
│   │   ├── frontend/
│   │   ├── backend/
│   │   └── package.json
│   └── main-app/                    # Main LMS application
│       └── ...
└── package.json                     # Workspace root
```

**Recommendation: Option 1 (NPM Package) for frontend + Separate backend service**

---

## Integration Interface Design

### Frontend Integration

#### 1. Chatbot Widget Component (Plug-in)

```typescript
// Main app imports the chatbot widget
import { ChatbotWidget } from '@your-org/lab-chatbot'

// In your main app component
<ChatbotWidget
  apiUrl="http://localhost:8000/api/v1/chat"
  config={{
    theme: 'light',
    position: 'bottom-right',
    enabled: true,
  }}
  context={{
    userId: currentUser.id,
    userRole: currentUser.role,
    currentPage: '/lab/management/projects',
  }}
  onAction={(action) => {
    // Handle actions from chatbot (e.g., navigation)
    if (action.type === 'navigate') {
      navigate(action.path)
    }
  }}
/>
```

#### 2. Configuration Interface

```typescript
interface ChatbotConfig {
  // API Configuration
  apiUrl: string
  apiKey?: string
  
  // UI Configuration
  theme?: 'light' | 'dark'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  primaryColor?: string
  
  // Feature Flags
  enabled?: boolean
  showSuggestions?: boolean
  enableHistory?: boolean
  
  // Customization
  branding?: {
    name?: string
    logo?: string
    welcomeMessage?: string
  }
  
  // Context (injected by main app)
  context?: ChatbotContext
}

interface ChatbotContext {
  userId: string
  userRole: string
  currentPage?: string
  permissions?: string[]
  // Any other context needed
}
```

#### 3. Event Handlers

```typescript
interface ChatbotHandlers {
  onAction?: (action: ChatbotAction) => void
  onError?: (error: Error) => void
  onMessageSent?: (message: string) => void
  onMessageReceived?: (message: string) => void
}

type ChatbotAction = 
  | { type: 'navigate'; path: string }
  | { type: 'openModal'; modal: string; data?: any }
  | { type: 'refresh'; component: string }
  | { type: 'custom'; action: string; payload: any }
```

### Backend Integration

#### 1. Chatbot API Service (Separate Service)

```python
# chatbot-service/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Chatbot Service")

# Accept configuration from environment or external config
CHATBOT_CONFIG = {
    "llm_provider": os.getenv("LLM_PROVIDER", "openai"),
    "llm_model": os.getenv("LLM_MODEL", "gpt-4-turbo"),
    "vector_db_url": os.getenv("VECTOR_DB_URL"),
    # ... other configs
}

@app.post("/chat/message")
async def chat_endpoint(
    message: ChatMessage,
    context: ChatContext  # Injected by main app
):
    # Process message using chatbot logic
    pass
```

#### 2. Tool Provider Interface

The chatbot backend needs access to the main app's data. This is done through a **tool provider interface**:

```python
# Main app provides tools to chatbot service
class ChatbotToolProvider:
    """Interface that main app implements to provide tools to chatbot"""
    
    def get_query_tools(self, user_context: UserContext) -> List[Tool]:
        """Return list of query tools available to chatbot"""
        return [
            QueryProjectsTool(self.db, user_context),
            QueryTestPlansTool(self.db, user_context),
            QueryCustomersTool(self.db, user_context),
            # ... etc
        ]
    
    def get_help_tools(self) -> List[Tool]:
        """Return help/documentation tools"""
        return [
            SystemHelpTool(),
            FeatureGuideTool(),
            # ... etc
        ]
```

#### 3. Integration via API Gateway or Direct Service Call

```
Main App (FastAPI)
  ├── /api/v1/* (Main app endpoints)
  └── /api/v1/chat/* (Proxied to chatbot service)
          │
          └──> Chatbot Service (FastAPI)
                  ├── /chat/message
                  ├── /chat/history
                  └── (Uses tools provided by main app)
```

---

## Implementation Strategy

### Phase 1: Create Standalone Chatbot Module

1. **Create separate repository/package**
   ```
   lab-chatbot/
   ├── frontend/          # React component package
   ├── backend/           # FastAPI chatbot service
   └── docs/              # Documentation
   ```

2. **Develop core chatbot functionality**
   - UI components
   - Chat API
   - LLM integration
   - Basic query tools (mock data initially)

3. **Create integration interface**
   - Define TypeScript interfaces
   - Create configuration schema
   - Design event system

### Phase 2: Integration with LMS

1. **Install chatbot package**
   ```bash
   npm install @your-org/lab-chatbot
   ```

2. **Integrate in main app**
   ```typescript
   // src/App.jsx or Layout component
   import { ChatbotWidget } from '@your-org/lab-chatbot'
   
   function App() {
     return (
       <>
         <YourApp />
         <ChatbotWidget
           apiUrl={process.env.VITE_CHATBOT_API_URL}
           config={chatbotConfig}
           context={appContext}
           onAction={handleChatbotAction}
         />
       </>
     )
   }
   ```

3. **Provide tools to chatbot**
   ```python
   # Main app creates tool provider
   from lab_chatbot import ChatbotService, ToolProvider
   
   class LMSToolProvider(ToolProvider):
       def get_tools(self, user):
           return [
               QueryProjectsTool(self.db, user),
               QueryTestPlansTool(self.db, user),
               # ... all other tools
           ]
   
   # Initialize chatbot service with tool provider
   chatbot_service = ChatbotService(
       tool_provider=LMSToolProvider(db),
       llm_config=llm_config
   )
   ```

### Phase 3: Deployment

1. **Chatbot service as separate service**
   - Deploy chatbot backend separately
   - Main app calls chatbot API
   - Or use API gateway to route requests

2. **Or embed in main app**
   - Include chatbot routes in main FastAPI app
   - Share database connection
   - Single deployment

---

## Benefits of Modular Approach

### ✅ Advantages

1. **Separation of Concerns**
   - Chatbot logic isolated from main app
   - Easier to maintain and test

2. **Reusability**
   - Can be used in multiple projects
   - Just configure differently

3. **Independent Development**
   - Can be developed by separate team
   - Different release cycle

4. **Easy Testing**
   - Test chatbot in isolation
   - Mock tool providers

5. **Flexibility**
   - Can swap LLM providers easily
   - Can replace UI components
   - Can change backend implementation

6. **Versioning**
   - Independent versioning
   - Backward compatible updates

### ⚠️ Considerations

1. **Initial Setup Complexity**
   - Need to define interfaces clearly
   - Requires good documentation

2. **Deployment Complexity**
   - May need separate deployment (if microservice)
   - Or include in monolith

3. **Shared Types**
   - Need to maintain shared TypeScript/Python types
   - Version compatibility

---

## Package Structure (Detailed)

### Frontend Package (`@your-org/lab-chatbot`)

```typescript
// index.ts (Main export)
export { ChatbotWidget } from './components/ChatbotWidget'
export { ChatbotProvider } from './components/ChatbotProvider'
export type { ChatbotConfig, ChatbotContext, ChatbotAction } from './types'
export { useChatbot } from './hooks/useChatbot'

// components/ChatbotWidget.tsx
export interface ChatbotWidgetProps {
  apiUrl: string
  config?: Partial<ChatbotConfig>
  context?: ChatbotContext
  onAction?: (action: ChatbotAction) => void
}

export function ChatbotWidget(props: ChatbotWidgetProps) {
  // Implementation
}

// services/chatService.ts
export class ChatService {
  constructor(private apiUrl: string, private apiKey?: string) {}
  
  async sendMessage(message: string, sessionId: string, context: ChatbotContext) {
    // API call implementation
  }
  
  async getHistory(sessionId: string) {
    // Get chat history
  }
}
```

### Backend Package/Service

```python
# chatbot_service/app/__init__.py
from .chatbot import ChatbotService
from .tools import ToolProvider, Tool

__all__ = ['ChatbotService', 'ToolProvider', 'Tool']

# chatbot_service/app/chatbot.py
class ChatbotService:
    """Main chatbot service - can be used as library or service"""
    
    def __init__(
        self,
        tool_provider: ToolProvider,
        llm_config: LLMConfig,
        db: Session = None
    ):
        self.tool_provider = tool_provider
        self.llm_config = llm_config
        self.db = db
        self.agent = self._create_agent()
    
    def process_message(
        self,
        message: str,
        session_id: str,
        user_context: UserContext
    ) -> ChatResponse:
        """Process user message and return response"""
        tools = self.tool_provider.get_tools(user_context)
        # Use tools with LLM agent
        response = self.agent.invoke({
            "input": message,
            "tools": tools,
            "context": user_context
        })
        return response

# chatbot_service/app/tools.py
class ToolProvider(ABC):
    """Abstract base class - main app implements this"""
    
    @abstractmethod
    def get_tools(self, user_context: UserContext) -> List[Tool]:
        """Return tools available to chatbot"""
        pass

class Tool(ABC):
    """Base class for chatbot tools"""
    
    @abstractmethod
    def execute(self, params: dict, user_context: UserContext) -> Any:
        """Execute the tool"""
        pass
```

---

## Integration Example

### Main App Integration

```typescript
// src/App.jsx
import { ChatbotWidget } from '@your-org/lab-chatbot'
import { useLabManagementAuth } from './contexts/LabManagementAuthContext'
import { useLocation } from 'react-router-dom'

function App() {
  const { user } = useLabManagementAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  const chatbotConfig = {
    apiUrl: import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000/api/v1/chat',
    theme: 'light',
    position: 'bottom-right' as const,
    enabled: true,
    branding: {
      name: 'Lab Assistant',
      welcomeMessage: 'Hi! How can I help you with the Lab Management System?'
    }
  }
  
  const chatbotContext = {
    userId: user?.id || '',
    userRole: user?.role || '',
    currentPage: location.pathname,
    permissions: user?.permissions || []
  }
  
  const handleChatbotAction = (action) => {
    switch (action.type) {
      case 'navigate':
        navigate(action.path)
        break
      case 'openModal':
        // Open modal in main app
        break
      default:
        console.log('Chatbot action:', action)
    }
  }
  
  return (
    <Router>
      <Routes>
        {/* Your routes */}
      </Routes>
      
      {/* Chatbot Widget - Plugged in */}
      <ChatbotWidget
        apiUrl={chatbotConfig.apiUrl}
        config={chatbotConfig}
        context={chatbotContext}
        onAction={handleChatbotAction}
      />
    </Router>
  )
}
```

### Backend Integration (FastAPI)

```python
# backend/app/main.py
from lab_chatbot import ChatbotService, ToolProvider
from app.tools.chatbot_tools import LMSToolProvider
from app.api.v1.endpoints import chat

# Initialize chatbot service with tool provider
tool_provider = LMSToolProvider(db)
chatbot_service = ChatbotService(
    tool_provider=tool_provider,
    llm_config={
        "provider": "openai",
        "model": "gpt-4-turbo",
        "api_key": settings.OPENAI_API_KEY
    }
)

# Include chatbot routes
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
```

---

## Configuration Management

### Environment Variables

```bash
# .env (Main app)
VITE_CHATBOT_API_URL=http://localhost:8000/api/v1/chat
CHATBOT_ENABLED=true

# Backend
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4-turbo
CHATBOT_SERVICE_URL=http://localhost:8000
```

### Configuration File (Optional)

```yaml
# chatbot.config.yaml
chatbot:
  enabled: true
  api:
    url: "http://localhost:8000/api/v1/chat"
    timeout: 30
  ui:
    theme: "light"
    position: "bottom-right"
    primaryColor: "#3B82F6"
  features:
    suggestions: true
    history: true
    voice: false
  branding:
    name: "Lab Assistant"
    logo: "/assets/logo.svg"
```

---

## Testing Strategy

### Unit Tests (Chatbot Module)

```typescript
// chatbot-module/src/__tests__/ChatbotWidget.test.tsx
describe('ChatbotWidget', () => {
  it('renders correctly', () => {
    render(<ChatbotWidget apiUrl="http://test.com" />)
    // Test rendering
  })
  
  it('calls onAction when action is triggered', () => {
    const onAction = jest.fn()
    render(
      <ChatbotWidget
        apiUrl="http://test.com"
        onAction={onAction}
      />
    )
    // Trigger action
    expect(onAction).toHaveBeenCalled()
  })
})
```

### Integration Tests (Main App)

```typescript
// main-app/src/__tests__/ChatbotIntegration.test.tsx
describe('Chatbot Integration', () => {
  it('integrates with main app', () => {
    render(<App />)
    // Verify chatbot widget is rendered
    // Test interaction
  })
  
  it('handles navigation actions', () => {
    // Test that chatbot actions navigate correctly
  })
})
```

---

## Deployment Options

### Option 1: Embedded (Recommended for Start)

- Chatbot code included in main app
- Shared database connection
- Single deployment
- Simpler setup

### Option 2: Microservice

- Separate chatbot service
- Independent deployment
- Can scale separately
- More complex setup

### Option 3: Hybrid

- Frontend widget as NPM package
- Backend embedded in main app
- Best of both worlds

---

## Migration Path

### Step 1: Develop Chatbot Module
- Create separate repository/package
- Develop core functionality
- Create integration interface
- Document API

### Step 2: Test in Isolation
- Unit tests
- Integration tests with mock data
- Test different configurations

### Step 3: Integrate with LMS
- Install package
- Configure
- Provide tools
- Test integration

### Step 4: Deploy
- Deploy to staging
- Test end-to-end
- Deploy to production

---

## Updated Roadmap (Modular Approach)

### Phase 1: Create Chatbot Module (Weeks 1-3)

**Week 1-2: Core Module Development**
- Create package structure
- Develop UI components
- Create chat API
- LLM integration

**Week 3: Integration Interface**
- Define interfaces
- Create configuration system
- Documentation
- Example integration

### Phase 2: Integration with LMS (Week 4)

- Install/integrate chatbot module
- Provide LMS-specific tools
- Configure for LMS context
- Test integration

### Phase 3: Optimization & Polish (Weeks 5-6)

- Performance optimization
- User testing
- Documentation
- Production deployment

---

## Conclusion

**Yes, creating the chatbot as a separate, pluggable module is not only feasible but recommended!**

### Benefits:
- ✅ **Reusable** across projects
- ✅ **Maintainable** - isolated codebase
- ✅ **Testable** - can test independently
- ✅ **Flexible** - easy to customize
- ✅ **Scalable** - can deploy separately if needed

### Implementation Approach:
1. **Develop as separate package/service**
2. **Define clear interfaces**
3. **Use configuration for customization**
4. **Integrate via well-defined APIs**
5. **Can start embedded, move to microservice later**

This modular approach gives you the flexibility to:
- Use the chatbot in other projects
- Develop and test independently
- Update chatbot without touching main app
- Scale chatbot separately if needed
- Swap implementations easily

---

**Next Steps:**
1. Create chatbot module repository/package
2. Develop core functionality
3. Define integration interfaces
4. Create integration guide
5. Integrate with LMS

