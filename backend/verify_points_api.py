import requests
import json

BASE_URL = "http://localhost:8018"
EMAIL = "2305103140014@paruluniversity.ac.in"
PASSWORD = "J@tin224"

def verify_points():
    print("1. Logging in...")
    login_data = {"username": EMAIL, "password": PASSWORD}
    res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return
    
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # 2. Check /auth/me
    print("\n2. Checking /auth/me...")
    res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    me_data = res.json()
    print(f"Me Data Points: Total={me_data.get('total_points')}, Available={me_data.get('available_points')}")
    print(f"Me Data Gamification: Title='{me_data.get('title')}', Badges={len(me_data.get('badges', []))}")

    # 3. Check /leaderboard
    print("\n3. Checking /leaderboard...")
    res = requests.get(f"{BASE_URL}/leaderboard", headers=headers)
    leaderboard = res.json()
    
    my_entry = next((item for item in leaderboard if item["student_name"] == me_data["name"]), None)
    if my_entry:
        print(f"Leaderboard Entry: Score={my_entry['score']}, Title='{my_entry['title']}'")
        
        if my_entry['score'] == me_data['available_points']:
            print("✅ SUCCESS: Leaderboard score matches Profile available points.")
        else:
            print("❌ FAILURE: Leaderboard score mismatch!")
    else:
        print("⚠️ WARNING: User not found in leaderboard (maybe not in top 10?)")

    # 4. Check /stats/student
    print("\n4. Checking /stats/student...")
    res = requests.get(f"{BASE_URL}/stats/student", headers=headers)
    stats_data = res.json()
    print(f"Stats Rank: {stats_data['rank']}")
    
    # 5. Check /student/profile (if exists)
    print("\n5. Checking /student/profile...")
    res = requests.get(f"{BASE_URL}/student/profile", headers=headers)
    if res.status_code == 200:
        profile_data = res.json()
        print(f"Profile Spent Points: {profile_data.get('spent_points')}")
    else:
        print(f"Profile endpoint failed: {res.status_code}")

if __name__ == "__main__":
    verify_points()
