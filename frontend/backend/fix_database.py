from sqlalchemy import create_engine, text
from database import DATABASE_URL

def fix_database():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Starting cleanup of massive posts...")
        
        # 1. Count massive posts (using length check if DB supports it, or just nuke recent ones)
        # PostgreSQL: length(media_urls::text) > 10000
        try:
            # Check how many posts are massive
            result = conn.execute(text("SELECT count(*) FROM feed_posts WHERE length(media_urls::text) > 5000"))
            count = result.scalar()
            print(f"Found {count} massive posts (>5000 chars).")
            
            if count > 0:
                print("Deleting massive posts...")
                conn.execute(text("DELETE FROM feed_posts WHERE length(media_urls::text) > 5000"))
                conn.commit()
                print("Cleanup successful.")
            else:
                print("No massive posts found via SQL check.")
                
        except Exception as e:
            print(f"Error executing raw SQL: {e}")

if __name__ == "__main__":
    fix_database()
