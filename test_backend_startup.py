import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'frontend', 'backend'))

try:
    print("Attempting to import app from main...")
    from main import app
    print("SUCCESS: App imported successfully.")
except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()
