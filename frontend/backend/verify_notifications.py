from database import SessionLocal
from models import User, Notification
from sqlalchemy import text

db = SessionLocal()

print("--- DIAGNOSTIC START ---")

try:
    # 1. Inspect Users and Roles
    print("\n[1. User Role Inspection]")
    users = db.query(User).limit(5).all()
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}, Role: '{u.role}', Type: {type(u.role)}")

    # 2. Check Specific counts
    student_count_str = db.query(User).filter(User.role == 'student').count()
    student_count_enum = db.query(User).filter(User.role == 'STUDENT').count() 
    print(f"\n[2. Counts]")
    print(f"Users with role == 'student': {student_count_str}")
    print(f"Users with role == 'STUDENT': {student_count_enum}")

    # 3. Check Table Schema
    print("\n[3. Schema Inspection]")
    from sqlalchemy import inspect
    inspector = inspect(db.get_bind())
    columns = [c['name'] for c in inspector.get_columns('notifications')]
    print(f"Notification Table Columns: {columns}")
    
    if 'data' not in columns:
        print("CRITICAL: 'data' column MISSING in notifications table!")
    if 'type' not in columns:
        print("CRITICAL: 'type' column MISSING in notifications table!")

    # 4. Notifications Data
    print("\n[4. Data Check]")
    total_notifs = db.query(Notification).count()
    print(f"Total Notifications: {total_notifs}")

except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Diagnostic Error: {e}")

finally:
    db.close()
    print("\n--- DIAGNOSTIC END ---")
