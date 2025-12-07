import requests

BASE_URL = "http://localhost:8000/api" # Assuming /api prefix based on task.md check
# Or http://localhost:8000 if no prefix? 
# routers/feed.py has prefix="/feed".
# Main.py likely includes it.
# Let's try http://localhost:8000 first, or check main.py.
# Using http://127.0.0.1:8000/

def test_feed():
    # 1. Login
    login_data = {
        "username": "2305103140014@paruluniversity.ac.in",
        "password": "J@tin224"
    }
    # Usually OAuth2PasswordRequestForm expects form data
    res = requests.post("http://127.0.0.1:8000/token", data=login_data)
    if res.status_code != 200:
        print(f"Login Failed: {res.status_code} {res.text}")
        return
    
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login Successful.")

    # 2. Get Feed (Before)
    res = requests.get("http://127.0.0.1:8000/feed/", headers=headers)
    print(f"Feed (Before) Status: {res.status_code}")
    if res.status_code == 200:
        posts = res.json()
        print(f"Found {len(posts)} posts.")
        if len(posts) > 0:
            print(f"Top Post: {posts[0]['content']} by {posts[0]['user_name']}")
    else:
        print(f"Error: {res.text}")

    # 3. Create Post
    new_post = {
        "content": "API Test Post",
        "media_urls": [],
        "media_type": "text",
        "tagged_users": [],
        "tagged_events": []
    }
    res = requests.post("http://127.0.0.1:8000/feed/", json=new_post, headers=headers)
    print(f"Create Post Status: {res.status_code}")
    if res.status_code == 200:
        print(f"Created Post: {res.json()}")
    else:
        print(f"Error Creating: {res.text}")

    # 4. Get Feed (After)
    res = requests.get("http://127.0.0.1:8000/feed/", headers=headers)
    posts = res.json() if res.status_code == 200 else []
    print(f"Feed (After) Count: {len(posts)}")

if __name__ == "__main__":
    test_feed()
