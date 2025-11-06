# Oneshot Mode Result

**Scenario**: autogen:team-termination
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:29:33.251Z

---

## Query

Using the Autogen Python library with teams and termination conditions, build a multi-agent system. Draft a 6-line product tagline for a sustainable water bottle. A critic must review and APPROVE; otherwise iterate. If we exceed a small turn budget, stop automatically.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "autogen",
  "semantic_queries": [
    "Using the Autogen Python library with teams and termination conditions, build a multi-agent system. Draft a 6-line product tagline for a sustainable water bottle. A critic must review and APPROVE; otherwise iterate. If we exceed a small turn budget, stop automatically."
  ]
}
```

---

## Tool Result

# Multi-Agent System for Sustainable Water Bottle Tagline

Based on the AutoGen documentation, here's a complete implementation using teams and termination conditions:

```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

async def main():
    # Initialize the model client
    model_client = OpenAIChatCompletionClient(
        model="gpt-4o",
        temperature=0.8,
        # api_key="sk-...",  # Optional if OPENAI_API_KEY env variable is set
    )
    
    # Create the writer agent - generates taglines
    writer_agent = AssistantAgent(
        "writer",
        model_client=model_client,
        system_message="""You are a creative copywriter specializing in sustainable products.
        Write a compelling 6-line product tagline for a sustainable water bottle.
        Focus on environmental impact, quality, and lifestyle benefits.
        Each line should be concise and impactful."""
    )
    
    # Create the critic agent - reviews and approves
    critic_agent = AssistantAgent(
        "critic",
        model_client=model_client,
        system_message="""You are a marketing critic with expertise in sustainable branding.
        Review the 6-line tagline for:
        1. Exactly 6 lines
        2. Clear environmental messaging
        3. Emotional appeal
        4. Brand memorability
        5. Conciseness and impact
        
        Provide constructive feedback. When all criteria are met, respond with 'APPROVE'."""
    )
    
    # Combine termination conditions using OR operator
    # Stop when EITHER condition is met:
    # 1. Text "APPROVE" is mentioned (critic approves)
    # 2. Maximum of 8 messages exchanged (small turn budget)
    text_termination = TextMentionTermination("APPROVE")
    max_msg_termination = MaxMessageTermination(max_messages=8)
    combined_termination = text_termination | max_msg_termination
    
    # Create RoundRobinGroupChat team
    team = RoundRobinGroupChat(
        [writer_agent, critic_agent],
        termination_condition=combined_termination
    )
    
    # Run the team with streaming output
    task = "Create a 6-line product tagline for a sustainable water bottle that emphasizes eco-friendliness and premium quality."
    
    await Console(team.run_stream(task=task))

# Run the async function
if __name__ == "__main__":
    asyncio.run(main())
```

## Key Features Explained

### 1. **Termination Conditions** (Combined Logic)
```python
combined_termination = text_termination | max_msg_termination
```
- **`TextMentionTermination("APPROVE")`**: Stops when critic says "APPROVE"
- **`MaxMessageTermination(max_messages=8)`**: Stops after 8 messages (turn budget)
- **OR operator (`|`)**: Stops when EITHER condition is met

### 2. **RoundRobinGroupChat Team**
Alternates between writer and critic agents in a structured conversation pattern.

### 3. **Automatic Reset**
Termination conditions automatically reset after each `run` or `run_stream` call, allowing the team to resume conversations.

## Alternative: AND Logic

If you want BOTH conditions to be met before stopping:

```python
combined_termination = text_termination & max_msg_termination
```

This would require the critic to approve AND reach 8 messages.

## Expected Output Flow

```
---------- user ----------
Create a 6-line product tagline...

---------- writer ----------
[Generates 6-line tagline]

---------- critic ----------
[Reviews and provides feedback OR says APPROVE]

[Iteration continues until APPROVE or 8 messages reached]
```

## Sources
- **Basic Usage & Termination**: https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/termination.html#basic-usage
- **Combining Termination Conditions**: https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/termination.html#combining-termination-conditions
- **RoundRobinGroupChat Examples**: Multiple references in autogen_ext.agents.file_surfer.html and autogen_core.models.html

This implementation ensures efficient iteration with automatic termination, preventing runaway costs while ensuring quality approval.

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

1. How does the RoundRobinGroupChat manage turn-taking between the writer and critic agents, and can it be extended to more than two agents with different roles?
2. What strategies can be used to handle cases where the critic never responds with 'APPROVE' within the maximum message limit—can the system provide a fallback or summary output?
3. How can the termination conditions be tested or validated to ensure that the system reliably stops when either the 'APPROVE' text is mentioned or the message limit is reached?

*These questions are based on the documentation and can help you explore related topics.*
