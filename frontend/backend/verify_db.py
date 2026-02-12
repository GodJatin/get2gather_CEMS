import os
import psycopg2
from dotenv import load_dotenv

# Load .env explicitly
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")

print(f"Testing connection to: {DATABASE_URL}")

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("SUCCESS: Connected to database!")
    conn.close()
except Exception as e:
    print(f"FAILURE: Could not connect to database.")
    print(f"Error: {e}")
