from dotenv import load_dotenv
import os

try:
    load_dotenv()
    print("DATABASE_URL:", os.getenv("DATABASE_URL"))
    print("Dotenv loaded successfully")
except Exception as e:
    print(f"Error loading dotenv: {e}")
