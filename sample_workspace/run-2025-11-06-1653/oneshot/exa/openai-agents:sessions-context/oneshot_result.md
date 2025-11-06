# Oneshot Mode Result

**Scenario**: openai-agents:sessions-context
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:56:58.680Z

---

## Query

Using the OpenAI Agents Python SDK with sessions and persistent context, build a memory-enabled agent. Remember my name and city for this conversation. When I ask 'what's my city', retrieve it via a tool. Keep the memory across multiple runs in a local SQLite file and show me what was added to the history. Test with: 'What's my city?'

---

## Tool Input

```json
{
  "query": "Using the OpenAI Agents Python SDK with sessions and persistent context, build a memory-enabled agent. Remember my name and city for this conversation. When I ask 'what's my city', retrieve it via a tool. Keep the memory across multiple runs in a local SQLite file and show me what was added to the history. Test with: 'What's my city?'"
}
```

---

## Tool Result

## Manage Conversations with Agent and SQLiteSession

https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/running_agents.md

```
from agents import Agent, Runner, SQLiteSession

async def main():
    agent = Agent(name="Assistant", instructions="Reply very concisely.")

    # Create session instance
    session = SQLiteSession("conversation_123")

    with trace(workflow_name="Conversation", group_id=thread_id):
        # First turn
        result = await Runner.run(agent, "What city is the Golden Gate Bridge in?", session=session)
        print(result.final_output)
        # San Francisco

        # Second turn - agent automatically remembers previous context
        result = await Runner.run(agent, "What state is it in?", session=session)
        print(result.final_output)
        # California
```

## Create Memory Agent with OpenAIChat and SqliteStorage

https://raw.githubusercontent.com/wandb/weave/main/docs/docs/guides/integrations/agno.md

```
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.memory import AgentMemory
from agno.storage.sqlite import SqliteStorage

from dotenv import load_dotenv
load_dotenv()

# Load AgnoInstrumentor from the tracin.py file
from tracing import AgnoInstrumentor

# Start instrumenting Agno
AgnoInstrumentor().instrument()


# Create an agent with memory
memory_agent = Agent(
    name="Memory Agent",
    model=OpenAIChat(id="gpt-4o-mini"),
    memory=AgentMemory(),
    storage=SqliteStorage(
        table_name="agent_sessions",
        db_file="agent_memory.db"
    ),
    instructions="Remember our conversation history",
    show_tool_calls=True,
    markdown=True,
)

# First interaction
memory_agent.print_response("My name is John and I'm interested in AI investing strategies.")

# Second interaction - agent will remember the previous context
memory_agent.print_response("What specific AI companies would you recommend for my portfolio?")
```

## Sessions - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/sessions/

```
from agents.memory.session import SessionABC
from agents.items import TResponseInputItem
from typing import List
class MyCustomSession(SessionABC ):
"""Custom session implementation following the Session protocol."""
def __init__(self,session_id:str ):
self.session_id=session_id
# Your initialization here
async def get_items(self,limit:int|None=None)-> List[TResponseInputItem ]:
"""Retrieve conversation history for this session."""
# Your implementation here
pass
async def add_items(self,items:List[TResponseInputItem ]) -> None:
"""Store new items for this session."""
# Your implementation here
pass
async def pop_item(self)-> TResponseInputItem|None:
"""Remove and return the most recent item from this session."""
# Your implementation here
pass
async def clear_session(self)-> None:
"""Clear all items for this session."""
# Your implementation here
pass
# Use your custom session
agent=Agent(name="Assistant")
result=await Runner.run(
agent,
"Hello",
session=MyCustomSession("my_session")
)
```

## MyCustomSession Class for Managing Conversation History

https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/sessions.md

```
from agents.memory import Session
from typing import List

class MyCustomSession:
    """Custom session implementation following the Session protocol."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        # Your initialization here

    async def get_items(self, limit: int | None = None) -> List[dict]:
        """Retrieve conversation history for this session."""
        # Your implementation here
        pass

    async def add_items(self, items: List[dict]) -> None:
        """Store new items for this session."""
        # Your implementation here
        pass

    async def pop_item(self) -> dict | None:
        """Remove and return the most recent item from this session."""
        # Your implementation here
        pass

    async def clear_session(self) -> None:
        """Clear all items for this session."""
        # Your implementation here
        pass

# Use your custom session
agent = Agent(name="Assistant")
result = await Runner.run(
    agent,
    "Hello",
    session=MyCustomSession("my_session")
)
```

