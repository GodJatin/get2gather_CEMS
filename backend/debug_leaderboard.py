import requests

BASE_URL = "http://localhost:8000"

def login():
    response = requests.post(f"{BASE_URL}/auth/login", data={
        "username": "200303124000@paruluniversity.ac.in", # From seed data
        "password": "password123"
    })
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return None
    return response.json()["access_token"]

def get_leaderboard(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/leaderboard", headers=headers)
    if response.status_code != 200:
        print(f"Leaderboard fetch failed: {response.text}")
        return
    print("Leaderboard Data:", response.json())
    return response.json()

def verify_social_flow(token, leaders):
    if not leaders:
        print("No leaders found, skipping social verification.")
        return

    target_student = leaders[0]
    target_id = target_student['student_id']
    print(f"\nTarget Student: {target_student['student_name']} (ID: {target_id})")

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get Public Profile
    print(f"\nFetching Public Profile for ID {target_id}...")
    res = requests.get(f"{BASE_URL}/social/profile/{target_id}", headers=headers)
    if res.status_code == 200:
        print("Profile:", res.json())
    else:
        print(f"Failed to fetch profile: {res.text}")

    # 2. Follow User
    print(f"\nFollowing User ID {target_id}...")
    res = requests.post(f"{BASE_URL}/social/follow/{target_id}", headers=headers)
    if res.status_code == 200:
        print("Follow Response:", res.json())
    else:
        print(f"Failed to follow: {res.text}")

    # 3. Get Feed (Following)
    print("\nFetching Following Feed...")
    res = requests.get(f"{BASE_URL}/feed/?following_only=true", headers=headers)
    if res.status_code == 200:
        print(f"Feed Items: {len(res.json())}")
        if len(res.json()) > 0:
            print("First Post:", res.json()[0])
    else:
        print(f"Failed to fetch feed: {res.text}")

    # 4. Get Own Profile (Private)
    print("\nFetching Own Profile...")
    res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if res.status_code == 200:
        print("Own Profile:", res.json())
    else:
        print(f"Failed to fetch own profile: {res.text}")

if __name__ == "__main__":
    token = login()
    if token:
        leaders = get_leaderboard(token)
        verify_social_flow(token, leaders)
