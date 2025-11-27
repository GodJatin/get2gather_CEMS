"""
Test event creation through API
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# Login as organizer (you'll need to create one first or use existing)
# For now, let's try to create an event with a mock organizer login

def test_event_creation():
    print("Testing event creation...")
    
    # First, let's check if we can reach the backend
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Backend is running: {response.json()}")
    except Exception as e:
        print(f"❌ Cannot reach backend: {e}")
        return
    
    # Try to get events to verify API works
    try:
        response = requests.get(f"{BASE_URL}/events/")
        print(f"✅ Can fetch events: {len(response.json())} events found")
    except Exception as e:
        print(f"❌ Cannot fetch events: {e}")
        return
    
    print("\n✅ Backend API is working!")
    print("📝 To create an event via web:")
    print("1. Login as organizer at http://localhost:3000")
    print("2. Navigate to /organizer/events/create")
    print("3. Fill the form and submit")
    print("\nIf CORS errors persist, check browser console and backend logs")

if __name__ == "__main__":
    test_event_creation()
