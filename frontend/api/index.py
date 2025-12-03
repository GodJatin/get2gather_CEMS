import sys
import os

# Add the backend directory to the sys.path so imports work
# Since this file is in frontend/api/index.py, and backend is in frontend/backend
# We need to go up one level to 'frontend' then into 'backend'
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from main import app
