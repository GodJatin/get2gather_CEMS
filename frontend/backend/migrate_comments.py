from database import engine
from sqlalchemy import text
import sys

try:
    with engine.connect() as conn:
        print("Attempting to add parent_id column...")
        conn.execute(text("ALTER TABLE feed_comments ADD COLUMN parent_id INTEGER REFERENCES feed_comments(id)"))
        conn.commit()
        print("Migration successful: Added parent_id column.")
except Exception as e:
    print(f"Migration blocked (might already exist): {e}")
