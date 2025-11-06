# Oneshot Mode Result

**Scenario**: autogen:streaming-tools
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:53:33.171Z

---

## Query

Using the Autogen Python library, build an agent with tool calling and streaming capabilities. Plan a 30-second 'market brief' for EUR→KRW travelers. Call a weather tool for Seoul and a simple FX tool for USD/KRW, then summarize key takeaways in 4 bullets. Stream your answer as you work; if the tool output is terse, reflect to make it readable.

---

## Tool Input

```json
{
  "query": "Using the Autogen Python library, build an agent with tool calling and streaming capabilities. Plan a 30-second 'market brief' for EUR→KRW travelers. Call a weather tool for Seoul and a simple FX tool for USD/KRW, then summarize key takeaways in 4 bullets. Stream your answer as you work; if the tool output is terse, reflect to make it readable."
}
```

---

## Tool Result

## Travel Planning — AutoGen

https://microsoft.github.io/autogen/dev//user-guide/agentchat-user-guide/examples/travel-planning.html

```
TaskResult(messages=[TextMessage(source='user', models_usage=None, content='Plan a 3 day trip to Nepal.', type='TextMessage'), TextMessage(source='planner_agent', models_usage=RequestUsage(prompt_tokens=40, completion_tokens=712), content='Nepal is a stunning destination with its rich cultural heritage, breathtaking landscapes, and friendly people. A 3-day trip to Nepal is short, so let\'s focus on maximizing your experience with a mix of cultural, adventure, and scenic activities. Here’s a suggested itinerary:\n\n### Day 1: Arrival in Kathmandu\n- **Morning:**\n - Arrive at Tribhuvan International Airport in Kathmandu.\n - Check into your hotel and freshen up.\n- **Late Morning:**\n - Visit **Swayambhunath Stupa** (also known as the Monkey Temple). This ancient religious site offers a panoramic view of the Kathmandu Valley.\n- **Afternoon:**\n - Head to **Kathmandu Durbar Square** to explore the old royal palace and various temples. Don’t miss the Kumari Ghar, which is home to the living goddess.\n - Have lunch at a nearby local restaurant and try traditional Nepali cuisine.\n- **Evening:**\n - Explore the vibrant streets of **Thamel**, a popular tourist district with shops, restaurants, and markets.\n - Dinner at a cozy restaurant featuring Nepali or continental dishes.\n\n### Day 2: Day Trip to Patan and Bhaktapur\n- **Morning:**\n - Drive to **Patan (Lalitpur)**, only a few kilometers from Kathmandu. Explore **Patan Durbar Square** with its incredible temples and ancient palaces.\n- **Late Morning:**\n - Visit the **Patan Museum** for its unique collection of artifacts.\n - Optional: Visit the nearby **Golden Temple (Hiranya Varna Mahavihar)**.\n- **Afternoon:**\n - Head to **Bhaktapur**, about an hour\'s drive from Patan. Visit **Bhaktapur Durbar Square**, known for its medieval art and architecture.\n - Try some local **"juju dhau"** (king curd) – a must-taste in Bhaktapur.\n- **Evening:**\n - Return to Kathmandu for an evening of relaxation.\n - Dinner at a restaurant with cultural performances, such as traditional Nepali dance.\n\n### Day 3: Nature Excursion and Departure\n- **Early Morning:**\n - If interested in a short trek, consider a half-day hike to **Nagarkot** for sunrise views over the Himalayas. This requires an early start (leave around 4 AM). You can also enjoy a hearty breakfast with a view.\n- **Late Morning:**\n - Return to Kathmandu. If trekking to Nagarkot isn’t feasible, visit the **Pashupatinath Temple**, a UNESCO World Heritage site, or the nearby **Boudhanath Stupa**.\n- **Afternoon:**\n - Visit the **Garden of Dreams** for some tranquility before departure. It’s a beautifully restored, serene garden.\n- **Evening:**\n - Depending on your flight schedule, enjoy some last-minute shopping or relishing Nepali momos (dumplings) before you head to the airport.\n- **Departure:**\n - Transfer to Tribhuvan International Airport for your onward journey.\n\n### Tips:\n- Check the weather and prepare accordingly, especially if visiting during the monsoon or winter.\n- Respect local customs and traditions, especially when visiting religious sites. Dress modestly and be mindful of photography rules.\n- Consider adjusting this itinerary based on your arrival and departure times and personal interests.\n\nI hope you have an unforgettable experience in Nepal! Safe travels!', type='TextMessage'), TextMessage(source='local_agent', models_usage=RequestUsage(prompt_tokens=768, completion_tokens=604), content='Nepal offers a blend of natural beauty, rich culture, and historical wonders. For a condensed yet fulfilling 3-day trip, the following itinerary focuses on providing a diverse taste of what Nepal has to offer:\n\n### Day 1: Explore Kathmandu\n- **Morning:**\n - Arrive at Tribhuvan International Airport.\n - Check into your hotel and rest or freshen up.\n- **Late Morning:**\n - Visit **Swayambhunath Stupa** (Monkey Temple) for panoramic views and insight into Nepalese spirituality.\n- **Afternoon:**\n - Explore **Kathmandu Durbar Square**, where you can admire historic palaces and temples.\n - Have lunch nearby and try traditional Nepali dishes like dal bhat (lentils and rice).\n- **Evening:**\n - Stroll through **Thamel**, a lively district filled with shops and restaurants.\n - Enjoy dinner at a cultural restaurant featuring a traditional Nepali dance show.\n\n### Day 2: Discover Patan and Bhaktapur\n- **Morning:**\n - Head to **Patan** to explore **Patan Durbar Square**, known for its stunning Newar architecture.\n - Visit the **Patan Museum** to learn about Nepalese history and art.\n - Optional: Visit the **Golden Temple (Hiranya Varna Mahavihar)**.\n- **Afternoon:**\n - Travel to **Bhaktapur**, a medieval town famous for its well-preserved architecture.\n - Visit **Bhaktapur Durbar Square** and enjoy the artistic temples and palaces.\n - Savor local specialties like **"juju dhau"** (king curd).\n- **Evening:**\n - Return to Kathmandu for dinner and relaxation.\n\n### Day 3: Nature and Spirituality\n- **Early Morning:**\n - Depart for **Nagarkot** to catch the sunrise over the Himalayas, offering breathtaking views of peaks including Mount Everest. If possible, enjoy breakfast with the scenic backdrop.\n- **Late Morning:**\n - Return to Kathmandu. Alternatively, visit the **Pashupatinath Temple**, one of Nepal\'s holiest Hindu sites.\n- **Afternoon:**\n - See the majestic **Boudhanath Stupa**, one of the largest stupas in the world.\n - Relax in the **Garden of Dreams**, a peaceful oasis in the city.\n- **Evening:**\n - Enjoy a final meal featuring local favorites such as momos (dumplings) before heading to the airport.\n- **Departure:**\n - Transfer to Tribhuvan International Airport for your departure.\n\n### Tips:\n- Dress modestly and be respectful when visiting religious sites.\n- Adjust the itinerary based on your interests and flight times.\n- Consider the weather; pack appropriately for the season.\n\nThis itinerary offers a snapshot of Nepal\'s diverse attractions, blending cultural immersion with natural beauty. Wishing you a memorable trip! Safe travels!', type='TextMessage'), TextMessage(source='language_agent', models_usage=RequestUsage(prompt_tokens=1403, completion_tokens=353), content='Your 3-day trip to Nepal is well-planned, giving you a taste of the country\'s vibrant culture, rich history, and breathtaking landscapes. Here are some important language and communication tips that will enhance your experience:\n\n1. **Basic Nepali Phrases**: While English is widely spoken in tourist areas, learning a few basic Nepali phrases can be helpful and appreciated by locals. Here are some to consider:\n - Namaste (नमस्ते) – Hello\n - Dhanyabad (धन्यवाद) – Thank you\n - Mitho cha (मिठो छ) – It\'s delicious\n - Kripya (कृपया) – Please\n - Maaph garnus (माफ गर्नुहोस्) – Sorry/Excuse me\n\n2. **Gesture Understanding**: In Nepal, the slight tilting head nod means "yes," and shaking your head left to right can mean "no." This might be different from some Western countries where nodding generally signifies agreement.\n\n3. **Respect and Etiquette**: When visiting religious sites, remove shoes and hats before entering. It\'s respectful to use your right hand when giving or receiving something, as the left hand is considered impure in Nepali culture.\n\n4. **Offline Translation Apps**: Consider downloading an offline translation app or phrasebook in case you find yourself in areas where English might not be as common.\n\n5. **Non-Verbal Communication**: A smile goes a long way in Nepal. If you encounter a language barrier, hand gestures and a friendly demeanor can be very effective.\n\nWith these tips in mind, your itinerary seems well-rounded, giving you a rich experience in Nepal. Enjoy your trip and the diverse experiences Nepal has to offer!', type='TextMessage'), TextMessage(source='travel_summary_agent', models_usage=RequestUsage(prompt_tokens=1780, completion_tokens=791), content='Here\'s your comprehensive and integrated 3-day travel plan for an unforgettable trip to Nepal. This itinerary focuses on delivering a taste of Nepal\'s culture, history, nature, and hospitality, while incorporating practical language and cultural tips to enhance your experience.\n\n### Day 1: Arrival and Cultural Exploration in Kathmandu\n- **Morning:**\n - Arrive at Tribhuvan International Airport in Kathmandu. Begin your adventure by checking into your hotel to rest and freshen up.\n- **Late Morning:**\n - Explore **Swayambhunath Stupa** (Monkey Temple), a symbolic and spiritual site offering magnificent panoramic views of the Kathmandu Valley. Learn basic Nepali phrases like "Namaste" to greet locals warmly.\n- **Afternoon:**\n - Visit the historic **Kathmandu Durbar Square** to admire the old royal palace and the surrounding temples, including the Kumari Ghar, home to the living goddess.\n - Have lunch at a nearby restaurant and try dishes like dal bhat to get a flavor of traditional Nepali cuisine.\n- **Evening:**\n - Stroll through the vibrant streets of **Thamel**, a hub for tourists with many shops and eateries. Use simple gestures and smiles as you interact with local shopkeepers.\n - Enjoy dinner at a restaurant with cultural performances, including traditional Nepali dance. Practice "Dhanyabad" to show appreciation.\n\n### Day 2: Discovering Heritage in Patan and Bhaktapur\n- **Morning:**\n - Travel to **Patan** to explore the beautiful **Patan Durbar Square** and the **Patan Museum**, marveling at its rich Newar architecture and extensive collection of artifacts.\n - Optionally, visit the nearby **Golden Temple (Hiranya Varna Mahavihar)**.\n- **Afternoon:**\n - Head to the ancient city of **Bhaktapur**, around an hour\'s drive from Patan. Visit **Bhaktapur Durbar Square**, known for its well-preserved pagodas and temples.\n - Relish the local specialty, **"juju dhau"** (king curd), an unmissable treat in Bhaktapur.\n - Use polite phrases like "Kripya" (please) and "Maaph garnus" (excuse me) during interactions.\n- **Evening:**\n - Return to Kathmandu for dinner and unwind. Embrace the gentle head nod culture when communicating to show understanding and respect.\n\n### Day 3: Embracing Nature and Spirituality\n- **Early Morning:**\n - Venture to **Nagarkot** early to catch the breathtaking sunrise over the Himalayas. Savor a hearty breakfast amidst the stunning backdrop of peaks, including Mt. Everest, if the weather allows.\n- **Late Morning:**\n - Return to Kathmandu. If not visiting Nagarkot, consider the sacred **Pashupatinath Temple** or the magnificent **Boudhanath Stupa**.\n- **Afternoon:**\n - Relax in the **Garden of Dreams**, a restored historic garden offering serenity and beauty in Kathmandu.\n- **Evening:**\n - Enjoy a final dinner with favorites like momos (dumplings), savoring the flavors of Nepali cuisine one last time. Practice saying "Mitho cha" to compliment your meal.\n- **Departure:**\n - Head to Tribhuvan International Airport for your flight, leaving Nepal with cherished memories and perhaps new friendships along the way.\n\n### Tips:\n- Respect local customs by dressing modestly, especially when visiting religious sites.\n- Stay prepared for the weather by dressing accordingly for the season.\n- Consider using offline translation apps if needed in areas with less English proficiency.\n- Make adjustments based on your interests and flight schedule to personalize your adventure.\n\nEnjoy a journey filled with cultural insights, natural wonders, and meaningful connections in Nepal! Safe travels!\n\nTERMINATE', type='TextMessage')], stop_reason="Text 'TERMINATE' mentioned")
```

