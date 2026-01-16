"""
Chatbot Service
Main service for processing chat messages using LLM and tools
"""

from typing import List, Optional, Dict, Any
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory

from .tools.base import Tool, ToolProvider, UserContext


class ChatbotService:
    """Main chatbot service - processes messages using LLM and tools"""
    
    def __init__(
        self,
        tool_provider: ToolProvider,
        llm_config: Dict[str, Any],
        system_prompt: Optional[str] = None
    ):
        self.tool_provider = tool_provider
        self.llm_config = llm_config
        self.system_prompt = system_prompt or self._default_system_prompt()
        self.llm = self._create_llm()
        self.agent = self._create_agent()
    
    def _create_llm(self):
        """Create LLM instance based on config"""
        provider = self.llm_config.get("provider", "openai")
        model = self.llm_config.get("model", "gpt-4-turbo-preview")
        api_key = self.llm_config.get("api_key")
        temperature = self.llm_config.get("temperature", 0)
        
        if provider == "openai":
            return ChatOpenAI(
                model=model,
                openai_api_key=api_key,
                temperature=temperature
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
    
    def _create_agent(self):
        """Create LangChain agent with tools"""
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        # Agent will be created dynamically with tools per request
        return prompt
    
    def _default_system_prompt(self) -> str:
        """Default system prompt for the chatbot"""
        return """You are a helpful assistant for a Lab Management System.
You help users query data and get information about:
- Projects, Test Plans, Test Executions, Test Results
- Customers, RFQs, Estimations
- Samples, TRFs, Documents
- Audits, NCRs, Certifications

Your primary role is to retrieve information from the system database and answer questions.
Always be helpful, concise, and accurate. If you're not sure about something, ask for clarification.

When answering:
- Format data clearly (use tables, lists when appropriate)
- Provide specific details when available
- If no data is found, clearly state that
- Suggest related queries if helpful"""
    
    async def process_message(
        self,
        message: str,
        session_id: str,
        user_context: UserContext,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Process a user message and return response"""
        try:
            # Get tools for this user
            tools = self.tool_provider.get_tools(user_context)
            
            # Convert tools to LangChain format
            from langchain.tools import StructuredTool
            
            langchain_tools = []
            for tool in tools:
                langchain_tool = StructuredTool.from_function(
                    func=lambda params, t=tool, uc=user_context: t.execute(params, uc),
                    name=tool.name,
                    description=tool.description
                )
                langchain_tools.append(langchain_tool)
            
            # Create agent with tools
            agent = create_openai_functions_agent(self.llm, langchain_tools, self.agent)
            
            # Create memory
            memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
            
            # Add chat history to memory
            if chat_history:
                for msg in chat_history:
                    if msg.get("role") == "user":
                        memory.chat_memory.add_user_message(msg.get("content", ""))
                    elif msg.get("role") == "assistant":
                        memory.chat_memory.add_ai_message(msg.get("content", ""))
            
            # Create executor
            executor = AgentExecutor(
                agent=agent,
                tools=langchain_tools,
                memory=memory,
                verbose=True,
                handle_parsing_errors=True
            )
            
            # Execute
            result = await executor.ainvoke({"input": message})
            
            return {
                "message": result.get("output", "I'm sorry, I couldn't process that request."),
                "session_id": session_id,
                "suggestions": self._generate_suggestions(message),
                "metadata": {
                    "tools_used": result.get("intermediate_steps", []),
                }
            }
        except Exception as e:
            return {
                "message": f"I encountered an error: {str(e)}. Please try again or rephrase your question.",
                "session_id": session_id,
                "error": str(e)
            }
    
    def _generate_suggestions(self, message: str) -> List[str]:
        """Generate suggested follow-up questions"""
        suggestions = [
            "Show me all active projects",
            "List test plans for this month",
            "What certifications are expiring soon?",
        ]
        return suggestions[:3]  # Return top 3

