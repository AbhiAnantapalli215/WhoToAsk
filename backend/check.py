import requests
import json

API_KEY = "AIzaSyBpiC8i9eDuRqtMIIPtyu_VsGihAxiVCzQ"
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

headers = {
    "Content-Type": "application/json"
}

data = {
    "contents": [
        {
            "parts": [
                {"text": "Hello! Translate this Telugu sentence to English: 'మీరు ఎలా ఉన్నారు?'"}
            ]
        }
    ]
}

response = requests.post(
    url,
    params={"key": API_KEY},
    headers=headers,
    data=json.dumps(data)
)

if response.status_code == 200:
    print("Response:", json.dumps(response.json(), indent=2))
else:
    print("Error:", response.status_code, response.text)