from models import Student
from sqlalchemy import select

def test_attr():
    print(f"Student type: {type(Student)}")
    print(f"Has department? {hasattr(Student, 'department')}")
    try:
        print(f"Student.department: {Student.department}")
    except AttributeError as e:
        print(f"Error accessing Student.department: {e}")
        print(f"Dir: {dir(Student)}")

if __name__ == "__main__":
    test_attr()
