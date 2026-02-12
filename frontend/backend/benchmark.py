import requests
import time

import os

# Use environment variable for deployment safety, default to local for testing
BASE_URL = os.getenv("API_URL", "http://127.0.0.1:8000/api")

def benchmark(url, name):
    start = time.time()
    try:
        response = requests.get(url)
        duration = time.time() - start
        print(f"[{name}] Status: {response.status_code}, Time: {duration:.4f}s")
        if response.status_code != 200:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"[{name}] Failed: {e}")

print("--- Benchmarking API Endpoints ---")
# 1. Trending Events (optimized)
benchmark(f"{BASE_URL}/events/trending", "Trending Events")

# 2. Public Events List (baseline)
benchmark(f"{BASE_URL}/events?limit=10", "Public Events List")

print("\nNote: 'My Events' requires auth, manual check recommended.")
