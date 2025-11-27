import requests
import json

BASE_URL = "http://localhost:8000"

def book_event():
    # 1. Login
    print("Logging in...")
    login_data = {
        "username": "test@paruluniversity.ac.in",
        "password": "password123"
    }
    try:
        res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        if res.status_code != 200:
            print(f"Login failed: {res.text}")
            return
        
        token = res.json()["access_token"]
        print("Login successful. Token obtained.")
        
        # 2. Book Event (ID 21 - Tech Talk 2024)
        headers = {"Authorization": f"Bearer {token}"}
        booking_data = {
            "event_id": 21
        }
        
        print("Booking event 21...")
        # Note: The API expects query param or body?
        # Let's check routers/bookings.py.
        # It expects `event_id` in the URL or body?
        # @router.post("/bookings/", response_model=schemas.BookingResponse)
        # async def create_booking(booking: schemas.BookingCreate, ...
        # BookingCreate has event_id.
        
        res = requests.post(f"{BASE_URL}/bookings/", json=booking_data, headers=headers)
        
        if res.status_code == 200:
            print("Booking successful!")
            print(res.json())
        else:
            print(f"Booking failed: {res.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    book_event()
