# Oneshot Mode Result

**Scenario**: autogen:hitl-persist
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:29:54.369Z

---

## Query

Using the Autogen Python library with human-in-the-loop and state persistence, build an interactive agent system. Propose a 2-step cold-email. After your first draft, pause and wait for my feedback on the audience. When resumed, refine the email using my feedback.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "autogen",
  "semantic_queries": [
    "Using the Autogen Python library with human-in-the-loop and state persistence, build an interactive agent system. Propose a 2-step cold-email. After your first draft, pause and wait for my feedback on the audience. When resumed, refine the email using my feedback."
  ]
}
```

---

## Tool Result

# Interactive Cold-Email Agent System with Human-in-the-Loop

I'll build an interactive agent system using AutoGen that creates a cold-email in 2 steps with human feedback and state persistence.

```python
import asyncio
from dataclasses import dataclass
from typing import List, Optional
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

@dataclass
class EmailDraftState:
    """State container for email drafting process"""
    step: int = 1
    initial_draft: Optional[str] = None
    audience_feedback: Optional[str] = None
    final_draft: Optional[str] = None
    
    def to_dict(self):
        return {
            "step": self.step,
            "initial_draft": self.initial_draft,
            "audience_feedback": self.audience_feedback,
            "final_draft": self.final_draft
        }
    
    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)


class ColdEmailAgent:
    """Interactive cold-email drafting agent with human-in-the-loop"""
    
    def __init__(self, model_client: OpenAIChatCompletionClient):
        self.state = EmailDraftState()
        
        # Email drafting agent
        self.email_agent = AssistantAgent(
            name="EmailDrafter",
            model_client=model_client,
            system_message="""You are an expert cold-email copywriter. 
            Your emails are:
            - Personalized and relevant
            - Clear and concise (under 150 words)
            - Have a compelling subject line
            - Include a clear call-to-action
            - Professional yet conversational tone
            
            When drafting, always include:
            1. Subject line
            2. Email body
            3. Brief explanation of your approach
            """
        )
    
    async def step_1_initial_draft(self) -> str:
        """Step 1: Generate initial cold-email draft"""
        print("\n" + "="*60)
        print("STEP 1: INITIAL DRAFT GENERATION")
        print("="*60 + "\n")
        
        prompt = """Create a 2-step cold-email strategy for a B2B SaaS product 
        that helps companies automate their customer onboarding process.
        
        For now, create the FIRST draft assuming a general B2B audience 
        (startup founders and product managers).
        
        Provide:
        1. Subject line
        2. Email body (under 150 words)
        3. Your reasoning for this approach
        """
        
        # Generate draft
        response = await self.email_agent.on_messages(
            [TextMessage(content=prompt, source="user")],
            cancellation_token=None
        )
        
        draft = response.chat_message.content
        self.state.initial_draft = draft
        self.state.step = 1
        
        print("\n📧 INITIAL DRAFT:\n")
        print(draft)
        print("\n" + "-"*60)
        print("⏸️  PAUSING FOR HUMAN FEEDBACK")
        print("-"*60)
        print("\nPlease provide feedback about the target audience:")
        print("- Who specifically should we target?")
        print("- What industry or role?")
        print("- Any specific pain points to emphasize?")
        print("\nType your feedback below:\n")
        
        return draft
    
    async def step_2_refine_with_feedback(self, audience_feedback: str) -> str:
        """Step 2: Refine email based on human feedback"""
        print("\n" + "="*60)
        print("STEP 2: REFINING WITH FEEDBACK")
        print("="*60 + "\n")
        
        self.state.audience_feedback = audience_feedback
        self.state.step = 2
        
        print(f"📝 Received feedback: {audience_feedback}\n")
        print("🔄 Refining email draft...\n")
        
        refinement_prompt = f"""Based on this audience feedback, refine the cold-email:

FEEDBACK: {audience_feedback}

ORIGINAL DRAFT:
{self.state.initial_draft}

Create an improved version that:
1. Addresses the specific audience mentioned in feedback
2. Emphasizes relevant pain points
3. Adjusts tone and messaging accordingly
4. Keeps it under 150 words
5. Maintains professional quality

Provide:
1. Refined subject line
2. Refined email body
3. Explanation of key changes made based on feedback
"""
        
        response = await self.email_agent.on_messages(
            [TextMessage(content=refinement_prompt, source="user")],
            cancellation_token=None
        )
        
        refined_draft = response.chat_message.content
        self.state.final_draft = refined_draft
        
        print("\n📧 REFINED DRAFT:\n")
        print(refined_draft)
        print("\n" + "="*60)
        print("✅ PROCESS COMPLETE")
        print("="*60 + "\n")
        
        return refined_draft
    
    def save_state(self, filepath: str = "email_agent_state.json"):
        """Save agent state to file"""
        import json
        with open(filepath, 'w') as f:
            json.dump(self.state.to_dict(), f, indent=2)
        print(f"💾 State saved to {filepath}")
    
    def load_state(self, filepath: str = "email_agent_state.json"):
        """Load agent state from file"""
        import json
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            self.state = EmailDraftState.from_dict(data)
            print(f"📂 State loaded from {filepath}")
            return True
        except FileNotFoundError:
            print(f"⚠️  No saved state found at {filepath}")
            return False
    
    def get_current_state(self) -> dict:
        """Get current state for inspection"""
        return self.state.to_dict()