## Memory - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/ref/memory/

```
class OpenAIConversationsSession(SessionABC ):
def __init__(
self,
*,
conversation_id:str|None=None,
openai_client:AsyncOpenAI|None=None,
):
self._session_id:str|None=conversation_id
_openai_client=openai_client
if _openai_client is None:
_openai_client=get_default_openai_client () or AsyncOpenAI ()
# this never be None here
self._openai_client:AsyncOpenAI=_openai_client
async def _get_session_id(self)-> str:
if self._session_id is None:
self._session_id=await start_openai_conversations_session(self._openai_client)
return self._session_id
async def _clear_session_id(self)-> None:
self._session_id=None
async def get_items(self,limit:int|None=None)-> list[TResponseInputItem ]:
session_id=await self._get_session_id ()
all_items=[]
if limit is None:
async for item in self._openai_client.conversations.items.list(
conversation_id=session_id,
order="asc",
):
# calling model_dump() to make this serializable
all_items.append(item.model_dump(exclude_unset=True ))
else:
async for item in self._openai_client.conversations.items.list(
conversation_id=session_id,
limit=limit,
order="desc",
):
# calling model_dump() to make this serializable
all_items.append(item.model_dump(exclude_unset=True ))
if limit is not None and len(all_items)>= limit:
break
all_items.reverse ()
return all_items # type: ignore
async def add_items(self,items:list[TResponseInputItem ]) -> None:
session_id=await self._get_session_id ()
await self._openai_client.conversations.items.create(
conversation_id=session_id,
items=items,
)
async def pop_item(self)-> TResponseInputItem|None:
session_id=await self._get_session_id ()
items=await self.get_items(limit=1)
if not items:
return None
item_id:str=str(items[0 ][ "id" ]) # type: ignore [typeddict-item]
await self._openai_client.conversations.items.delete(
conversation_id=session_id,item_id=item_id
)
return items[0]
async def clear_session(self)-> None:
session_id=await self._get_session_id ()
await self._openai_client.conversations.delete(
conversation_id=session_id,
)
await self._clear_session_id ()
```

## Implements AI Assistant Interaction with Memory Context

https://raw.githubusercontent.com/FlowiseAI/FlowiseDocs/main/en/integrations/langchain/memory/README.md

```
You are an assistant to a human, powered by a large language model trained by OpenAI.

Whether the human needs help with a specific question or just wants to have a conversation about a particular topic, you are here to assist.

Current conversation:
{history}
```

## SimpleAgent Chatbot with OpenAI and InMemory Storage

https://raw.githubusercontent.com/dynamiq-ai/dynamiq/main/README.md

```
from dynamiq.connections import OpenAI as OpenAIConnection
from dynamiq.memory import Memory
from dynamiq.memory.backends.in_memory import InMemory
from dynamiq.nodes.agents.simple import SimpleAgent
from dynamiq.nodes.llms import OpenAI

AGENT_ROLE = "helpful assistant, goal is to provide useful information and answer questions"
llm = OpenAI(
    connection=OpenAIConnection(api_key="OPENAI_API_KEY"),
    model="gpt-4o",
    temperature=0.1,
)

memory = Memory(backend=InMemory())

agent = SimpleAgent(
    name="Agent",
    llm=llm,
    role=AGENT_ROLE,
    id="agent",
    memory=memory,
)


def main():
    print("Welcome to the AI Chat! (Type 'exit' to end)")
    while True:
        user_input = input("You: ")
        user_id = "user"
        session_id = "session"
        if user_input.lower() == "exit":
            break

        response = agent.run({"input": user_input, "user_id": user_id, "session_id": session_id})
        response_content = response.output.get("content")
        print(f"AI: {response_content}")


if __name__ == "__main__":
    main()
```

## bash Result 1

https://raw.githubusercontent.com/intel/intel-extension-for-transformers/main/workflows/chatbot/inference/memory_controller/memory.md

