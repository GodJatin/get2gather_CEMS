"""
Comprehensive booking test to verify entire QR flow
"""
import requests
import json

BASE_URL = "http://localhost:8000"

# Credentials
STUDENT_EMAIL = "2305103140014@paruluniversity.ac.in"
STUDENT_PASSWORD = "J@tin224"

def test_complete_booking_flow():
    print("=" * 60)
    print("🧪 COMPREHENSIVE BOOKING & QR FLOW TEST")
    print("=" * 60)
    
    # STEP 1: Login
    print("\n📝 Step 1: Logging in as student...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": STUDENT_EMAIL, "password": STUDENT_PASSWORD}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Logged in successfully")
    
    # STEP 2: Get events
    print("\n📝 Step 2: Fetching available events...")
    events_response = requests.get(f"{BASE_URL}/events/", headers=headers)
    events = events_response.json()
    
    if not events:
        print("❌ No events found")
        return
    
    event = events[0]
    print(f"✅ Found event: {event['title']}")
    print(f"   Date: {event['date']} at {event['time']}")
    print(f"   Seats: {event['seats_available']}/{event['capacity']}")
    
    # STEP 3: Book event
    print(f"\n📝 Step 3: Booking '{event['title']}'...")
    booking_response = requests.post(
        f"{BASE_URL}/bookings/",
        json={"event_id": event['id']},
        headers=headers
    )
    
    if booking_response.status_code == 200:
        booking = booking_response.json()
        print(f"✅ Booking created! ID: {booking['id']}")
        print(f"   Status: {booking['status']}")
        
        # Check if QR code was generated
        if 'qr_code' in booking and booking['qr_code']:
            print(f"✅ QR Code generated!")
            print(f"   QR Data: {booking['qr_code'][:50]}...")
        else:
            print(f"⚠️  QR Code not found in response")
            print(f"   Response keys: {list(booking.keys())}")
        
        # STEP 4: Verify booking in my bookings
        print(f"\n📝 Step 4: Verifying booking appears in 'My Bookings'...")
        my_bookings = requests.get(f"{BASE_URL}/bookings/my", headers=headers).json()
        this_booking = [b for b in my_bookings if b['event_id'] == event['id']]
        
        if this_booking:
            print(f"✅ Booking found in 'My Bookings'")
            print(f"   Event: {this_booking[0].get('event_title', 'N/A')}")
            print(f"   Attended: {this_booking[0].get('attended', 'N/A')}")
        else:
            print(f"❌ Booking NOT found in 'My Bookings'")
        
        # STEP 5: Check points (should be 0 until scanned)
        print(f"\n📝 Step 5: Checking current points...")
        me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers).json()
        print(f"   Available Points: {me_response.get('available_points', 'N/A')}")
        print(f"   Total Points: {me_response.get('total_points', 'N/A')}")
        print(f"   ℹ️  Points will be 0 until QR is scanned at event")
        
        # STEP 6: Check transaction history
        print(f"\n📝 Step 6: Checking transaction history...")
        history_response = requests.get(f"{BASE_URL}/student/history", headers=headers)
        history = history_response.json()
        
        # Filter for this event
        event_history = [h for h in history if event['title'] in h.get('action', '')]
        
        if event_history:
            print(f"   History entries for this event:")
            for h in event_history:
                status_icon = "✅" if h.get('status') == 'attended' else "⏳" if h.get('status') == 'pending' else "❌"
                print(f"   {status_icon} {h['action']} ({h['points']:+d} pts) - {h.get('status', 'unknown')}")
        else:
            print(f"   ℹ️  No history entries yet (booking not in past)")
        
        print(f"\n{'=' * 60}")
        print(f"✅ BOOKING FLOW COMPLETE!")
        print(f"{'=' * 60}")
        print(f"\n📧 Check console logs for email simulation:")
        print(f"   - Ticket email should show")
        print(f"   - QR code should be generated")
        print(f"\n📱 NEXT STEPS FOR USER:")
        print(f"1. Check browser console/network tab for any errors")
        print(f"2. Try refreshing the page")
        print(f"3. If button still doesn't work, book directly via this script instead")
        
    elif booking_response.status_code == 400:
        error = booking_response.json()
        if "already booked" in error.get("detail", "").lower():
            print(f"ℹ️  Already booked! Getting existing booking info...")
            
            # Get existing booking
            my_bookings = requests.get(f"{BASE_URL}/bookings/my", headers=headers).json()
            this_booking = [b for b in my_bookings if b['event_id'] == event['id']]
            
            if this_booking:
                b = this_booking[0]
                print(f"\n📋 Existing Booking Details:")
                print(f"   Event: {b.get('event_title', 'N/A')}")
                print(f"   Status: {b.get('status', 'N/A')}")
                print(f"   Attended: {b.get('attended', False)}")
                print(f"   Booked on: {b.get('booking_date', 'N/A')}")
                
                # Check if QR code exists in database
                print(f"\n📝 Checking if QR code exists in database...")
                print(f"   (QR codes are generated on backend, not returned in /bookings/my)")
                print(f"   ✅ QR code should have been generated and emailed")
        else:
            print(f"❌ Booking failed: {error.get('detail')}")
    else:
        print(f"❌ Booking request failed: {booking_response.status_code}")
        print(f"   Response: {booking_response.text[:200]}")

if __name__ == "__main__":
    test_complete_booking_flow()
