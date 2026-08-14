# Foundation ERP — Frontend Application Guide

A comprehensive, production-grade enterprise web application for non-profit foundation resource planning, member registry, contribution ledgers, Qard Hasan loans, and welfare campaigns. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4**, and **shadcn/ui**.

---

## 1. What the Frontend Is

The **Foundation ERP Frontend** is a fully decoupled client-side and server-rendered web application that provides an intuitive, multilingual administrative and member interface. 

It handles:
- **Authentication & Role-Based Views**: Secure login, active device session tracking, and permission-based route protection.
- **Member Management**: Comprehensive member profiles, public member registration requests, status approval pipelines, and document attachments.
- **Financial & Group Operations**: Foundation group tracking, dedicated fund balances, and group transaction histories.
- **Contribution & Dues Tracking**: Monthly member dues collection, ledger sheets, and receipt generation.
- **Qard Hasan (Benevolent Loans)**: Loan applications, repayment installment schedules, daily/upcoming collection sheets, and loan ledgers.
- **Grants & Beneficiaries**: Social welfare beneficiary registry, assistance records, and grant disbursement workflows.
- **Sadaqah & Donors**: Donor registry and one-off/recurring donation tracking.
- **Campaigns**: Targeted fundraising drives with progress tracking and contribution collection.
- **System Administration & I18n**: Organizational branding, financial rules, role management, audit logs, and English/Bengali bilingual support.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2.10 (App Router) | Server Components, Server Actions, route handlers, Turbopack support |
| **Runtime & Language**| Node.js 20+ & TypeScript 5 | Type safety, end-to-end DTO typing |
| **UI Library** | React 19.2.4 | Modern reactive component tree |
| **Styling** | Tailwind CSS 4 & PostCSS | Utility-first responsive design tokens |
| **Component Primitives** | Radix UI & shadcn/ui | Accessible modals, popovers, dropdowns, tables, tabs, dialogs |
| **Icons** | Lucide React | Consistent UI iconography |
| **Forms & Validation** | React Hook Form & Zod | Schema-based client and server-side form validation |
| **Data Visualization** | Recharts, Chart.js, react-chartjs-2 | Financial breakdowns, monthly collection charts, dashboard stats |
| **Authentication** | NextAuth.js v4 | Session management, HTTP-only cookie security, credentials provider |
| **Media Management** | Cloudinary SDK | Cloud storage for member photos and identity verification documents |
| **Internationalization**| Custom i18n Provider | Dynamic runtime language switching (English & Bengali) |

---

## 3. Project Structure

