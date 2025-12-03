import sys
import os

# Add the backend directory to the sys.path so imports work
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from main import app
