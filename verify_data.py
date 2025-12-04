import requests
import json

BASE_URL = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE_URL}/auth/login"
ME_URL = f"{BASE_URL}/auth/me"
EVENTS_URL = f"{BASE_URL}/events/"
PROFILE_URL = f"{BASE_URL}/student/profile"

USERNAME = "2305103140014@paruluniversity.ac.in"
PASSWORD = "J@tin224"

def verify():
    print(f"Logging in as {USERNAME}...")
    try:
        response = requests.post(LOGIN_URL, data={"username": USERNAME, "password": PASSWORD})
        response.raise_for_status()
        data = response.json()
        token = data.get("access_token")
        print("Login successful!")
    except Exception as e:
        print(f"Login failed: {e}")
        print(response.text)
        return

    headers = {"Authorization": f"Bearer {token}"}

    print("\nChecking /auth/me...")
    try:
        response = requests.get(ME_URL, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Failed to fetch profile: {e}")

    print("\nChecking /events/...")
    try:
        response = requests.get(EVENTS_URL, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Failed to fetch events: {e}")

    print("\nChecking /student/profile...")
    try:
        response = requests.get(PROFILE_URL, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Failed to fetch profile: {e}")

if __name__ == "__main__":
    verify()