```text
frontend/
├── public/                       # Static branding, logos, icons, fonts
├── src/
│   ├── app/                      # Next.js App Router hierarchy
│   │   ├── (auth)/               # Authentication route group
│   │   │   └── login/            # Login page and authentication forms
│   │   ├── (dashboard)/          # Authenticated application shell & pages
│   │   │   ├── dashboard/        # Executive overview & financial statistics
│   │   │   ├── members/          # Member directory, profile layout, dues, requests
│   │   │   ├── groups/           # Foundation groups, fund ledgers, transactions
│   │   │   ├── contributions/    # Monthly contributions, due lists, collection
│   │   │   ├── loans/            # Qard Hasan loan accounts, repayments, schedules
│   │   │   ├── grants/           # Grant disbursement and assistance records
│   │   │   ├── beneficiaries/    # Beneficiary registry & support history
│   │   │   ├── donors/           # Donor profiles & Sadaqah intake
│   │   │   ├── campaigns/        # Fundraising campaigns & contribution drive
│   │   │   ├── settings/         # Roles, permissions, branding, audit logs
│   │   │   └── profile/          # User profile, password reset, active devices
│   │   ├── api/                  # Frontend internal API route handlers
│   │   │   ├── auth/[...nextauth]/ # NextAuth authentication handler
│   │   │   └── upload/           # Cloudinary media upload proxy
│   │   ├── member-request/       # Public member registration & status lookup
│   │   ├── layout.tsx            # Global HTML layout, font loader, theme providers
│   │   └── page.tsx              # Public home page
│   ├── components/               # Shared & reusable UI components
│   │   ├── layout/               # AppSidebar, Header, Breadcrumbs, Navigation
│   │   ├── ui/                   # Radix UI / shadcn components (button, dialog, input)
│   │   └── shared/               # Reusable chart wrappers, data tables, status badges
│   ├── features/                 # Domain-specific UI features & modals
│   │   ├── members/              # Member forms, ledger modals, documents list
│   │   ├── groups/               # Group creation modal, group ledger tables
│   │   ├── contributions/        # Monthly dues collection forms, ledger sheets
│   │   ├── loans/                # Repayment modal, schedule tables, loan actions
│   │   └── settings/             # Role matrix editor, user permission tables
│   ├── hooks/                    # Custom React hooks (useAuth, useDebounce, useMediaQuery)
│   ├── i18n/                     # Internationalization layer
│   │   ├── dictionaries/         # JSON translation dictionaries (en, bn)
│   │   └── LanguageProvider.tsx  # Dynamic language context & switcher hook
│   ├── lib/                      # Core utilities & API layer
│   │   ├── api/                  # Typed FastAPI Client SDK
│   │   │   ├── client.ts         # ApiClient class (baseUrl resolution, JWT injection)
│   │   │   ├── members.ts        # Members endpoints
│   │   │   ├── member-requests.ts# Public registration requests & review endpoints
│   │   │   ├── groups.ts         # Groups endpoints
│   │   │   ├── funds.ts          # Dedicated funds endpoints
│   │   │   ├── sadaqah.ts        # Sadaqah & donation endpoints
│   │   │   ├── loans.ts          # Qard Hasan loan endpoints
│   │   │   ├── dues.ts           # Monthly dues & collection endpoints
│   │   │   ├── grants.ts         # Grants endpoints
│   │   │   ├── campaigns.ts      # Campaigns endpoints
│   │   │   ├── reports.ts        # Financial reports & analytics endpoints
│   │   │   ├── errors.ts         # Standardized API error handler
│   │   │   └── types.ts          # Complete DTO definitions & interfaces
│   │   ├── auth.ts               # NextAuth credentials provider & JWT callbacks
│   │   ├── cloudinary.ts         # Cloudinary SDK image uploader helpers
│   │   ├── format.ts             # Currency, date, and phone number formatters
│   │   └── utils.ts              # Styling helpers (clsx + tailwind-merge)
│   └── proxy.ts                  # Route protection middleware (withAuth)
├── .env.example                  # Environment variable reference template
├── next.config.ts                # Next.js configuration & API reverse proxy rewrites
├── package.json                  # Dependencies & npm scripts
└── tsconfig.json                 # TypeScript strict compiler configuration
```

---

## 4. How the Frontend Works

### Rendering & Execution Model
1. **Server Components (RSC)**: Server-side components fetch initial data via `apiClient` or Server Actions during SSR, reducing client bundle size.
2. **Client Components**: Interactive pages (e.g., dynamic tables, forms, modals, language toggling) use React 19 hooks for responsive UI updates.
3. **Route Protection (`src/proxy.ts`)**: NextAuth middleware intercepts requests to private routes, redirecting unauthenticated users to `/login`.

---

## 5. How it Communicates with the Backend

The frontend contains **no direct database queries or database drivers**. All communication with the backend is strictly over HTTP/HTTPS REST API using standard JSON payloads.

