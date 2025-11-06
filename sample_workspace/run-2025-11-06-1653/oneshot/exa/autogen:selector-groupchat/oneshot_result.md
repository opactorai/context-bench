# Oneshot Mode Result

**Scenario**: autogen:selector-groupchat
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:54:50.897Z

---

## Query

Using the Autogen Python library with selector-based group chat, create a small research 'crew': (1) Plan subtasks; (2) run a mock web search; (3) compute a percentage change; Stop when planning is complete and say 'TERMINATE'.

---

## Tool Input

```json
{
  "query": "Using the Autogen Python library with selector-based group chat, create a small research 'crew': (1) Plan subtasks; (2) run a mock web search; (3) compute a percentage change; Stop when planning is complete and say 'TERMINATE'."
}
```

---

## Tool Result

## Selector Group Chat — AutoGen

https://microsoft.github.io/autogen/dev/user-guide/agentchat-user-guide/selector-group-chat.html

```
TaskResult(messages=[TextMessage(source='user', models_usage=None, content='Who was the Miami Heat player with the highest points in the 2006-2007 season, and what was the percentage change in his total rebounds between the 2007-2008 and 2008-2009 seasons?', type='TextMessage'), ToolCallRequestEvent(source='WebSearchAgent', models_usage=RequestUsage(prompt_tokens=103, completion_tokens=384), content=[FunctionCall(id='call_hl7EP6Lp5jj5wEdxeNHTwUVG', arguments='{"query": "Who was the Miami Heat player with the highest points in the 2006-2007 season Miami Heat statistics Dwyane Wade rebounds percentage change 2007-2008 2008-2009 seasons"}', name='search_web_tool')], type='ToolCallRequestEvent'), ToolCallExecutionEvent(source='WebSearchAgent', models_usage=None, content=[FunctionExecutionResult(content='Here are the total points scored by Miami Heat players in the 2006-2007 season:\n Udonis Haslem: 844 points\n Dwayne Wade: 1397 points\n James Posey: 550 points\n ...\n ', call_id='call_hl7EP6Lp5jj5wEdxeNHTwUVG', is_error=False)], type='ToolCallExecutionEvent'), ToolCallSummaryMessage(source='WebSearchAgent', models_usage=None, content='Here are the total points scored by Miami Heat players in the 2006-2007 season:\n Udonis Haslem: 844 points\n Dwayne Wade: 1397 points\n James Posey: 550 points\n ...\n ', type='ToolCallSummaryMessage'), TextMessage(source='DataAnalystAgent', models_usage=RequestUsage(prompt_tokens=183, completion_tokens=1038), content='I found that in the 2006–2007 season the player with the highest points was Dwyane Wade (with 1,397 points). Could you please provide Dwyane Wade’s total rebounds for the 2007–2008 and the 2008–2009 seasons so I can calculate the percentage change?', type='TextMessage'), ToolCallRequestEvent(source='WebSearchAgent', models_usage=RequestUsage(prompt_tokens=299, completion_tokens=109), content=[FunctionCall(id='call_lppGTILXDvO9waPwKO66ehK6', arguments='{"query": "Dwyane Wade total rebounds 2007-2008 and 2008-2009 seasons for Miami Heat"}', name='search_web_tool')], type='ToolCallRequestEvent'), ToolCallExecutionEvent(source='WebSearchAgent', models_usage=None, content=[FunctionExecutionResult(content='The number of total rebounds for Dwayne Wade in the Miami Heat season 2007-2008 is 214.', call_id='call_lppGTILXDvO9waPwKO66ehK6', is_error=False)], type='ToolCallExecutionEvent'), ToolCallSummaryMessage(source='WebSearchAgent', models_usage=None, content='The number of total rebounds for Dwayne Wade in the Miami Heat season 2007-2008 is 214.', type='ToolCallSummaryMessage'), TextMessage(source='DataAnalystAgent', models_usage=RequestUsage(prompt_tokens=291, completion_tokens=224), content='Could you please provide Dwyane Wade’s total rebounds in the 2008-2009 season?', type='TextMessage'), ToolCallRequestEvent(source='WebSearchAgent', models_usage=RequestUsage(prompt_tokens=401, completion_tokens=37), content=[FunctionCall(id='call_r8DBcbJtQfdtugLtyTrqOvoK', arguments='{"query": "Dwyane Wade total rebounds 2008-2009 season Miami Heat"}', name='search_web_tool')], type='ToolCallRequestEvent'), ToolCallExecutionEvent(source='WebSearchAgent', models_usage=None, content=[FunctionExecutionResult(content='The number of total rebounds for Dwayne Wade in the Miami Heat season 2008-2009 is 398.', call_id='call_r8DBcbJtQfdtugLtyTrqOvoK', is_error=False)], type='ToolCallExecutionEvent'), ToolCallSummaryMessage(source='WebSearchAgent', models_usage=None, content='The number of total rebounds for Dwayne Wade in the Miami Heat season 2008-2009 is 398.', type='ToolCallSummaryMessage'), ToolCallRequestEvent(source='DataAnalystAgent', models_usage=RequestUsage(prompt_tokens=353, completion_tokens=158), content=[FunctionCall(id='call_4jejv1wM7V1osbBCxJze8aQM', arguments='{"start": 214, "end": 398}', name='percentage_change_tool')], type='ToolCallRequestEvent'), ToolCallExecutionEvent(source='DataAnalystAgent', models_usage=None, content=[FunctionExecutionResult(content='85.98130841121495', call_id='call_4jejv1wM7V1osbBCxJze8aQM', is_error=False)], type='ToolCallExecutionEvent'), ToolCallSummaryMessage(source='DataAnalystAgent', models_usage=None, content='85.98130841121495', type='ToolCallSummaryMessage'), TextMessage(source='DataAnalystAgent', models_usage=RequestUsage(prompt_tokens=394, completion_tokens=138), content='Dwyane Wade was the Miami Heat player with the highest total points (1,397) during the 2006-2007 season. His total rebounds increased by approximately 86% from 214 in the 2007-2008 season to 398 in the 2008-2009 season.', type='TextMessage'), UserInputRequestedEvent(source='UserProxyAgent', models_usage=None, request_id='b3b05408-73fc-47d4-b832-16c9f447cd6e', content='', type='UserInputRequestedEvent'), TextMessage(source='UserProxyAgent', models_usage=None, content='Approve. TERMINATE', type='TextMessage')], stop_reason="Text 'TERMINATE' mentioned")
```

