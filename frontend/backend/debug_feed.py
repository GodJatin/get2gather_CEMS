from sqlalchemy import create_engine, select, desc
from sqlalchemy.orm import sessionmaker
from models import FeedPost, User
from database import DATABASE_URL
import datetime
import json

def debug_feed():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    print("--- Checking User Posts (Real Data) ---")
    try:
        user_email = "2305103140014@paruluniversity.ac.in"
        user = session.execute(select(User).where(User.email == user_email)).scalar_one_or_none()
        
        if user:
            print(f"User Found: ID {user.id}, Name: {user.name}")
            query = select(FeedPost).where(FeedPost.user_id == user.id).order_by(desc(FeedPost.created_at))
            posts = session.execute(query).scalars().all()
            print(f"User has {len(posts)} posts.")
            for p in posts:
                print(f"  - Post {p.id}: '{p.content}' | Tags: {p.tagged_users} | Props: {p.tagged_events}")
        else:
            print(f"User {user_email} not found!")

    except Exception as e:
        print(f"Error fetching/processing posts: {e}")
        import traceback
        traceback.print_exc()

    # Skip large payload test for now
    # print("\n--- Simulating Image Post Creation (Large Payload 5MB) ---")
    try:
        # Simulate base64 image (5MB)
        dummy_base64 = "data:image/png;base64," + "A" * (5 * 1024 * 1024)
        new_post = FeedPost(
            user_id=1, 
            content="Debug Post Large Payload",
            media_urls=[dummy_base64],
            media_type="image",
            created_at=datetime.datetime.utcnow().isoformat(),
            tagged_users=[],
            tagged_events=[]
        )
        session.add(new_post)
        session.commit()
        print(f"Successfully created large post {new_post.id}")
    except Exception as e:
        print(f"Error creating large post: {e}")
        session.rollback()

    session.close()

if __name__ == "__main__":
    debug_feed()
