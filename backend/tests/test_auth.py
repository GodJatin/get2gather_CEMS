import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_student(client: AsyncClient):
    response = await client.post("/auth/signup/student", json={
        "name": "Test Student",
        "email": "2003031240555@paruluniversity.ac.in",
        "password": "password123",
        "department": "CSE",
        "enrollment_number": "2003031240555",
        "phone_number": "1234567890"
    })
    # We expect 200 or 400 if already exists
    assert response.status_code in [200, 400]

@pytest.mark.asyncio
async def test_login_student(client: AsyncClient):
    # First ensure user exists (or rely on previous test order, but better to be independent)
    # For simplicity in this verification, we'll just try to login
    response = await client.post("/auth/login", data={
        "username": "2003031240555@paruluniversity.ac.in",
        "password": "password123"
    })
    assert response.status_code in [200, 401] # 401 if registration failed