## Evaluator-Optimizer Team with AssistantAgent and SelectorGroupChat

https://raw.githubusercontent.com/panaversity/learn-agentic-ai/main/backup_recent/07a_autogen_microsoft/11_design_patterns/teams_impl.md

```
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_core import CancellationToken
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Shared model client.
model_client = OpenAIChatCompletionClient(model="gpt-4o", api_key="your_api_key_here")

# Candidate agent generates a draft solution.
candidate_agent = AssistantAgent(
    name="candidate_agent",
    system_message="Generate a draft solution for the given task.",
    model_client=model_client,
)

# Evaluator agent reviews the draft.
evaluator_agent = AssistantAgent(
    name="evaluator_agent",
    system_message="Evaluate the following solution and provide constructive feedback.",
    model_client=model_client,
)

# Optimizer agent refines the solution based on feedback.
optimizer_agent = AssistantAgent(
    name="optimizer_agent",
    system_message="Optimize the solution based on the evaluator's feedback. Provide the improved solution.",
    model_client=model_client,
)

# Custom selector for evaluator-optimizer team.
def evaluator_optimizer_selector(messages):
    # If the candidate's output is available, let evaluator speak.
    if any(msg.source == "candidate_agent" for msg in messages):
        # If evaluator has already spoken, then let the optimizer speak.
        if any(msg.source == "evaluator_agent" for msg in messages):
            return "optimizer_agent"
        else:
            return "evaluator_agent"
    # Otherwise, start with the candidate.
    return "candidate_agent"

# Create the team with candidate, evaluator, and optimizer agents.
team = SelectorGroupChat(
    agents=[candidate_agent, evaluator_agent, optimizer_agent],
    termination_condition=TextMentionTermination("exit"),
    selector_func=evaluator_optimizer_selector
)

async def evaluator_optimizer_flow():
    cancellation_token = CancellationToken()
    task = "Draft a proposal to reduce energy consumption in data centers."
    print(f"Task: {task}\n{'-'*50}")
    async for message in team.run_stream(task=task, cancellation_token=cancellation_token):
        print(f"{message.source}: {message.content}")

asyncio.run(evaluator_optimizer_flow())
```

## Perform Research with Multi-Agent Group Chat | AutoGen 0.2

https://microsoft.github.io/autogen/0.2/docs/notebooks/agentchat_groupchat_research/

```
Admin(to chat_manager):
find papers on LLM applications from arxiv in the last week, create a markdown table of different domains.
--------------------------------------------------------------------------------
Planner(to chat_manager):
Plan:
1. Engineer: Write a script to scrape the arXiv website for papers related to LLM (Language Model) applications published in the last week. The script should extract the title, authors, abstract, and link to the paper.
2. Scientist: Review the scraped data to identify the different domains in which LLM is applied. This could be based on keywords in the title or abstract, or the scientist's knowledge of the field.
3. Engineer: Modify the script to categorize the papers based on the domains identified by the scientist. The script should output a markdown table with columns for the domain, title, authors, abstract, and link.
4. Scientist: Review the markdown table to ensure the papers are correctly categorized and the information is accurate.
5. Engineer: Make any necessary revisions to the script based on the scientist's feedback.
6. Scientist: Give final approval of the markdown table.
7. Engineer: Submit the final markdown table.
--------------------------------------------------------------------------------
```

## Create Sub-Tasks with OpenAI ChatCompletion in Python

https://raw.githubusercontent.com/datawhalechina/hugging-multi-agent/main/docs/chapter2/AIAgent知识体系结构.md

```
sub_tasks = openai.ChatCompletion.create(
  model="gpt-4",
  messages=[
    {"role": "system", "content": "You are an world class assistant designed to help people accomplishh tasks"},
    {"role": "user", "content": "Create a 1500 word blog post on ChatGPT and what it can do"},
    {"role": "user", "content": "Take the users request above and break it down into simple sub-tasks which can be easily done."}
  ]
)
```
