import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from models import Base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
engine = create_async_engine(DATABASE_URL, echo=True)

async def init_db_safe():
    print(f"Initializing database at {DATABASE_URL}...")
    async with engine.begin() as conn:
        # Create tables only if they don't exist
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized (tables created if missing). Data preserved.")

if __name__ == "__main__":
    asyncio.run(init_db_safe())
