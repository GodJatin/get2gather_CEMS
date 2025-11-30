import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def login_organizer():
    print("Logging in as organizer...")
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data={
            "username": "organizer@paruluniversity.ac.in",
            "password": "OrgPassword123"
        })
        if response.status_code == 200:
            print("✅ Login successful")
            return response.json()["access_token"]
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return None

def reproduce_event_creation(token):
    print("\nAttempting to create event...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Simulate payload from frontend
    # Note: images is a stringified JSON array of base64 strings
    # We'll use a small dummy base64 for testing
    dummy_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    images_json = json.dumps([dummy_image])
    
    payload = {
        "title": "Test Event for Debugging",
        "category": "Technical",
        "capacity": None,
        "description": "This is a test event to reproduce the creation failure.",
        "date": "2024-12-25",
        "time": "10:00",
        "venue": "Test Venue",
        "department": "PICA",
        "open_for": "Everyone",
        "outcomes": "Learning debugging",
        "images": images_json,
        "is_paid": False,
        "price": 0,
        "hashtags": "#test,#debug",
        "seats_available": 100,
        "image_url": dummy_image,
        # organizer_id and status are excluded in frontend payload sent to API? 
        # Wait, frontend code says:
        # ...formData,
        # organizer_id: organizerId,
        # status: 'Upcoming'
        # But backend schema EventCreate says organizer_id and status are set by backend.
        # However, Pydantic might ignore extra fields if not configured to forbid them.
        # Let's send exactly what frontend sends.
        "organizer_id": 1, # Dummy ID, backend should overwrite or ignore
        "status": "Upcoming"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/events/", json=payload, headers=headers)
        if response.status_code == 200:
            print("✅ Event created successfully!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Event creation failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    token = login_organizer()
    if token:
        reproduce_event_creation(token)
