# Get2Gather - College Event Management System

A modern, full-stack event management platform for college events with separate portals for students, organizers, and administrators.

## 🚀 Features

### Student Portal
- ✅ 4-step registration with email OTP verification
- ✅ Browse and search college events
- ✅ Book event tickets
- ✅ View booking history
- ✅ Manage profile

### Organizer Portal
- ✅ 3-phase registration with invite code validation
- ✅ Email OTP verification
- ✅ Create and manage events
- ✅ Upload event media (Cloudinary integration)
- ✅ Track bookings and attendees
- ✅ Event approvals workflow

### Admin Portal
- ✅ Approve/reject organizer registrations
- ✅ Approve/reject events
- ✅ Manage all users
- ✅ System analytics

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database with AsyncPG
- **SQLAlchemy** - ORM with async support
- **Resend** - Email service for OTP delivery
- **Python-JOSE** - JWT authentication
- **Passlib** - Password hashing with bcrypt

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/get2gather
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
RESEND_API_KEY=your-resend-api-key-here
```

5. Run the server:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `RESEND_API_KEY` - Email service API key

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## 📧 Email Configuration

This project uses [Resend](https://resend.com) for sending OTP emails:

1. Sign up at resend.com (free tier: 3,000 emails/month)
2. Get your API key
3. Add to backend `.env` file
4. Emails will be sent from `onboarding@resend.dev` (test domain)

## 👥 User Roles

1. **Student** - Register with college email (@paruluniversity.ac.in)
2. **Organizer** - Requires invite code from admin
3. **Admin** - Default credentials (create using `create_admin.py`)

## 📝 Database Schema

- `users` - Authentication and role management
- `students` - Student profiles
- `organizers` - Organizer profiles and organizations
- `events` - Event listings
- `bookings` - Student event bookings
- `media` - Event media files
- `organizer_invites` - Pre-approved organizer invites
- `registration_attempts` - Temporary OTP storage

## 🧪 Testing

Run backend tests:
```bash
cd backend
pytest
```

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 👨‍💻 Author

Created by GodJatin

## 🙏 Acknowledgments

- Parul University for inspiration
- Resend for email service
- Cloudinary for media storage
