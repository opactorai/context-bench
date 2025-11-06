# copy_workflow.py
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.workflow import Workflow, StepOutput

# Step 1: deterministic preprocessing via a Python function
def extract_requirements(step_input):
    # StepInput has `.input`; forward as normalized "REQUIREMENTS"
    text = step_input.input if hasattr(step_input, "input") else str(step_input)
    return StepOutput(content=f"REQUIREMENTS:\n{text.strip()}")

# Step 2: agent generates copy from requirements
copywriter = Agent(
    name="Copywriter",
    model=OpenAIChat(id="gpt-4o"),
    instructions=(
        "Given REQUIREMENTS, write a concise landing page: headline, 3 bullet benefits, "
        "and one strong CTA. Output in markdown."
    ),
)

# Step 3: agent translates to Spanish
translator = Agent(
    name="Translator",
    model=OpenAIChat(id="gpt-4o"),
    instructions="Translate the previous step's output to Spanish. Keep formatting.",
)

workflow = Workflow(
    name="Spec→Copy→Spanish",
    steps=[extract_requirements, copywriter, translator],
)

workflow.print_response(
    input=(
        "Product: Cloud cost analyzer for Kubernetes. Audience: DevOps & platform teams. "
        "Key value: 20% lower spend in 30 days; per-namespace showback; SOC2 compliant."
    ),
    stream=True,
    stream_events=True,
    markdown=True,
    show_step_details=True,  # see each step's output
)
