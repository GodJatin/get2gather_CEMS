from sqlalchemy import create_engine, inspect
from database import DATABASE_URL

def check_schema():
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        
        if not inspector.has_table("feed_posts"):
            print("Table 'feed_posts' does not exist!")
            return

        columns = inspector.get_columns("feed_posts")
        print("Columns in 'feed_posts':")
        for col in columns:
            print(f"- {col['name']} ({col['type']})")
            
    except Exception as e:
        print(f"Error checking schema: {e}")

if __name__ == "__main__":
    check_schema()
