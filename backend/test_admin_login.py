import requests

def test_admin_login():
    url = "http://localhost:8000/auth/login"
    payload = {
        "username": "admin@get2gather.com",
        "password": "admin123"
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    try:
        print(f"Attempting login to {url}...")
        response = requests.post(url, data=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login Successful!")
            print(f"Role: {data.get('role')}")
            print(f"Token: {data.get('access_token')[:20]}...")
        else:
            print("❌ Login Failed")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_admin_login()
