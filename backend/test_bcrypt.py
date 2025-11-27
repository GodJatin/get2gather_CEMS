import bcrypt

try:
    password = b"password123"
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)
    print(f"Hash success: {hashed}")
    
    check = bcrypt.checkpw(password, hashed)
    print(f"Check success: {check}")
except Exception as e:
    print(f"Bcrypt failed: {e}")
