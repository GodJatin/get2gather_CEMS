import requests
import sys

BASE_URL = "http://localhost:8000"

def login_student():
    url = f"{BASE_URL}/auth/login"
    payload = {
        "username": "test@paruluniversity.ac.in",
        "password": "password123"
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    
    try:
        res = requests.post(url, data=payload, headers=headers)
        if res.status_code == 200:
            return res.json()["access_token"]
        else:
            print(f"Login failed: {res.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_stats(token):
    url = f"{BASE_URL}/stats/student"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        print(f"GET {url}...")
        res = requests.get(url, headers=headers)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
    except Exception as e:
        print(f"Request error: {e}")

if __name__ == "__main__":
    # Ensure user exists first (optional, assuming it exists from previous steps)
    token = login_student()
    if token:
        test_stats(token)
    else:
        print("Skipping stats test due to login failure.")
