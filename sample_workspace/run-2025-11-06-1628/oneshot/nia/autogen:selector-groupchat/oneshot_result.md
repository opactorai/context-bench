# Oneshot Mode Result

**Scenario**: autogen:selector-groupchat
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:29:58.806Z

---

## Query

Using the Autogen Python library with selector-based group chat, create a small research 'crew': (1) Plan subtasks; (2) run a mock web search; (3) compute a percentage change; Stop when planning is complete and say 'TERMINATE'.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "autogen",
  "semantic_queries": [
    "Using the Autogen Python library with selector-based group chat, create a small research 'crew': (1) Plan subtasks; (2) run a mock web search; (3) compute a percentage change; Stop when planning is complete and say 'TERMINATE'."
  ]
}
```

---

## Tool Result

# Selector-Based Group Chat Research Crew with AutoGen

Here's a complete implementation of a research crew using AutoGen's selector-based group chat:

```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Mock tools for demonstration
def search_web_tool(query: str) -> str:
    """Mock web search tool"""
    if "2006-2007" in query:
        return """Here are the total points scored by Miami Heat players in the 2006-2007 season:
        Udonis Haslem: 844 points
        Dwayne Wade: 1397 points
        James Posey: 550 points
        """
    elif "2007-2008" in query:
        return "The number of total rebounds for Dwayne Wade in the Miami Heat season 2007-2008 is 214."
    elif "2008-2009" in query:
        return "The number of total rebounds for Dwayne Wade in the Miami Heat season 2008-2009 is 398."
    return "No data found."

def percentage_change_tool(start: float, end: float) -> float:
    """Calculate percentage change between two values"""
    return ((end - start) / start) * 100

async def main():
    # Initialize model client
    model_client = OpenAIChatCompletionClient(model="gpt-4o")
    
    # 1. Planning Agent - Breaks down tasks
    planning_agent = AssistantAgent(
        "PlanningAgent",
        description="An agent for planning tasks, this agent should be the first to engage when given a new task.",
        model_client=model_client,
        system_message="""
        You are a planning agent. Your job is to break down complex tasks into smaller, manageable subtasks.
        
        Your team members are:
        - WebSearchAgent: Searches for information
        - DataAnalystAgent: Performs calculations
        
        You only plan and delegate tasks - you do not execute them yourself.
        When assigning tasks, use this format:
        1. <agent>: <task>
        
        After all tasks are complete, summarize the findings and end with "TERMINATE".
        """
    )
    
    # 2. Web Search Agent - Retrieves information
    web_search_agent = AssistantAgent(
        "WebSearchAgent",
        description="An agent for searching information on the web.",
        tools=[search_web_tool],
        model_client=model_client,
        system_message="""
        You are a web search agent. Your only tool is search_web_tool - use it to find information.
        You make only one search call at a time.
        Once you have the results, you never do calculations based on them.
        """
    )
    
    # 3. Data Analyst Agent - Performs calculations
    data_analyst_agent = AssistantAgent(
        "DataAnalystAgent",
        description="An agent for performing calculations.",
        model_client=model_client,
        tools=[percentage_change_tool],
        system_message="""
        You are a data analyst. Given the tasks you have been assigned, 
        you should analyze the data and provide results using the tools provided.
        If you have not seen the data, ask for it.
        """
    )
    
    # Termination conditions
    text_mention_termination = TextMentionTermination("TERMINATE")
    max_messages_termination = MaxMessageTermination(max_messages=25)
    termination = text_mention_termination | max_messages_termination
    
    # Custom selector prompt
    selector_prompt = """Select an agent to perform task.
    {roles}
    
    Current conversation context:
    {history}
    
    Read the above conversation, then select an agent from {participants} to perform the next task.
    Make sure the planner agent has assigned tasks before other agents start working.
    Only select one agent.
    """
    
    # Create the team
    team = SelectorGroupChat(
        [planning_agent, web_search_agent, data_analyst_agent],
        model_client=model_client,
        termination_condition=termination,
        selector_prompt=selector_prompt,
        allow_repeated_speaker=True,  # Allow an agent to speak multiple turns in a row
    )
    
    # Define the task
    task = """Who was the Miami Heat player with the highest points in the 2006-2007 season, 
    and what was the percentage change in his total rebounds between the 2007-2008 and 2008-2009 seasons?"""
    
    # Run the team
    result = await team.run(task=task)
    
    print("\n=== FINAL RESULT ===")
    print(result)

# Run the async main function
if __name__ == "__main__":
    asyncio.run(main())
```

## Key Components Explained:

### **1. Three Specialized Agents:**
- **PlanningAgent**: Breaks down complex tasks into subtasks and delegates to other agents
- **WebSearchAgent**: Uses `search_web_tool` to retrieve information
- **DataAnalystAgent**: Uses `percentage_change_tool` to perform calculations

### **2. Termination Conditions:**
- Stops when "TERMINATE" is mentioned in a message
- Also has a safety limit of 25 messages maximum

### **3. Workflow:**
1. SelectorGroupChat selects the Planning Agent based on agent descriptions
2. Planning Agent breaks down the task and assigns subtasks
3. Manager dynamically selects WebSearchAgent to perform searches
4. Manager selects DataAnalystAgent to calculate percentage change
5. Planning Agent summarizes and sends "TERMINATE"

### **Important Notes:**
- Agent `name` and `description` attributes are crucial for the selector to choose the right agent
- `allow_repeated_speaker=True` allows an agent to speak multiple consecutive turns
- The selector uses a language model to intelligently choose the next speaker based on context

**Source:** [AutoGen Selector Group Chat Documentation](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/selector-group-chat.html)

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

1. How does the SelectorGroupChat determine which agent to delegate a specific subtask to, and can the selection criteria be customized for different workflows?
2. What mechanisms are available in AutoGen to handle errors or unexpected outputs from the mock tools, such as invalid data returned by search_web_tool or division by zero in percentage_change_tool?
3. Are there built-in features or recommended patterns in AutoGen for testing and validating the collaborative workflow between agents, especially for ensuring correct subtask delegation and termination conditions?

*These questions are based on the documentation and can help you explore related topics.*