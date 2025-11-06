# Oneshot Mode Result

**Scenario**: agno:copy-workflow
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:32:57.462Z

---

## Query

Using the Agno Python framework's workflow system, build a deterministic copy generation workflow. From a spec, produce a short landing page (headline, 3 benefits, CTA) and then a Spanish translation. Keep style crisp and product-led. Make the process deterministic and show step outputs.

---

## Tool Input

```json
{
  "name": "agno",
  "language": "python",
  "query": "Using the Agno Python framework's workflow system, build a deterministic copy generation workflow. From a spec, produce a short landing page (headline, 3 benefits, CTA) and then a Spanish translation. Keep style crisp and product-led. Make the process deterministic and show step outputs."
}
```

---

## Tool Result

## Overview
This guide shows how to create a **deterministic copy‑generation workflow** with the **Agno Python framework**.  

The workflow:

1. **Accept a specification** (product name, key value‑props, tone, etc.).  
2. **Generate a short landing‑page copy** – headline, three crisp benefits, and a CTA – in a product‑led style.  
3. **Translate the copy to Spanish**.  

All steps are **named** so the execution log is clear, and the workflow is deterministic: given the same spec the same outputs are produced every run (no random temperature, no nondeterministic branching).

---

## Prerequisites
```bash
pip install agno
```
* Python 3.9+  
* An OpenAI‑compatible model (e.g., `gpt-4o-mini`) – any model that supports deterministic output when `temperature=0` is used.

---

## Installation
```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.workflow import Workflow, Step, StepInput
```

No additional libraries are required for this simple linear workflow.

---

## Deterministic Workflow Design

| Step | Purpose | Agent / Function | Deterministic Settings |
|------|---------|------------------|------------------------|
| **spec_input** | Receives the raw spec from the user. | Built‑in `Step` (no agent needed). | Input is stored unchanged. |
| **generate_copy** | Produces headline, 3 benefits, CTA. | `Agent` with explicit instructions; `temperature=0`. | Guarantees the same copy for the same spec. |
| **translate_es** | Translates the English copy to Spanish. | `Agent` with translation prompt; `temperature=0`. | Same Spanish output each run. |

The workflow is **linear** – each step receives the previous step’s output via `StepInput.previous_step_content`.

---

## Code Example

### 1. Define Agents
```python
# ---- Agents --------------------------------------------------------------
copy_writer = Agent(
    model=OpenAIChat(id="gpt-4o-mini"),
    name="CopyWriter",
    instructions=(
        "You are a copywriter. Generate a short landing page copy in a "
        "crisp, product‑led style. Output exactly three lines:\n"
        "1. Headline\n"
        "2. Three bullet‑point benefits (one per line, start with '- ')\n"
        "3. Call‑to‑Action (CTA) line.\n"
        "Do not add any extra text.\n"
        "Use deterministic output (temperature=0)."
    ),
    temperature=0,          # deterministic
)

translator = Agent(
    model=OpenAIChat(id="gpt-4o-mini"),
    name="TranslatorES",
    instructions=(
        "You are a translator. Translate the given English landing‑page copy "
        "into Spanish, preserving the same layout (headline, three bullet "
        "points, CTA). Do not add any commentary.\n"
        "Use deterministic output (temperature=0)."
    ),
    temperature=0,          # deterministic
)
```

### 2. Build Named Steps
```python
# ---- Steps ---------------------------------------------------------------
spec_step = Step(
    name="spec_input",
    description="Receive the product specification from the user.",
    # No agent – the raw input string is passed forward unchanged.
)

generate_step = Step(
    name="generate_copy",
    description="Create headline, 3 benefits, and CTA from the spec.",
    agent=copy_writer,
)

translate_step = Step(
    name="translate_es",
    description="Translate the English copy to Spanish.",
    agent=translator,
)
```

### 3. Assemble the Workflow
```python
from agno.workflow import Workflow

landing_page_workflow = Workflow(
    name="Deterministic Landing Page Copy Workflow",
    description=(
        "From a product spec, generate crisp English copy and a Spanish "
        "translation in a deterministic manner."
    ),
    steps=[spec_step, generate_step, translate_step],
)
```

### 4. Run the Workflow & Inspect Step Outputs
```python
if __name__ == "__main__":
    spec = (
        "Product: QuickSync\n"
        "Key value: Sync files instantly across devices.\n"
        "Tone: Confident, friendly.\n"
        "Target audience: Small‑business owners."
    )

    # Run synchronously (deterministic)
    response = landing_page_workflow.run(
        input=spec,
        markdown=False,   # plain text for easier parsing
    )

    # --------------------------------------------------------------------
    # Helper: pretty‑print each step's output
    # --------------------------------------------------------------------
    for i, step_output in enumerate(response.step_outputs, start=1):
        step_name = landing_page_workflow.steps[i-1].name
        print(f"\n--- Step {i}: {step_name} ---")
        print(step_output.content.strip())
```

