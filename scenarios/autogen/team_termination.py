# use_case_2_team_termination.py
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

async def main():
    model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")

    writer = AssistantAgent(
        "writer",
        model_client=model_client,
        system_message="You craft concise, compelling taglines. Try once, then incorporate critic feedback."
    )
    critic = AssistantAgent(
        "critic",
        model_client=model_client,
        system_message="Review for clarity and sustainability tone. Say 'APPROVE' only when it's ready."
    )

    # Combine a 'mention APPROVE' condition with a tiny max-message budget
    termination = TextMentionTermination("APPROVE") | MaxMessageTermination(max_messages=6)

    team = RoundRobinGroupChat([writer, critic], termination_condition=termination)

    task = "Create a 6-line product tagline for a sustainable water bottle."
    await Console(team.run_stream(task=task))

    await model_client.close()

if __name__ == "__main__":
    asyncio.run(main())
