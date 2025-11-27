try:
    from schemas import EventCreate
    print("Successfully imported EventCreate")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
