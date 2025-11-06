# content_team.py
from agno.agent import Agent
from agno.team import Team
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

planner = Agent(
    id="planner",
    name="Planner",
    role="Define persona, messaging angle, and outline",
    instructions=(
        "Decide on a clear buyer persona and messaging. "
        "Produce a concise outline with section goals."
    ),
)

researcher = Agent(
    id="researcher",
    name="Researcher",
    role="Find credible references",
    tools=[DuckDuckGoTools()],
    instructions=(
        "Search the web for relevant sources (eco materials, sustainability, competitors). "
        "Return 3–5 high-quality links with 1-line justifications."
    ),
)

writer = Agent(
    id="writer",
    name="Writer",
    role="Draft final post",
    instructions=(
        "Write a 1-page blog post in markdown. "
        "Cite the Researcher's links inline. Keep tone warm, credible, and benefit-led."
    ),
)

team = Team(
    name="Bottle Launch Team",
    members=[planner, researcher, writer],
    model=OpenAIChat(id="gpt-4o"),  # leader model; members inherit if not set
    instructions="Coordinate, delegate to members, and produce a cohesive final output.",
)

team.print_response(
    "Create a launch blog post for our eco-friendly stainless water bottle",
    stream=True,
    stream_events=True,
)