## Asynchronously Streams Weather Data Using create_react_agent

https://raw.githubusercontent.com/langchain-ai/langgraph/main/docs/docs/how-tos/streaming.md

```
agent = create_react_agent(
        model="anthropic:claude-3-7-sonnet-latest",
        tools=[get_weather],
    )
    # highlight-next-line
    async for token, metadata in agent.astream(
        {"messages": [{"role": "user", "content": "what is the weather in sf"}]},
        # highlight-next-line
        stream_mode="messages"
    ):
        print("Token", token)
        print("Metadata", metadata)
        print("\n")
```

## Currency Exchange and Weather Forecasting with Ollama

https://raw.githubusercontent.com/ag2ai/ag2/main/website/docs/user-guide/models/ollama.mdx

```
import json
from typing import Literal

from typing_extensions import Annotated

import autogen

llm_config = autogen.LLMConfig(
    # Let's choose the Meta's Llama 3.1 model (model names must match Ollama exactly)
    model="llama3.1:8b",
    api_type="ollama",
    stream=False,
    client_host="http://192.168.0.1:11434",
    hide_tools="if_any_run",
)

# We'll create our agents. Importantly, we're using native Ollama tool calling and to help guide it we add the JSON to the system_message so that the number fields aren't wrapped in quotes (becoming strings).

# Create the agent for tool calling
with llm_config:
    chatbot = autogen.AssistantAgent(
        name="chatbot",
        system_message="""For currency exchange and weather forecasting tasks,
            only use the functions you have been provided with.
            Example of the return JSON is:
            {
                "parameter_1_name": 100.00,
                "parameter_2_name": "ABC",
                "parameter_3_name": "DEF",
            }.
            Another example of the return JSON is:
            {
                "parameter_1_name": "GHI",
                "parameter_2_name": "ABC",
                "parameter_3_name": "DEF",
                "parameter_4_name": 123.00,
            }.
            Output 'HAVE FUN!' when an answer has been provided.""",
    )

# Note that we have changed the termination string to be "HAVE FUN!"
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    is_termination_msg=lambda x: x.get("content", "") and "HAVE FUN!" in x.get("content", ""),
    human_input_mode="NEVER",
    max_consecutive_auto_reply=1,
)

# Create and register our functions (tools).

# Currency Exchange function

CurrencySymbol = Literal["USD", "EUR"]

# Define our function that we expect to call
def exchange_rate(base_currency: CurrencySymbol, quote_currency: CurrencySymbol) -> float:
    if base_currency == quote_currency:
        return 1.0
    elif base_currency == "USD" and quote_currency == "EUR":
        return 1 / 1.1
    elif base_currency == "EUR" and quote_currency == "USD":
        return 1.1
    else:
        raise ValueError(f"Unknown currencies {base_currency}, {quote_currency}")


# Register the function with the agent

@user_proxy.register_for_execution()
@chatbot.register_for_llm(description="Currency exchange calculator.")
def currency_calculator(
    base_amount: Annotated[
        float,
        "Amount of currency in base_currency. Type is float, not string, return value should be a number only, e.g. 987.65.",
    ],
    base_currency: Annotated[CurrencySymbol, "Base currency"] = "USD",
    quote_currency: Annotated[CurrencySymbol, "Quote currency"] = "EUR",
) -> str:
    quote_amount = exchange_rate(base_currency, quote_currency) * base_amount
    return f"{format(quote_amount, '.2f')} {quote_currency}"


# Weather function

# Example function to make available to model
def get_current_weather(location, unit="fahrenheit"):
    """Get the weather for some location"""
    if "chicago" in location.lower():
        return json.dumps({"location": "Chicago", "temperature": "13", "unit": unit})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "55", "unit": unit})
    elif "new york" in location.lower():
        return json.dumps({"location": "New York", "temperature": "11", "unit": unit})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})


# Register the function with the agent

@user_proxy.register_for_execution()
@chatbot.register_for_llm(description="Weather forecast for US cities.")
def weather_forecast(
    location: Annotated[str, "City name"],
) -> str:
    weather_details = get_current_weather(location=location)
    weather = json.loads(weather_details)
    return f"{weather['location']} will be {weather['temperature']} degrees {weather['unit']}"

# start the conversation
res = user_proxy.initiate_chat(
    chatbot,
    message="What's the weather in New York and can you tell me how much is 123.45 EUR in USD so I can spend it on my holiday? Throw a few holiday tips in as well.",
    summary_method="reflection_with_llm",
)

print(f"LLM SUMMARY: {res.summary['content']}")
```

