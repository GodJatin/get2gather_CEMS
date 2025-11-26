import sys
import os

# Add the current directory to sys.path so we can import from routers
sys.path.append(os.getcwd())

from routers.security_utils import get_password_hash, verify_password

def test_hashing():
    password = "password123"
    print(f"Testing with password: {password}")

    # 1. Hash the password
    hashed = get_password_hash(password)
    print(f"Hashed password: {hashed}")

    # 2. Verify the password
    is_valid = verify_password(password, hashed)
    print(f"Verification result (should be True): {is_valid}")

    # 3. Verify with wrong password
    is_valid_wrong = verify_password("wrongpassword", hashed)
    print(f"Verification with wrong password (should be False): {is_valid_wrong}")

    if is_valid and not is_valid_wrong:
        print("\nSUCCESS: Hashing and verification logic is working correctly.")
    else:
        print("\nFAILURE: Hashing or verification logic failed.")

if __name__ == "__main__":
    test_hashing()
