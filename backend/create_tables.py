from sqlalchemy import create_engine
from database import Base
import models
import os

DATABASE_URL = "sqlite:///C:/Users/HP/.gemini/test_sync_final.db"

def create_tables():
    print(f"Student columns: {models.Student.__table__.columns.keys()}")
    if 'spent_points' not in models.Student.__table__.columns:
        print("ERROR: spent_points missing from Student model!")
        return

    engine = create_engine(DATABASE_URL, echo=True)
    print("Creating tables...")
    Base.metadata.create_all(engine)
    print("Tables created.")

if __name__ == "__main__":
    create_tables()
