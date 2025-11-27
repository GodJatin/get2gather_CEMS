"""
Complete end-to-end test of QR booking system
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_complete_flow():
    print("=" * 60)
    print("🧪 TESTING COMPLETE QR BOOKING FLOW")
    print("=" * 60)
    
    # Step 1: Login as student
    print("\n📝 Step 1: Logging in as student...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "2305103140014@paruluniversity.ac.in",
            "password": "J@tin224"
        }
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Logged in successfully")
    
    # Step 2: Get latest event
    print("\n📝 Step 2: Fetching latest event...")
    events_response = requests.get(f"{BASE_URL}/events/")
    events = events_response.json()
    
    if not events:
        print("❌ No events found")
        return
    
    event = events[-1]  # Get latest event
    print(f"✅ Found event: {event['title']} (ID: {event['id']})")
    print(f"   Date: {event['date']}, Time: {event['time']}")
    print(f"   Seats: {event['seats_available']}/{event['capacity']}")
    
    # Step 3: Check if already booked
    print("\n📝 Step 3: Checking existing bookings...")
    my_bookings_response = requests.get(f"{BASE_URL}/bookings/my", headers=headers)
    
    if my_bookings_response.status_code == 200:
        my_bookings = my_bookings_response.json()
        already_booked = any(b['event_id'] == event['id'] for b in my_bookings)
        
        if already_booked:
            print("⚠️  Already booked this event, finding QR code...")
            booking = next(b for b in my_bookings if b['event_id'] == event['id'])
            print(f"\n🎫 EXISTING BOOKING FOUND:")
            print(f"   Booking ID: {booking['id']}")
            if booking.get('qr_code'):
                print(f"   QR Code: {booking['qr_code']}")
                print(f"\n✅ Copy this QR code to paste in scan page:")
                print(f"   {booking['qr_code']}")
            else:
                print("   ❌ No QR code found in booking!")
            return
    
    # Step 4: Book the event
    print(f"\n📝 Step 4: Booking event {event['id']}...")
    booking_response = requests.post(
        f"{BASE_URL}/bookings/",
        headers=headers,
        json={"event_id": event['id']}
    )
    
    if booking_response.status_code != 200:
        print(f"❌ Booking failed: {booking_response.text}")
        return
    
    booking = booking_response.json()
    print(f"✅ Booking successful! Booking ID: {booking['id']}")
    
    # Step 5: Check QR code
    print("\n📝 Step 5: Checking QR code generation...")
    if booking.get('qr_code'):
        print(f"✅ QR Code generated: {booking['qr_code']}")
        print(f"\n" + "=" * 60)
        print("🎫 QR CODE TO TEST WITH:")
        print("=" * 60)
        print(booking['qr_code'])
        print("=" * 60)
        print("\n📋 Instructions:")
        print("1. Copy the QR code above")
        print("2. Go to http://localhost:3000/organizer/scan")
        print(f"3. Select event: {event['title']}")
        print("4. Paste the QR code in the input field")
        print("5. Click 'Verify Ticket'")
    else:
        print("❌ No QR code in booking response!")
        print(f"Booking data: {json.dumps(booking, indent=2)}")
    
    # Step 6: Check if email would be sent (backend logs)
    print("\n📝 Step 6: Email check...")
    print("⚠️  Check backend console for email simulation logs")
    print("    (Real emails require SMTP configuration)")
    
    print("\n" + "=" * 60)
    print("✅ TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_complete_flow()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
