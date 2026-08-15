# Foundation ERP

Modern enterprise resource planning application tailored for non-profit foundation management, featuring financial ledgers, member registries, donation tracking (Sadaqah), benevolent loans (Qard Hasan), and campaign workflows.

---

## 1. Decoupled Architecture

The project is structured as two independently buildable and deployable applications:

```text
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend Web Client                       │
│              (Next.js 16 + TypeScript + Tailwind)               │
│                  Hosted on Vercel / Render / Node               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                     HTTPS / JSON REST API
                   (NEXT_PUBLIC_API_URL)
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend API Service                       │
│                 (Python 3.12 + FastAPI + Uvicorn)               │
│                 Hosted on Render / Railway / VPS                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                  PostgreSQL Connection Pool (psycopg3)
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PostgreSQL Database                       │
│                     (Neon Cloud / AWS / Self)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles
- **Separation of Concerns**: The frontend contains zero direct database queries; all interactions flow through the FastAPI REST API.
- **Independent Lifecycles**: Frontend and Backend can be updated, scaled, and deployed independently without Docker or monorepo coupling.
- **Unified Configuration**: A single environment variable (`NEXT_PUBLIC_API_URL`) directs the frontend to any backend host.
- **Production Ready**: Native cloud deployment guides for Vercel, Render, Railway, Fly.io, and standard Linux servers without Docker dependencies.

---

## 2. Repository Structure

```text
project/
├── frontend/                     # Standalone Next.js 16 + TypeScript application
│   ├── src/                      # App router, UI components, API client
│   ├── .env.example              # Frontend environment variables template
│   ├── package.json              # Next.js scripts and dependencies
│   └── README.md                 # Frontend architecture, setup & deployment guide
│
├── backend/                      # Standalone Python 3.12 + FastAPI application
│   ├── app/                      # FastAPI routers, models, services, repositories
│   ├── tests/                    # Pytest test suite (73 tests)
│   ├── .env.example              # Backend environment variables template
│   ├── pyproject.toml            # Python project configuration & pytest settings
│   ├── requirements.txt          # Production Python dependencies
│   └── README.md                 # Backend architecture, setup & deployment guide
│
├── render.yaml                   # Native Render Blueprint for both independent services
└── README.md                     # Root project documentation
```

---

## 3. Quick Start — Local Development

### Step 1: Clone & Navigate
```bash
git clone <repository-url>
cd foundation-backend-migration
```

### Step 2: Start Python FastAPI Backend
```bash
cd backend

# Create & activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and supply your PostgreSQL DATABASE_URL and SECRET_KEY

# Start backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/api/v1/docs` and health probe at `http://127.0.0.1:8000/health`.*

### Step 3: Start Next.js Frontend (in a new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"

# Start frontend development server
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## 4. Environment Variables Summary

### Frontend (`frontend/.env.local`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of FastAPI Backend | `http://127.0.0.1:8000` or `https://backend.onrender.com` |
| `NEXTAUTH_URL` | Canonical URL of Frontend | `http://localhost:3000` or `https://app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret key for session encryption | *Random 32+ char string* |

### Backend (`backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL Connection URI | `postgresql+psycopg://user:pass@host:5432/dbname?sslmode=require` |
| `SECRET_KEY` | JWT Signing Secret Key | *Random 32+ char string* |
| `ENVIRONMENT` | Environment Mode | `development` / `production` |

---

## 5. Automated Verification & Testing

### Test Backend
```bash
cd backend
.venv/bin/pytest
```
*Executes all 73 automated tests covering Authentication, RBAC, Members, Member Requests, Groups, Funds, Sadaqah, Dues, and Qard Hasan.*

### Verify Frontend
```bash
cd frontend
npm run typecheck
npm run lint
npm run build
```
*Verifies TypeScript typings, code linting, and compiles the production Next.js bundle.*

---

## 6. Detailed Sub-Project Documentation

- [Frontend Documentation](file:///workspaces/foundation-backend-migration/frontend/README.md)
- [Backend Documentation](file:///workspaces/foundation-backend-migration/backend/README.md)
