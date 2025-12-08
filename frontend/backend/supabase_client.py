import os
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

try:
    if not url or not key:
        print("Warning: SUPABASE_URL or SUPABASE_KEY not set")
        supabase = None
    else:
        supabase: Client = create_client(url, key)
except Exception as e:
    print(f"Failed to initialize Supabase: {e}")
    supabase = None