```
python chat_with_memory.py --model_path XXX
```

## MyCustomSession Class Implements Session Protocol

https://raw.githubusercontent.com/openai/openai-agents-python/main/README.md

```
from agents.memory import Session
from typing import List

class MyCustomSession:
    """Custom session implementation following the Session protocol."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        # Your initialization here

    async def get_items(self, limit: int | None = None) -> List[dict]:
        # Retrieve conversation history for the session
        pass

    async def add_items(self, items: List[dict]) -> None:
        # Store new items for the session
        pass

    async def pop_item(self) -> dict | None:
        # Remove and return the most recent item from the session
        pass

    async def clear_session(self) -> None:
        # Clear all items for the session
        pass

# Use your custom session
agent = Agent(name="Assistant")
result = await Runner.run(
    agent,
    "Hello",
    session=MyCustomSession("my_session")
)
```

## Initialize AzureChatOpenAI Agent with Memory Management

https://raw.githubusercontent.com/zahaby/intro-llm-rag/main/main-aspects/agents-tools.md

```
memory = ConversationBufferWindowMemory(memory_key="chat_history",return_messages=True,k=7)  
llm = AzureChatOpenAI(  
    temperature=0,  
    deployment_name="********************",  
    model_name="gpt-35-turbo-16k",  
    openai_api_base="***************************",  
    openai_api_version="2023-07-01-preview",  
    openai_api_key="**************",  
    openai_api_type="azure"  
)  
agent_chain=initialize_agent(  
    tools,  
    llm,  
    agent=AgentType.OPENAI_FUNCTIONS,  
    verbose=True,  
    agent_kwargs=agent_kwargs,  
    memory=memory,  
    callbacks=[MyCustomHandler()]  
)
```

## CustomMemory Class for LightAgent with mem0 Integration

https://raw.githubusercontent.com/wxai-space/LightAgent/main/README.pt.md

```
# Ativando o módulo de memória

# Ou usando um módulo de memória personalizado, abaixo um exemplo com mem0 https://github.com/mem0ai/mem0/
from mem0 import Memory
from LightAgent import LightAgent
import os
from loguru import logger

class CustomMemory:
    def __init__(self):
        self.memories = []
        os.environ["OPENAI_API_KEY"] = "your_api_key"
        os.environ["OPENAI_API_BASE"] = "your_base_url"
        # Inicializa o Mem0
        config = {
            "version": "v1.1"
        }
        # Se você deseja usar o qdrant como banco de dados vetorial para armazenamento de memória, altere a configuração para o código abaixo
        # config = {
        #     "vector_store": {
        #         "provider": "qdrant",
        #         "config": {
        #             "host": "localhost",
        #             "port": 6333,
        #         }
        #     },
        #     "version": "v1.1"
        # }
        self.m = Memory.from_config(config_dict=config)

    def store(self, data: str, user_id):
        """Armazena a memória, desenvolvedores podem modificar a implementação de armazenamento, este exemplo é da função de adicionar memória do mem0"""
        result = self.m.add(data, user_id=user_id)
        return result

    def retrieve(self, query: str, user_id):
        """Recupera a memória relevante, desenvolvedores podem modificar a implementação, este exemplo é da função de busca de memória do mem0"""
        result = self.m.search(query, user_id=user_id)
        return result

agent = LightAgent(
        role="Por favor, lembre-se de que você é o LightAgent, um assistente útil que pode ajudar os usuários com o uso de múltiplas ferramentas.",  # descrição do papel do sistema
        model="deepseek-chat",  # suportando modelos: openai, chatglm, deepseek, qwen, etc.
        api_key="your_api_key",  # substitua pela chave de API do seu provedor de modelo grande
        base_url="your_base_url",  # substitua pela URL API do seu provedor de modelo grande
        memory=CustomMemory(),  # habilita a funcionalidade de memória
        tree_of_thought=False,  # habilita a cadeia de pensamento
    )

# Teste com memória & se precisar adicionar ferramentas, você pode adicionar ferramentas ao agente para habilitar chamadas de ferramentas com memória

user_id = "user_01"
logger.info("\n=========== próxima conversa ===========")
query = "Quais são os pontos turísticos interessantes em Sanya? Muitos amigos ao meu redor foram a Sanya e eu também quero ir."
print(agent.run(query, stream=False, user_id=user_id))
logger.info("\n=========== próxima conversa ===========")
query = "Aonde eu deveria viajar?"
print(agent.run(query, stream=False, user_id=user_id))
```

