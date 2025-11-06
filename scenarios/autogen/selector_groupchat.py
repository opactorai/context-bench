# use_case_4_selector_groupchat.py
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

# --- Mock tools (no external deps) ---
def search_web_tool(query: str) -> str:
    if "baseline" in query:
        return "Baseline value: 200 (mock)."
    if "current" in query:
        return "Current value: 260 (mock)."
    return "No data."

def percentage_change_tool(start: float, end: float) -> float:
    return ((end - start) / start) * 100.0

async def main():
    model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")

    planner = AssistantAgent(
        "Planner",
        description="Breaks tasks into steps; summarizes at the end. Should speak first.",
        model_client=model_client,
        system_message=(
            "You plan and delegate only. After all tasks are complete, "
            "summarize findings and end with 'TERMINATE'."
        ),
    )
    searcher = AssistantAgent(
        "WebSearch",
        description="Looks up facts with search_web_tool.",
        model_client=model_client,
        tools=[search_web_tool],
        system_message="Use the search tool to fetch simple mock values (baseline/current).",
    )
    analyst = AssistantAgent(
        "Analyst",
        description="Performs calculations with percentage_change_tool.",
        model_client=model_client,
        tools=[percentage_change_tool],
        system_message="Compute requested percentage changes, then answer plainly.",
    )

    selector_prompt = """Select exactly one next speaker.
{roles}
Conversation so far:
{history}
Candidates: {participants}
Make sure the Planner assigns tasks before others proceed.
"""

    term = TextMentionTermination("TERMINATE") | MaxMessageTermination(max_messages=25)

    team = SelectorGroupChat(
        [planner, searcher, analyst],
        model_client=model_client,             # as shown in docs
        termination_condition=term,
        selector_prompt=selector_prompt,
        allow_repeated_speaker=True,
    )

    task = (
        "Plan the steps to: find a baseline and current value via WebSearch, "
        "have Analyst compute percentage change, and then finish."
    )

    await Console(team.run_stream(task=task))
    await model_client.close()

if __name__ == "__main__":
    asyncio.run(main())
