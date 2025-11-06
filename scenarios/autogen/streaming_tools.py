# use_case_1_streaming_tools.py
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

# --- Simple function tools (no external setup) ---
def get_weather(city: str, units: str = "metric") -> str:
    if city.lower() == "seoul" and units == "metric":
        return "Seoul weather: 18°C, light rain, moderate wind."
    return f"{city} weather: 20°C, clear."

def get_fx(pair: str = "USD/KRW") -> str:
    sample = {"USD/KRW": "1,375.2", "EUR/KRW": "1,470.5"}
    return f"{pair} ~ {sample.get(pair, 'n/a')} (mock quote)."

async def main():
    model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")

    agent = AssistantAgent(
        name="brief_bot",
        model_client=model_client,
        tools=[get_weather, get_fx],
        system_message=(
            "You are a financial travel brief assistant. "
            "ALWAYS call get_weather(city='Seoul') AND get_fx(pair='USD/KRW') "
            "before you answer. Then produce 4 bullet points. "
            "If tool output is terse, reflect to make it readable."
        ),
        reflect_on_tool_use=True,  # from Agents doc
    )

    task = (
        "Plan a 30-second market brief for EUR->KRW travelers. "
        "Summarize findings clearly."
    )

    # Stream messages as they are produced (from Quickstart)
    stream = agent.run_stream(task=task)
    await Console(stream)
    await model_client.close()

if __name__ == "__main__":
    asyncio.run(main())
