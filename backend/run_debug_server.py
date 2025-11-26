import uvicorn
import os
import sys

# Ensure we are in the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting debug server on port 8001...")
    # Redirect stdout/stderr to file
    sys.stdout = open('debug_output.log', 'w', buffering=1)
    sys.stderr = sys.stdout
    try:
        uvicorn.run("main:app", host="127.0.0.1", port=8001, log_level="debug")
    except Exception as e:
        print(f"Server failed to start: {e}")
