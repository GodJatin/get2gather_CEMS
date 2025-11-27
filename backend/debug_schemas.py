try:
    from schemas import StudentCreate
    print("Successfully imported StudentCreate")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