async def main():
    """Main execution flow with human-in-the-loop"""
    
    # Initialize model client
    model_client = OpenAIChatCompletionClient(
        model="gpt-4o",
        api_key="your-api-key-here"  # Replace with your API key
    )
    
    # Create agent
    agent = ColdEmailAgent(model_client)
    
    # STEP 1: Generate initial draft
    initial_draft = await agent.step_1_initial_draft()
    
    # Save state after step 1
    agent.save_state()
    
    # HUMAN INPUT: Get feedback (simulated here, in real use this would be input())
    print("\n" + "="*60)
    audience_feedback = input("Your feedback: ")
    print("="*60 + "\n")
    
    # STEP 2: Refine with feedback
    final_draft = await agent.step_2_refine_with_feedback(audience_feedback)
    
    # Save final state
    agent.save_state()
    
    # Show final state
    print("\n📊 FINAL STATE:")
    import json
    print(json.dumps(agent.get_current_state(), indent=2))


# Alternative: Resume from saved state
async def resume_from_saved_state():
    """Resume the process from a saved state"""
    model_client = OpenAIChatCompletionClient(
        model="gpt-4o",
        api_key="your-api-key-here"
    )
    
    agent = ColdEmailAgent(model_client)
    
    if agent.load_state():
        if agent.state.step == 1 and agent.state.initial_draft:
            print("\n📧 Resuming from Step 1...")
            print("\nPrevious draft:")
            print(agent.state.initial_draft)
            
            audience_feedback = input("\nYour feedback: ")
            await agent.step_2_refine_with_feedback(audience_feedback)
            agent.save_state()
    else:
        print("Starting fresh process...")
        await main()


if __name__ == "__main__":
    # Run the interactive process
    asyncio.run(main())
    
    # To resume from saved state:
    # asyncio.run(resume_from_saved_state())
```

## Key Features Implemented:

### 1. **Human-in-the-Loop Pattern**
- Pauses after Step 1 for human feedback
- Incorporates feedback into Step 2 refinement
- Based on the handoffs pattern from the documentation

### 2. **State Persistence**
- `EmailDraftState` dataclass stores all state
- `save_state()` and `load_state()` methods for persistence
- Can resume from any saved checkpoint
- As noted in the docs: "In `v0.2` there is no built-in way to save and load an agent's state" - so I implemented custom state management

### 3. **Two-Step Process**
- **Step 1**: Initial draft generation
- **Pause**: Wait for human feedback on audience
- **Step 2**: Refine based on feedback

### 4. **Interactive Flow**
```
Start → Generate Draft → Save State → Get Feedback → Refine → Save State → Complete
          (Step 1)                       ⏸️              (Step 2)
```

## Usage Example:

```python
# First run - generates initial draft and waits
await main()
# Output: Initial draft + pause for feedback

# After providing feedback like:
# "Target CTOs at enterprise healthcare companies, 
#  emphasize HIPAA compliance and integration complexity"

# Agent refines the email with this context
```

## To Use This System:

1. **Install dependencies**:
```bash
pip install autogen-agentchat autogen-ext[openai]
```

2. **Set your API key**

3. **Run interactively** - it will pause and wait for your input

4. **State is automatically saved** - you can resume if interrupted

Would you like me to proceed with generating an actual cold-email draft now? Please provide:
- Your target audience details
- Product/service information
- Any specific goals for the email

## Sources

### Source 1

### Source 2

### Source 3

### Source 4

### Source 5

### Source 6

### Source 7

### Source 8

### Source 9

### Source 10


💡 **Need more details from a source?**

If you need more information from the source links provided above, use the `read_source_content` tool from the available tools provided by Nia to get full context about that particular source.


## 🔍 Suggested Follow-up Questions

1. How does the ColdEmailAgent handle state persistence across multiple user sessions, and are there mechanisms in place to serialize and restore EmailDraftState to and from external storage (e.g., files or databases)?
2. What strategies are available in the AutoGen library for integrating richer user feedback (such as structured forms or ratings) during the human-in-the-loop step, and how would these be incorporated into the EmailDraftState?
3. How can the system be tested to ensure that the agent properly pauses for feedback, resumes with updated context, and gracefully handles edge cases such as missing or invalid audience feedback?

*These questions are based on the documentation and can help you explore related topics.*
