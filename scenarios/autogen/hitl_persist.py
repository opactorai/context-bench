# use_case_3_hitl_persist.py
import asyncio, json, os
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

STATE_PATH = "email_team_state.json"

async def run_once(team, task: str):
    stream = team.run_stream(task=task)
    await Console(stream)

async def main():
    model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")

    assistant = AssistantAgent(
        "emailer",
        model_client=model_client,
        system_message="Write concise cold emails. After your first draft, await audience feedback."
    )

    # Pause after the first agent response to collect human feedback (HITL pattern)
    team = RoundRobinGroupChat([assistant], max_turns=1)

    if not os.path.exists(STATE_PATH):
        await run_once(team, "Propose a 2-step cold-email for a new product launch. Keep it friendly.")
        # Save state for later continuation
        team_state = await team.save_state()
        with open(STATE_PATH, "w") as f:
            json.dump(team_state, f)
        print("\n--- PAUSED: state saved to disk. Rerun this script to resume. ---")
    else:
        with open(STATE_PATH) as f:
            team_state = json.load(f)
        await team.load_state(team_state)
        audience = input("Audience feedback (e.g., 'B2B fintech founders'): ").strip()
        await run_once(team, f"Refine the cold email for this audience: {audience}")
        os.remove(STATE_PATH)

    await model_client.close()

if __name__ == "__main__":
    asyncio.run(main())
