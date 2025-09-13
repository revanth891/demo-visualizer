# generate_messages.py

import sys
import json
import openai
import os
from dotenv import load_dotenv
load_dotenv()

# Set your IO Intelligence API key here
api_key = os.getenv("IO_API_KEY")

# Initialize IO Intelligence client (OpenAI-compatible)
client = openai.OpenAI(
    api_key=api_key,
    base_url="https://api.intelligence.io.solutions/api/v1/",
)

def generate_response(user_input):
    try:
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct",
            messages=[
                {
                    "role": "system",
                    "content": """
Your name is Kino.You are a friendly, kid-loving AI teacher who explains things in a fun and cheerful way. Avoid roleplaying actions like *wags tail* or *hugs*. Just use happy and kind language. Keep answers extremely short, clear, and exciting.
You will always reply with a JSON array of messages. With a maximum of 1 messages.
Each message has a text, facialExpression, and animation property.
The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
The different animations are: Talking, Secret, Idle, Rapping, Funny_Dance and Angry.
                    """,
                },
                {
                    "role": "user",
                    "content": user_input,
                },
            ],
            temperature=0.8,
            max_tokens=150,
            stream=False,
        )

        content = response.choices[0].message.content.strip()
        # Parse the response as JSON
        return json.loads(content)

    except Exception as e:
        return {
            "messages": [
                {
                    "text": f"An error occurred: {str(e)}",
                    "facialExpression": "smile",
                    "animation": "Idle"
                }
            ]
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"messages": [{
            "text": "No input provided.",
            "facialExpression": "default",
            "animation": "Idle"
        }]}))
        sys.exit(1)

    user_input = sys.argv[1]
    messages = generate_response(user_input)
    print(json.dumps(messages))

# generate_messages.py

# import sys
# import json
# import openai
# import os
# from dotenv import load_dotenv
# load_dotenv()

# # API key and client init
# api_key = os.getenv("IO_API_KEY")

# client = openai.OpenAI(
#     api_key=api_key,
#     base_url="https://api.intelligence.io.solutions/api/v1/",
# )

# def generate_response(user_input):
#     try:
#         response = client.chat.completions.create(
#             model="meta-llama/Llama-3.3-70B-Instruct",
#             messages=[
#                 {
#                     "role": "system",
#                     "content": """
# Your name is Kino. You are a friendly, kid-loving AI teacher who explains things in a fun and cheerful way. Avoid roleplaying actions like *wags tail* or *hugs*. Just use happy and kind language. Keep answers extremely short, clear, and exciting.
# You will always reply with a JSON array of messages.
# Each message has: text, facialExpression, animation.
# Facial expressions: smile, sad, angry, surprised, funnyFace, default.
# Animations: Talking, Secret, Idle, Rapping, Funny_Dance, Angry.
#                     """,
#                 },
#                 {
#                     "role": "user",
#                     "content": user_input,
#                 },
#             ],
#             temperature=0.8,
#             max_tokens=150,
#             stream=False,
#         )

#         content = response.choices[0].message.content.strip()

#         # Try parsing AI's response as JSON array
#         parsed = json.loads(content)

#         # Ensure it's always wrapped in { "messages": [...] }
#         if isinstance(parsed, list):
#             return { "messages": parsed }
#         elif isinstance(parsed, dict) and "messages" in parsed:
#             return { "messages": parsed["messages"] }
#         else:
#             # Fallback if AI didn't follow format
#             return {
#                 "messages": [
#                     {
#                         "text": content,
#                         "facialExpression": "default",
#                         "animation": "Idle"
#                     }
#                 ]
#             }

#     except Exception as e:
#         return {
#             "messages": [
#                 {
#                     "text": f"An error occurred: {str(e)}",
#                     "facialExpression": "smile",
#                     "animation": "Idle"
#                 }
#             ]
#         }

# if __name__ == "__main__":
#     if len(sys.argv) < 2:
#         print(json.dumps({
#             "messages": [{
#                 "text": "No input provided.",
#                 "facialExpression": "default",
#                 "animation": "Idle"
#             }]
#         }))
#         sys.exit(1)

#     user_input = sys.argv[1]
#     messages = generate_response(user_input)
#     print(json.dumps(messages))
