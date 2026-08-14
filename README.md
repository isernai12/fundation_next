# Foundation ERP

## 1. Project Overview
Foundation ERP is a comprehensive, modern enterprise resource planning application tailored for managing the complex operations of a non-profit foundation.

**Main Modules:**
- **Authentication**: Secure login, session persistence, and role-based access control.
- **Members**: Complete membership management.
- **Groups**: Organize members into structured foundation groups.
- **Beneficiaries**: Track individuals receiving support.
- **Donors & Sadaqah**: Manage donor profiles and donation history.
- **Monthly Dues**: Track recurring membership payments.
- **Financial Activities**: Run and manage fund collection campaigns.
- **Qard-e-Hasana**: Disburse and track benevolent financial assistance.
- **Ledger**: Centralized double-entry accounting truth for all transactions.
- **Documents**: Cloud-based document and media management.

**Technology Stack:**
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend API**: Python 3.12, FastAPI, Pydantic 2.x
- **Database Engine**: PostgreSQL (Neon Cloud)
- **Database ORM**: SQLAlchemy 2.x (FastAPI) & Prisma (Client)
- **Authentication**: NextAuth.js (Frontend) + JWT / UserSessions (FastAPI)
- **Deployment**: Single Docker Container (Render)

## 2. Architecture

```
Browser
  ↓
Next.js (Public Port 3000)
  ↓ (Internal Proxy / Server Actions)
FastAPI Backend (127.0.0.1:8000, Internal Only)
  ↓
SQLAlchemy 2.x
  ↓
PostgreSQL Database
```

## 3. Requirements
- **Node.js**: Version 20.x or higher
- **Python**: Version 3.12.x
- **PostgreSQL**: Version 15+ (or Cloud Neon Database)
- **Docker**: For production containerized deployment

## 4. Local Development

```bash
# 1. Install frontend dependencies
cd frontend
npm install

# 2. Install backend dependencies
cd ../backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Configure environment variables
# Copy .env.example files and configure PostgreSQL DATABASE_URL
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# 4. Start FastAPI backend
PYTHONPATH=.. uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

# 5. Start Next.js frontend (in another terminal)
cd frontend
npm run dev
```

## 5. Docker Single-Container Deployment

```bash
# Build the single container
docker build -t foundation-app:latest .

# Run container locally with PostgreSQL connection
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host/database?sslmode=require" \
  -e NEXTAUTH_SECRET="your-secret-key" \
  -e SECRET_KEY="your-backend-secret-key" \
  foundation-app:latest
```
