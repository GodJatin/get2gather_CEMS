from database import engine, Base
from models import FeedPost, FeedLike, FeedComment
from sqlalchemy import text

def reset_feed_tables():
    print("Resetting feed tables...")
    with engine.connect() as conn:
        # Drop tables in order of dependency
        conn.execute(text("DROP TABLE IF EXISTS feed_comments"))
        conn.execute(text("DROP TABLE IF EXISTS feed_likes"))
        conn.execute(text("DROP TABLE IF EXISTS feed_posts"))
        conn.commit()
    
    print("Creating new tables...")
    Base.metadata.create_all(bind=engine)
    print("Done!")

if __name__ == "__main__":
    reset_feed_tables()
