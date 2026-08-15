# Git Repository Structure & Deployment Push Guidelines

This document defines the permanent rules, repository mappings, and push workflows for the Foundation ERP system.

---

## 1. Repository Architecture & Mapping

The project is structured into two independent standalone applications managed across separate GitHub repositories:

| Component | Local Source Directory | Target GitHub Repository | Target Branch | Scope & Content |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `./frontend` | `https://github.com/isernai12/foundation-frontend` | `main` | Next.js 16 App Router UI, components, actions, public assets, and client configs. |
| **Backend** | `./backend` | `https://github.com/isernai12/foundation-backend` | `main` | FastAPI Python API, SQLAlchemy models, Alembic migrations, schemas, services, tests, and Procfile/render.yaml. |

---

## 2. Core Push Rules & Invariants

1. **Standalone Repository Isolation**:
   - **Frontend repository** contains **ONLY** frontend project files (the contents of `./frontend` at the root of `foundation-frontend`).
   - **Backend repository** contains **ONLY** backend project files (the contents of `./backend` at the root of `foundation-backend`).
2. **Never Push the Monorepo / Worktree as a Whole**:
   - Do not push root-level monorepo directories, worktree links (`.git` pointers), or legacy monorepo structures to the standalone repositories.
3. **No Directory Nesting**:
   - Never place `frontend/` inside another `frontend/` directory.
   - Never place `backend/` inside another backend/ directory.
   - The root of `foundation-frontend` repository must contain `package.json`, `src/`, `next.config.ts`, etc.
   - The root of `foundation-backend` repository must contain `pyproject.toml`, `requirements.txt`, `app/`, `alembic/`, `Procfile`, etc.
4. **Never Mix Files**:
   - Never include backend Python files, database schemas, or Alembic migrations inside the frontend repo.
   - Never include Next.js TSX components, Node modules, or frontend assets inside the backend repo.
5. **Strict Secret & Environment Isolation**:
   - **NEVER** push `.env`, `.env.local`, `.env.production`, or private key files.
   - **NEVER** commit hardcoded database credentials, JWT secrets, or Cloudinary API keys.
   - Only `.env.example` templates with sanitized placeholders may be committed.
6. **No Spurious Repository Creation**:
   - Do not create any new repositories unless explicitly instructed.
7. **Direct Target Branch**:
   - Push directly to `origin/main` on the respective standalone repository.

---

## 3. Pre-Push Verification Checklist

Before pushing to either repository, always execute the following verification steps:

- [ ] **1. Run Tests & Builds**:
  - Backend: `pytest` passes 100% (79/79 tests).
  - Frontend: `npm run build` succeeds without TypeScript or bundling errors.
- [ ] **2. Check Ignored Files & Secrets**:
  - Verify `.env` files are not staged (`git status`).
  - Verify `.gitignore` rules prevent build artifacts (`.next/`, `.venv/`, `node_modules/`, `__pycache__/`, `*.tsbuildinfo`).
- [ ] **3. Verify Remotes**:
  - Frontend remote points to `https://github.com/isernai12/foundation-frontend.git`.
  - Backend remote points to `https://github.com/isernai12/foundation-backend.git`.
- [ ] **4. Verify File Boundaries**:
  - Frontend checkout contains strictly frontend files.
  - Backend checkout contains strictly backend files.

---

## 4. Standard Push Workflow

### A. Pushing Frontend (`foundation-frontend`)

```bash
# 1. Sync local frontend directory to the standalone frontend repo worktree/clone
rsync -av --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='*.tsbuildinfo' \
  --exclude='.env' \
  --exclude='.env*.local' \
  --exclude='.DS_Store' \
  frontend/ /path/to/foundation-frontend/

# 2. Navigate to standalone frontend repo
cd /path/to/foundation-frontend

# 3. Check status and staged files
git status

# 4. Stage, commit, and push
git add .
git commit -m "feat(frontend): describe changes"
git push origin main

# 5. Verify remote commit on GitHub
gh api repos/isernai12/foundation-frontend/commits/main --jq '.sha, .commit.message'
```

### B. Pushing Backend (`foundation-backend`)

```bash
# 1. Sync local backend directory to the standalone backend repo worktree/clone
rsync -av --delete \
  --exclude='.git' \
  --exclude='.venv' \
  --exclude='venv' \
  --exclude='__pycache__' \
  --exclude='.pytest_cache' \
  --exclude='.env' \
  --exclude='.env*.local' \
  --exclude='.DS_Store' \
  backend/ /path/to/foundation-backend/

# 2. Navigate to standalone backend repo
cd /path/to/foundation-backend

# 3. Check status and staged files
git status

# 4. Stage, commit, and push
git add .
git commit -m "feat(backend): describe changes"
git push origin main

# 5. Verify remote commit on GitHub
gh api repos/isernai12/foundation-backend/commits/main --jq '.sha, .commit.message'
```

---

## 5. Render & Cloud Deployment Configuration

### Backend Production Configuration (Render)
- **Runtime**: Python 3.12
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Procfile**: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Host Binding**: Always bind to `0.0.0.0` (never `127.0.0.1` in production).
- **Auto-Reload**: Never use `--reload` in production.

### Frontend Production Configuration (Vercel / Render)
- **Framework**: Next.js (App Router)
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Environment Variable**: `NEXT_PUBLIC_API_URL` pointing to the public HTTPS backend URL (e.g., `https://foundation-backend.onrender.com`).
