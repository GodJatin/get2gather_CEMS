import asyncio
from httpx import AsyncClient

async def test_admin_login():
    async with AsyncClient(base_url="http://localhost:8000") as ac:
        print("Testing Admin Login...")
        response = await ac.post("/auth/login", data={
            "username": "admin@get2gather.com",
            "password": "admin123"
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login Successful")
            print(f"Role: {data.get('role')}")
            print(f"Token: {data.get('access_token')[:20]}...")
            
            if data.get('role') == 'admin':
                print("✅ Role is correctly set to 'admin'")
            else:
                print(f"❌ Incorrect role: {data.get('role')}")
        else:
            print(f"❌ Login Failed: {response.status_code}")
            print(response.text)

if __name__ == "__main__":
    asyncio.run(test_admin_login())