```text
┌────────────────────────────────────────────────────────┐
│                    Next.js Frontend                    │
│                                                        │
│   React UI / Server Action       src/proxy.ts (Auth)   │
│              │                            │            │
│              ▼                            ▼            │
│   src/lib/api/client.ts (ApiClient SDK)                │
│              │                                         │
│              ▼                                         │
│   next.config.ts rewrites: /api/v1/:path*              │
└───────────────────────┬────────────────────────────────┘
                        │
             HTTP / HTTPS (REST API)
              NEXT_PUBLIC_API_URL
          Authorization: Bearer <JWT>
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│                 Python FastAPI Backend                 │
│                 (http://127.0.0.1:8000)                │
└────────────────────────────────────────────────────────┘
```

### 1. Unified `ApiClient` (`src/lib/api/client.ts`)
The `ApiClient` class provides type-safe HTTP methods (`get`, `post`, `put`, `patch`, `delete`):
- **Base URL Resolution**: Automatically uses `process.env.NEXT_PUBLIC_API_URL`.
- **JWT Authorization**: Automatically injects `Authorization: Bearer <token>` from the active NextAuth session.
- **Error Normalization**: Intercepts FastAPI validation errors (`422`) or authentication failures (`401`) and wraps them into typed `ApiResponse<T>` objects.

### 2. Next.js API Proxy Rewrites (`next.config.ts`)
When client components make browser-side requests to `/api/v1/*`, Next.js rewrites and forwards them directly to the FastAPI backend:

```typescript
async rewrites() {
  const internalApi =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.INTERNAL_API_URL ||
    "http://127.0.0.1:8000";
  return [
    {
      source: "/api/v1/:path*",
      destination: `${internalApi}/api/v1/:path*`,
    },
  ];
}
```

### 3. Authentication Flow
- When a user logs in via `/login`, NextAuth's `authorize` function in `src/lib/auth.ts` dispatches credentials to backend `POST /api/v1/auth/login`.
- The FastAPI backend validates credentials against PostgreSQL and returns a signed JWT access token.
- NextAuth stores the token in an encrypted, HTTP-only session cookie.
- All subsequent API requests send this JWT token to FastAPI for RBAC validation.

---

## 6. Required Environment Variables

Create a `.env.local` file in the `/frontend` directory based on `.env.example`:

```env
# =============================================================================
# FastAPI Backend Connection
# =============================================================================
# Base URL of your running FastAPI backend service
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"

# =============================================================================
# NextAuth Configuration
# =============================================================================
# Canonical URL of the frontend application (use your live URL in production)
NEXTAUTH_URL="http://localhost:3000"

# Secure random 32+ character string used to encrypt session tokens
NEXTAUTH_SECRET="change-this-to-a-secure-random-secret-key-at-least-32-chars"

# =============================================================================
# Cloudinary CDN Configuration (Optional - for photo & document attachments)
# =============================================================================
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
CLOUDINARY_FOLDER="foundation-erp"
```

> [!WARNING]
> **No Database Credentials**: Do **NOT** add `DATABASE_URL` to `.env.local`. The frontend never connects directly to PostgreSQL.

---

## 7. Local Installation & Setup

### Prerequisites
- **Node.js**: `v20.x` or higher (LTS recommended)
- **Package Manager**: `npm` (v10+), `pnpm`, or `bun`
- **FastAPI Backend**: Ensure the backend is running (typically on `http://127.0.0.1:8000`).

### Step-by-Step Installation
1. **Navigate to the frontend directory**:
   ```bash
   cd /workspaces/foundation-backend-migration/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   *(Verify that `NEXT_PUBLIC_API_URL` points to your backend instance).*

---

## 8. Development Commands

| Task | Command | Description |
| :--- | :--- | :--- |
| **Start Development Server** | `npm run dev` | Starts Next.js development server on `http://localhost:3000` with hot-reloading |
| **Type Check** | `npm run typecheck` | Runs `tsc --noEmit` to validate all TypeScript types and interfaces |
| **Lint Code** | `npm run lint` | Runs ESLint to verify code quality and coding conventions |

---

## 9. Production Build & Run

