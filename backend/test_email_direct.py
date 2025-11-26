import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv(override=True)

api_key = os.getenv('RESEND_API_KEY')
print(f"Testing Key: {api_key[:5]}...{api_key[-4:]}")

url = "https://api.resend.com/emails"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
data = {
    "from": "onboarding@resend.dev",
    "to": "224jatin2006@gmail.com",
    "subject": "Test Email",
    "html": "<p>Test</p>"
}

try:
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
