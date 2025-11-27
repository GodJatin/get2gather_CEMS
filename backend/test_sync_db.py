from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User

DATABASE_URL = "sqlite:///./test_sync_final_6.db"

def test_sync():
    print("Connecting to DB (Sync)...")
    engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})
    
    from database import Base
    import models
    print(f"Student columns: {models.Student.__table__.columns.keys()}")
    print("Creating ALL tables...")
    try:
        Base.metadata.create_all(engine)
        print("Tables created.")
    except Exception as e:
        print(f"Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return
    print("Test finished.")

if __name__ == "__main__":
    test_sync()