## Initialize QnABot with Custom Prompt and Memory

https://raw.githubusercontent.com/momegas/megabots/main/README.md

```
from megabots import bot

prompt = """
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

{history}
Human: {question}
AI:"""

qnabot = bot("qna-over-docs", prompt=prompt, index="./index.pkl", memory="conversation-buffer")

print(qnabot.ask("who is iron man?"))
print(qnabot.ask("was he in the first roster?"))
```

## 🧠 Mastering Sessions in the OpenAI Agents SDK

https://medium.com/@abdulkabirlive1/mastering-sessions-in-the-openai-agents-sdk-for-smarter-ai-agents-7883c24c8901

```
await Runner.run(agent, "Hi", session=MySession("user_123"))
```

## Create and Manage Contextual Conversations with AnyAgent

https://raw.githubusercontent.com/mozilla-ai/any-agent/main/docs/agents/index.md

```
from any_agent import AgentConfig, AnyAgent

# Create your agent
agent = AnyAgent.create(
    "tinyagent",
    AgentConfig(
        model_id="mistral/mistral-small-latest",
        instructions="You are a helpful assistant. Use previous conversation context when available.",
    )
)

response1 = agent.run("What's the capital of California?")
print(f"Agent: {response1.final_output}")
conversation_history = response1.spans_to_messages()
# Convert previous conversation to readable format
history_text = "\n".join([
    f"{msg.role.capitalize()}: {msg.content}"
    for msg in conversation_history
    if msg.role != "system"
])

user_message = "What's the closest national park to that city"

full_prompt = f"""Previous conversation:
{history_text}

Current user message: {user_message}

Please respond taking into account the conversation history above."""

response2 = agent.run(full_prompt)
print(f"Agent: {response2.final_output}")  # Agent will understand "that city" refers to Sacramento
```

## Memory Management in Ollama Agent Implementation

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/ollama/README.md

```
python cookbook/models/ollama/memory.py
```

## Create Customer Support Agent with Multiple Memories

https://raw.githubusercontent.com/PrefectHQ/marvin/main/docs/concepts/memory.mdx

```
import marvin

# Create specialized memories
user_preferences = marvin.Memory(key="user_preferences")
product_knowledge = marvin.Memory(key="product_knowledge")
conversation_history = marvin.Memory(key="past_conversations")

# Create an agent with multiple memories
agent = marvin.Agent(
    name="Customer Support",
    memories=[user_preferences, product_knowledge, conversation_history]
)
```

## Demonstrates Independent Conversations in OpenAI Agents SDK

https://raw.githubusercontent.com/panaversity/learn-agentic-ai/main/01_ai_agents_first/17_sesssion_memory/readme.md

```
# Each conversation is independent - agent forgets everything!
result1 = Runner.run_sync(agent, "What city is the Golden Gate Bridge in?")
# Agent: "San Francisco"

result2 = Runner.run_sync(agent, "What state is it in?")
# Agent: "What are you referring to?" (forgot about San Francisco!)
```

## Memory Management with create_memory and search_memory Functions

https://raw.githubusercontent.com/elizaOS/agentmemory/main/README.md

```
from agentmemory import create_memory, search_memory

# create a memory
create_memory("conversation", "I can't do that, Dave.", metadata={"speaker": "HAL", "some_other_key": "some value, could be a number or string"})

# search for a memory
memories = search_memory("conversation", "Dave") # category, search term

print(str(memories))

# memories is a list of dictionaries
[
    {
        "id": int,
        "document": string,
        "metadata": dict{...values},
        "embeddings": (Optional) list[float] | None
    },
    {
        ...
    }
]
```

## Advanced SQLite Sessions - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/sessions/advanced_sqlite_session/

