from sqlalchemy import create_engine, select, desc
from models import User, FeedPost
from database import DATABASE_URL

def check_user():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        from sqlalchemy.orm import sessionmaker
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # 1. Get User ID
        try:
            user = session.execute(select(User).where(User.email == "2305103140014@paruluniversity.ac.in")).scalars().first()
            if user:
                 print(f"TARGET_USER_ID:{user.id}")
            else:
                 print("TARGET_USER_NOT_FOUND")
                 return
        except Exception as e:
            print(f"Error getting user: {e}")
            return

        # 2. Check recent posts
        print("--- RECENT POSTS DUMP ---")
        try:
            posts = session.execute(select(FeedPost).order_by(desc(FeedPost.created_at)).limit(5)).scalars().all()
            for p in posts:
                print(f"POST:{p.id}|User:{p.user_id}|Content:{p.content}")
        except Exception as e_sql:
            print(f"SQL Fetch Error: {type(e_sql)} {e_sql}")
            
    session.close()

if __name__ == "__main__":
    check_user()
