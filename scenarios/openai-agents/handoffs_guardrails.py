# uc2_handoffs_guardrails.py
import sys, re, asyncio
from typing import List
from agents import (
    Agent, Runner, handoff,
    input_guardrail, GuardrailFunctionOutput,
    RunContextWrapper, TResponseInputItem,
    InputGuardrailTripwireTriggered,
)

# Specialists
calculator = Agent(name="Calculator", instructions="Do exact math. Reply with just the number.")
writer = Agent(name="Writer", instructions="Write one concise sentence.")

# Simple input guardrail: flag potential credit card numbers.
@input_guardrail
async def block_pii(
    ctx: RunContextWrapper[None],
    agent: Agent,
    input: str | List[TResponseInputItem]
) -> GuardrailFunctionOutput:
    text = input if isinstance(input, str) else " ".join(
        (i.get("content") or "") if isinstance(i, dict) else str(i) for i in input
    )
    flagged = bool(re.search(r"\b(?:\d[ -]*?){13,19}\b", text.lower()))
    return GuardrailFunctionOutput(output_info={"flagged": flagged}, tripwire_triggered=flagged)

# Router with handoffs and guardrail
router = Agent(
    name="Router",
    instructions=(
        "If the user asks for math or a numeric computation, hand off to Calculator; "
        "otherwise hand off to Writer. Keep final answers very short."
    ),
    handoffs=[calculator, handoff(writer)],
    input_guardrails=[block_pii],
)

async def main():
    user_input = " ".join(sys.argv[1:]) or "what is 12*9?"
    try:
        result = await Runner.run(router, user_input)
        print(result.final_output)
    except InputGuardrailTripwireTriggered:
        print("Blocked: sensitive number detected. Please remove payment details.")

if __name__ == "__main__":
    asyncio.run(main())
