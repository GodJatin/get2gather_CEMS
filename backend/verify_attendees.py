import requests
import json

# Login as Organizer
login_url = "http://127.0.0.1:8000/auth/login"
login_data = {"username": "pica@paruluniversity.ac.in", "password": "password123"}
response = requests.post(login_url, data=login_data)
if response.status_code != 200:
    print(f"Login failed: {response.text}")
    exit()
token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Get My Events
events_url = "http://127.0.0.1:8000/events/my"
events_res = requests.get(events_url, headers=headers)
if events_res.status_code != 200:
    print("Failed to get events")
    exit()

events = events_res.json()
if not events:
    print("No events found for organizer")
    exit()

event_id = events[0]["id"]
print(f"Checking bookings for event {event_id}...")

# Get Bookings
bookings_url = f"http://127.0.0.1:8000/events/{event_id}/bookings"
bookings_res = requests.get(bookings_url, headers=headers)
bookings = bookings_res.json()

print(json.dumps(bookings, indent=2))
