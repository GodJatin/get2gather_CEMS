content = """DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/get2gather
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"""

with open(".env", "w", encoding="utf-8") as f:
    f.write(content)

print("Created .env with utf-8 encoding")
