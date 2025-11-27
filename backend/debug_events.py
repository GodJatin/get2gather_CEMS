import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_events():
    try:
        print(f"Fetching events from {BASE_URL}/events/ ...")
        response = requests.get(f"{BASE_URL}/events/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Got {len(data)} events.")
            if len(data) > 0:
                print(f"Sample event: {data[0]}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_events()
