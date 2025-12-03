import pytest
from httpx import AsyncClient
import sys
import os

print(f"DEBUG: sys.path: {sys.path}")

from main import app
from database import get_db, Base, engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Use a test database URL (or the same one if safe, but better to use a separate one)
# For this environment, we might have to use the main one or fail if no DB.
# We'll try to use the main one but typically we'd want a separate test DB.
TEST_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost/get2gather")

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="module")
async def client():
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
