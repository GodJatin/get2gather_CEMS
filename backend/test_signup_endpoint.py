import requests
import time
import sys

def test_signup():
    url = "http://127.0.0.1:8001/auth/student/initiate"
    payload = {
        "name": "Ravi ranjan",
        "contact": "1234567890",
        "email": "2305103120023@paruluniversity.ac.in"
    }
    
    print(f"Sending POST request to {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    # Wait for server to start
    time.sleep(5)
    test_signup()
