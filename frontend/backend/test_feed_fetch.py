import requests

def test_feed_fetch():
    # Login to get token
    try:
        login_res = requests.post("http://127.0.0.1:8000/token", data={
            "username": "2305103140014@paruluniversity.ac.in",
            "password": "J@tin224"
        })
        
        if login_res.status_code != 200:
            print(f"Login Failed: {login_res.text}")
            return

        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Fetch Feed
        print("Fetching Feed...")
        feed_res = requests.get("http://127.0.0.1:8000/feed/", headers=headers)
        
        print(f"Status Code: {feed_res.status_code}")
        print(f"Response: {feed_res.text}")
        
        if feed_res.status_code == 200:
            data = feed_res.json()
            print(f"Post Count: {len(data)}")
            if len(data) == 0:
                print("WARNING: Feed is empty.")
            else:
                print("First Post:", data[0])
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_feed_fetch()
