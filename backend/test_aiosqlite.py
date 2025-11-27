import asyncio
import aiosqlite

async def test_db():
    print("Connecting to DB...")
    try:
        async with aiosqlite.connect("backend/test.db") as db:
            print("Connected.")
            async with db.execute("SELECT * FROM users LIMIT 1") as cursor:
                row = await cursor.fetchone()
                print(f"Row: {row}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_db())
