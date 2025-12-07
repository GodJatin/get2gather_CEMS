from sqlalchemy import create_engine, select, delete
from models import User, FeedPost
from database import DATABASE_URL
from sqlalchemy.orm import sessionmaker

def clean_feed():
    try:
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()

        user_email = "2305103140014@paruluniversity.ac.in"
        print(f"Finding user {user_email}...")
        user = session.execute(select(User).where(User.email == user_email)).scalars().first()
        
        if not user:
            print("User not found.")
            return

        print(f"User ID: {user.id}")
        print("Deleting ALL feed posts for this user...")
        
        # Delete ALL posts for this user
        result = session.execute(delete(FeedPost).where(FeedPost.user_id == user.id))
        deleted_count = result.rowcount
        
        session.commit()
        print(f"Cleanup complete. Deleted {deleted_count} posts.")
        
    except Exception as e:
        print(f"Error: {e}")
        if 'session' in locals():
            session.rollback()
    finally:
        if 'session' in locals():
            session.close()

if __name__ == "__main__":
    clean_feed()
