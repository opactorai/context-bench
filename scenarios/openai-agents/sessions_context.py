# uc3_sessions_context.py
import asyncio
from dataclasses import dataclass
from agents import Agent, Runner, SQLiteSession, function_tool, RunContextWrapper

DB_PATH = "conversation_history.db"
SESSION_ID = "demo_user_123"

@dataclass
class UserProfile:
    name: str
    city: str

@function_tool
def my_city(ctx: RunContextWrapper[UserProfile]) -> str:
    """Return the user's city from local context."""
    return ctx.context.city

def make_agent() -> Agent[UserProfile]:
    def dynamic_instructions(ctx: RunContextWrapper[UserProfile], agent: Agent[UserProfile]) -> str:
        return f"You are concise. The user's name is {ctx.context.name}. Use tools when needed."
    return Agent[UserProfile](
        name="MemoryAgent",
        instructions=dynamic_instructions,
        tools=[my_city],
    )

async def main():
    import sys
    user_input = " ".join(sys.argv[1:]) or "What's my city?"
    agent = make_agent()
    session = SQLiteSession(SESSION_ID, DB_PATH)

    # Provide local context (not sent to the LLM)
    profile = UserProfile(name="Alex", city="Seoul")

    result = await Runner.run(agent, user_input, session=session, context=profile)
    print("Answer:", result.final_output)

    # Introspect what got added this turn
    print("New items this turn:", [it.type for it in result.new_items])
    # Prepare next-turn inputs if you want to chain
    next_inputs = result.to_input_list()
    print("Next-turn input count:", len(next_inputs))

if __name__ == "__main__":
    asyncio.run(main())