### 1. Build the Production Application
```bash
npm run build
```
*This generates the Prisma type definitions and compiles the optimized Next.js production bundle in `.next/`.*

### 2. Start the Production Server
```bash
npm run start
```
*Or specify a custom port:*
```bash
npm run start -- -p 3000
```

---

## 10. How to Connect Frontend to the Backend

### Local Development
1. Start the FastAPI backend on port `8000`:
   ```bash
   cd ../backend && uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
2. In `frontend/.env.local`, set:
   ```env
   NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

### Production Deployment
1. Set `NEXT_PUBLIC_API_URL` in your hosting provider to the public HTTPS URL of your deployed FastAPI backend (e.g., `https://foundation-backend.onrender.com`).
2. Verify that the backend's `CORS_ORIGINS` environment variable includes your frontend domain (e.g., `https://foundation-frontend.vercel.app`).

---

## 11. How to Deploy / Host the Frontend

### Deploying to Vercel (Recommended)
1. Import your GitHub repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. In **Environment Variables**, configure:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com`
   - `NEXTAUTH_URL`: `https://your-frontend-app.vercel.app`
   - `NEXTAUTH_SECRET`: *Generate using `openssl rand -base64 32`*
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
4. Click **Deploy**.

### Deploying to Render (Web Service)
1. Create a new **Web Service** on [Render](https://render.com).
2. Set:
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/`
3. Add the required environment variables in the Render Dashboard.

### Deploying to Linux VPS / PM2
```bash
cd frontend
npm install
npm run build
pm2 start npm --name "foundation-frontend" -- start -- -p 3000
```

---

## 12. Common Troubleshooting

### 1. `FetchError: connect ECONNREFUSED 127.0.0.1:8000`
- **Cause**: The FastAPI backend is not running or the port is mismatched.
- **Fix**: Start the backend service and verify by accessing `http://127.0.0.1:8000/health`.

### 2. Browser CORS Errors (`Access to fetch blocked by CORS policy`)
- **Cause**: The backend's `CORS_ORIGINS` does not allow the frontend origin.
- **Fix**: Update `CORS_ORIGINS` in `backend/.env` to include your frontend URL (e.g. `http://localhost:3000`).

### 3. NextAuth `JWT_SESSION_ERROR` or Login Redirection Loop
- **Cause**: `NEXTAUTH_SECRET` is missing or `NEXTAUTH_URL` does not match the browser's address.
- **Fix**: Ensure `NEXTAUTH_SECRET` is configured with a 32+ character key and `NEXTAUTH_URL` matches your exact domain.

### 4. Build Error: `PrismaClientInitializationError`
- **Cause**: Next.js build executing static generation without generated Prisma types.
- **Fix**: The build script `npm run build` runs `prisma generate && next build` automatically. Ensure dependencies are up to date.

---

## 13. Security Notes

1. **Zero Database Exposure**: The frontend possesses no direct PostgreSQL connection strings, preventing client-side SQL injection.
2. **Encrypted Session Cookies**: NextAuth JWT tokens use HTTP-only, Secure, and SameSite cookie attributes.
3. **Client-Side Sanitization**: All form inputs are validated using strict Zod schemas before submission to backend API routes.
4. **Secret Isolation**: Cloudinary secrets and NextAuth keys remain server-side; only public keys use the `NEXT_PUBLIC_` prefix.

---

## 14. Important Development Notes

- **Next.js 16 Rules**: Follow modern Next.js 16 conventions; use Server Components by default and add `'use client'` only when interactive state, hooks, or DOM listeners are required.
- **Adding New Endpoints**: When creating new backend integrations, add typed request/response interfaces in `src/lib/api/types.ts` and wrap API calls in `src/lib/api/<module>.ts` using `apiClient`.
- **Translations**: When adding UI text, update both `src/i18n/dictionaries/en/` and `src/i18n/dictionaries/bn/` to preserve bilingual support.