## Currency and Weather Assistant with Llama 3

https://raw.githubusercontent.com/ag2ai/ag2/main/website/docs/user-guide/models/groq.mdx

```
import json
import os
from typing import Literal

from typing_extensions import Annotated

import autogen

llm_config = autogen.LLMConfig(api_type="groq", model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"), cache_seed=None)

# Create the agent for tool calling
with llm_config:
    chatbot = autogen.AssistantAgent(
        name="chatbot",
        system_message="""For currency exchange and weather forecasting tasks,
            only use the functions you have been provided with.
            Output 'HAVE FUN!' when an answer has been provided.""",
    )

# Note that we have changed the termination string to be "HAVE FUN!"
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    is_termination_msg=lambda x: x.get("content", "") and "HAVE FUN!" in x.get("content", ""),
    human_input_mode="NEVER",
    max_consecutive_auto_reply=1,
)

# Create the two functions, annotating them so that those descriptions can be passed through to the LLM.
# We associate them with the agents using `register_for_execution` for the user_proxy so it can execute the function and `register_for_llm` for the chatbot (powered by the LLM) so it can pass the function definitions to the LLM.

# Currency Exchange function

CurrencySymbol = Literal["USD", "EUR"]

# Define our function that we expect to call


def exchange_rate(base_currency: CurrencySymbol, quote_currency: CurrencySymbol) -> float:
    if base_currency == quote_currency:
        return 1.0
    elif base_currency == "USD" and quote_currency == "EUR":
        return 1 / 1.1
    elif base_currency == "EUR" and quote_currency == "USD":
        return 1.1
    else:
        raise ValueError(f"Unknown currencies {base_currency}, {quote_currency}")


# Register the function with the agent


@user_proxy.register_for_execution()
@chatbot.register_for_llm(description="Currency exchange calculator.")
def currency_calculator(
    base_amount: Annotated[float, "Amount of currency in base_currency"],
    base_currency: Annotated[CurrencySymbol, "Base currency"] = "USD",
    quote_currency: Annotated[CurrencySymbol, "Quote currency"] = "EUR",
) -> str:
    quote_amount = exchange_rate(base_currency, quote_currency) * base_amount
    return f"{format(quote_amount, '.2f')} {quote_currency}"


# Weather function


# Example function to make available to model
def get_current_weather(location, unit="fahrenheit"):
    """Get the weather for some location"""
    if "chicago" in location.lower():
        return json.dumps({"location": "Chicago", "temperature": "13", "unit": unit})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "55", "unit": unit})
    elif "new york" in location.lower():
        return json.dumps({"location": "New York", "temperature": "11", "unit": unit})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})


# Register the function with the agent


@user_proxy.register_for_execution()
@chatbot.register_for_llm(description="Weather forecast for US cities.")
def weather_forecast(
    location: Annotated[str, "City name"],
) -> str:
    weather_details = get_current_weather(location=location)
    weather = json.loads(weather_details)
    return f"{weather['location']} will be {weather['temperature']} degrees {weather['unit']}"

# We pass through our customers message and run the chat.
# Finally, we ask the LLM to summarise the chat and print that out.

# start the conversation
res = user_proxy.initiate_chat(
    chatbot,
    message="What's the weather in New York and can you tell me how much is 123.45 EUR in USD so I can spend it on my holiday? Throw a few holiday tips in as well.",
    summary_method="reflection_with_llm",
)

print(f"LLM SUMMARY: {res.summary['content']}")
```
