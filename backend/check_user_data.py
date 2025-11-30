import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

# Add path
sys.path.append(os.getcwd())

from database import SessionLocal
from models import User, Student
from points_utils import calculate_student_points

def check_all_students():
    db = SessionLocal()
    with open("check_results.log", "w", encoding="utf-8") as f:
        try:
            f.write("Checking ALL students...\n")
            students = db.query(Student).all()
            for s in students:
                try:
                    points = calculate_student_points(db, s.id, s.user_id)
                    # f.write(f"✅ OK: Student ID {s.id}\n")
                except Exception as e:
                    f.write(f"❌ FAILED for Student ID {s.id} (User {s.user_id}): {e}\n")
                    import traceback
                    traceback.print_exc(file=f)
            f.write("✅ Finished checking all students.\n")

        except Exception as e:
            f.write(f"Error: {e}\n")
        finally:
            db.close()

if __name__ == "__main__":
    check_all_students()
