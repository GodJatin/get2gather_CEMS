import requests
import os

BASE_URL = os.getenv("API_URL", "http://127.0.0.1:8000/api")

# Credentials that work (Student)
EMAIL = "demo_student@example.com" 
PASSWORD = "Password123!"

# 1. Test Correct Role (Student)
print("\n--- Test 1: Student Login as Student ---")
try:
    resp = requests.post(f"{BASE_URL}/token", data={
        "username": EMAIL,
        "password": PASSWORD
    }, params={"role": "student"}) # Sending as Form param (FastAPI Form) or query if incorrectly implemented
    
    # Actually, form-data means data body
    resp = requests.post(f"{BASE_URL}/token", data={
        "username": EMAIL,
        "password": PASSWORD,
        "role": "student"
    })
    
    if resp.status_code == 200:
        print("✅ SUCCESS: Logged in as Student")
    else:
        print(f"❌ FAILED: {resp.status_code} - {resp.text}")
except Exception as e:
    print(f"ERROR: {e}")

# 2. Test Incorrect Role (Organizer)
print("\n--- Test 2: Student Login as Organizer ---")
try:
    resp = requests.post(f"{BASE_URL}/token", data={
        "username": EMAIL,
        "password": PASSWORD,
        "role": "organizer"
    })
    
    if resp.status_code == 401:
        print("✅ SUCCESS: Login Rejected (Role Mismatch)")
        print(f"Response: {resp.json().get('detail')}")
    elif resp.status_code == 200:
        print("❌ FAILED: Login Permitted! (Security Bypass)")
    else:
        print(f"⚠️ UNEXPECTED: {resp.status_code} - {resp.text}")
except Exception as e:
    print(f"ERROR: {e}")
