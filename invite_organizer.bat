@echo off
echo Starting Organizer Invite Tool...
cd frontend/backend
call .\venv_new\Scripts\activate
python create_organizer_invite.py
pause
