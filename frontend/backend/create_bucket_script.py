
import os
import sys
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv(".env")

# Add current directory to path to import supabase_client
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from supabase_client import supabase
    print("Authenticated Supabase client.")
except Exception as e:
    print(f"Failed to import supabase_client: {e}")
    sys.exit(1)

def create_events_bucket():
    try:
        print("Checking existing buckets...")
        buckets = supabase.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        print(f"Existing buckets: {bucket_names}")

        if "events" in bucket_names:
            print("Bucket 'events' already exists.")
            return

        print("Attempting to create 'events' bucket...")
        # Try to create a public bucket
        res = supabase.storage.create_bucket("events", options={"public": True})
        print(f"Bucket created result: {res}")
        print("✅ Bucket 'events' created successfully!")
        
    except Exception as e:
        print(f"❌ Failed to create bucket: {e}")
        print("\nNOTE: This failure is expected if using an 'anon' key. Creating buckets usually requires 'service_role' key or Dashboard access.")

if __name__ == "__main__":
    create_events_bucket()