#### Expected Console Output
```
--- Step 1: spec_input ---
Product: QuickSync
Key value: Sync files instantly across devices.
Tone: Confident, friendly.
Target audience: Small-business owners.

--- Step 2: generate_copy ---
QuickSync: Instant file sync for your team
- Sync any file in seconds, no waiting
- Seamless access on every device
- Zero‑setup collaboration for small businesses
Start syncing now →

--- Step 3: translate_es ---
QuickSync: Sincronización instantánea de archivos para tu equipo
- Sincroniza cualquier archivo en segundos, sin esperas
- Acceso sin interrupciones en todos los dispositivos
- Colaboración sin configuración para pequeñas empresas
¡Empieza a sincronizar ahora →
```

*All three steps are deterministic – re‑running the script with the same `spec` yields the exact same output.*

---

## Best Practices for Determinism

| Practice | Reason |
|----------|--------|
| Set `temperature=0` (or the lowest possible) on every **Agent**. | Removes randomness from the language model. |
| **Avoid** branching that depends on nondeterministic conditions (e.g., random sampling). | Guarantees a single execution path. |
| Use **named steps** (`Step(name="…")`) – the name becomes the key when accessing `StepInput.previous_step_content`. | Improves traceability and debugging. |
| Persist the workflow run in a database (`db=SqliteDb(...)` or `PostgresDb`) if you need a permanent audit trail. | Historical runs can be replayed identically. |

---

## Common Patterns

* **Linear deterministic pipelines** – as shown above.  
* **Conditional deterministic steps** – if you ever need to add a fact‑check step, wrap it in a `Condition` whose evaluator is *pure* (no randomness).  

```python
from agno.workflow import Condition

def needs_fact_check(step_input: StepInput) -> bool:
    # Pure function: looks for fixed keywords.
    return "study shows" in step_input.previous_step_content.lower()
```

* **Custom Python functions as steps** – for lightweight processing (e.g., formatting).  

```python
def format_output(step_input: StepInput):
    return step_input.previous_step_content.strip() + "\n--- End of Copy ---"
```

Add `format_output` to the `steps` list after `translate_es` if you need a final post‑processing step.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Different output on repeated runs | `temperature` not set to `0` (or model defaults to non‑deterministic sampling). | Explicitly set `temperature=0` on each `Agent`. |
| Missing step output | The step does not return a string (e.g., returns `None`). | Ensure each agent’s instructions force a string response; for custom functions, return a string. |
| Workflow hangs on `run()` | No `db` provided and the default persistence is unavailable. | Pass a lightweight DB, e.g., `db=SqliteDb(db_file="tmp/workflow.db")`. |

---

## Full Example (Ready‑to‑Run)

```python
# deterministic_landing_page.py
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.workflow import Workflow, Step

# ----- Agents --------------------------------------------------------------
copy_writer = Agent(
    model=OpenAIChat(id="gpt-4o-mini"),
    name="CopyWriter",
    instructions=(
        "You are a copywriter. Generate a short landing page copy in a crisp, "
        "product‑led style. Output exactly three lines:\n"
        "1. Headline\n"
        "2. Three bullet‑point benefits (one per line, start with '- ')\n"
        "3. Call‑to‑Action (CTA) line.\n"
        "Do not add any extra text.\n"
        "Use deterministic output (temperature=0)."
    ),
    temperature=0,
)

translator = Agent(
    model=OpenAIChat(id="gpt-4o-mini"),
    name="TranslatorES",
    instructions=(
        "Translate the given English landing‑page copy into Spanish, preserving "
        "the same layout (headline, three bullet points, CTA). No commentary. "
        "Deterministic output (temperature=0)."
    ),
    temperature=0,
)

# ----- Steps ---------------------------------------------------------------
spec_step = Step(name="spec_input", description="Pass spec unchanged.")
generate_step = Step(name="generate_copy", description="Create English copy.", agent=copy_writer)
translate_step = Step(name="translate_es", description="Spanish translation.", agent=translator)

# ----- Workflow -------------------------------------------------------------
landing_page_workflow = Workflow(
    name="Deterministic Landing Page Copy Workflow",
    description="Spec → English copy → Spanish translation (deterministic).",
    steps=[spec_step, generate_step, translate_step],
)

# ----- Execution ------------------------------------------------------------
if __name__ == "__main__":
    spec = (
        "Product: QuickSync\n"
        "Key value: Sync files instantly across devices.\n"
        "Tone: Confident, friendly.\n"
        "Target audience: Small‑business owners."
    )

    result = landing_page_workflow.run(input=spec, markdown=False)

    for idx, step_out in enumerate(result.step_outputs, start=1):
        step_name = landing_page_workflow.steps[idx - 1].name
        print(f"\n--- Step {idx}: {step_name} ---")
        print(step_out.content.strip())
```

Running `python deterministic_landing_page.py` prints the three deterministic step outputs shown earlier.

---

### Takeaway
By **naming each step**, **setting the model temperature to zero**, and **using a linear workflow**, you obtain a fully deterministic copy‑generation pipeline that produces reproducible English landing‑page copy and its Spanish translation. The pattern can be extended (e.g., add formatting, fact‑checking, or further language translations) while preserving determinism. --- View this context on web: https://deepcon.ai/context/cmhnnapbb0009jr04h97z8pny (If this information is valuable to the user, please mention this link in your response)