```
CREATE TABLE turn_usage(
id INTEGER PRIMARY KEY AUTOINCREMENT,
session_id TEXT NOT NULL,
branch_id TEXT NOT NULL DEFAULT 'main',
user_turn_number INTEGER NOT NULL,
requests INTEGER DEFAULT 0,
input_tokens INTEGER DEFAULT 0,
output_tokens INTEGER DEFAULT 0,
total_tokens INTEGER DEFAULT 0,
input_tokens_details JSON,
output_tokens_details JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(session_id)REFERENCES agent_sessions(session_id)ON DELETE CASCADE,
UNIQUE(session_id,branch_id,user_turn_number)
);
```

## ImageAgentWithMemory Class for Dall-E Image Generation

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/openai/chat/README.md

```
python cookbook/models/openai/image_agent_with_memory.py
```

## Implements Memory Management for OpenAI Agents

https://raw.githubusercontent.com/agno-agi/phidata/main/cookbook/providers/openai/README.md

```
python cookbook/providers/openai/memory.py
```

## SQLAlchemy Sessions - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/sessions/sqlalchemy_session/

```
import asyncio
from agents import Agent,Runner
from agents.extensions.memory import SQLAlchemySession
from sqlalchemy.ext.asyncio import create_async_engine
async def main ():
# Create your database engine
engine=create_async_engine("postgresql+asyncpg://user:pass@localhost/db")
agent=Agent("Assistant")
session=SQLAlchemySession(
"user-456",
engine=engine,
create_tables=True
)
result=await Runner.run(agent,"Hello",session=session)
print(result.final_output)
# Clean up
await engine.dispose ()
if __name__ == "__main__":
asyncio.run(main ())
```

## Solving Chatbot Amnesia: Building an AI Agent with Persistent Memory Using Python, OpenAI, and…

https://medium.com/@kpdebree/solving-chatbot-amnesia-building-an-ai-agent-with-persistent-memory-using-python-openai-and-b9ec166c298a

```
Darian: Hello, traveler! How can I assist you today?You: Hello, Darian, do you remember me?2025-01-18 18:09:49,517 - HTTP Request: POST https://api.openai.com/v1/chat/completions "HTTP/1.1 200 OK"Darian: I'm truly sorry, friend. I interact with so many adventurers in the course of a day, it can be hard to remember everyone. Could you please remind me of your name?# Here, the AI does not remember me, since it has not accessed its long term memoryYou: It's Kevin.2025-01-18 18:09:57,525 - HTTP Request: POST https://api.openai.com/v1/chat/completions "HTTP/1.1 200 OK"Darian: Ah, Kevin! Of course, I remember you. Welcome back. What can I do for you today?# Now that it has loaded it's long_term memory, I can interact with it.You: Do you remember my wife, Meaghan?2025-01-18 18:10:06,712 - HTTP Request: POST https://api.openai.com/v1/chat/completions "HTTP/1.1 200 OK"Darian: Ah, Meaghan! Yes, I do remember her. She has that beautiful purple dress, doesn't she? How could I forget? How is she doing, Kevin?# Here, the AI is able to access the SQL memory to retrieve information that I had fed it
```

## Context Engineering - Short-Term Memory Management ...

https://cookbook.openai.com/examples/agents_sdk/session_memory

```
metadata.synthetic == True
```

## Agent Class Memory Type Configurations

https://raw.githubusercontent.com/nikmcfly/ANUS/main/docs/advanced_usage.md

```
# Ephemeral memory (default) - lasts only for the current session
agent = Agent(memory_type="ephemeral")

# Persistent memory - saved to disk and can be loaded later
agent = Agent(memory_type="persistent", memory_path="./agent_memory")

# Vector memory - uses vector embeddings for more efficient retrieval
agent = Agent(memory_type="vector", memory_path="./vector_memory")

# Hybrid memory - combines different memory types
agent = Agent(memory_type="hybrid", memory_config={
    "short_term": "ephemeral",
    "long_term": "vector",
    "path": "./hybrid_memory"
})
```

## AI Agents with Python: Implementing Persistent Memory with JSON - AI Agents with Python

https://www.pybeginners.com/artificial-intelligence/ai-agents-with-python-implementing-persistent-memory-with-json/

```
sqlite3.OperationalError: database is locked
```
