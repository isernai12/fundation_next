# Foundation ERP — Frontend Application

Modern, responsive web application for the Foundation ERP system built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**. The frontend operates as an independent client application that communicates securely with the standalone Python FastAPI backend over a RESTful HTTP/HTTPS API.

---

## Architecture Overview

The frontend is decoupled from direct database access and follows a pure client-server / SSR architecture:

```text
Browser Client ──► Next.js (App Router / SSR) ──► HTTP / JSON REST API ──► FastAPI Backend ──► PostgreSQL
```

- **Independent Deployment**: Deployable independently to Vercel, Render, Railway, Netlify, or any Node.js hosting service.
- **Unified Backend URL**: Single clean environment variable `NEXT_PUBLIC_API_URL` controls all backend routing.
- **Authentication**: NextAuth.js session management communicating with backend JWT credentials provider.
- **Zero Direct DB Access**: All data operations, validation, transactions, and business logic are delegated to the FastAPI backend.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack support)
- **Language**: TypeScript 5
- **UI & Styling**: Tailwind CSS 4, Radix UI primitives, Lucide React icons, shadcn/ui patterns
- **Data Visualization**: Recharts, Chart.js, react-chartjs-2
- **Forms & Validation**: React Hook Form, Zod
- **Authentication**: NextAuth.js (Credentials Provider + JWT sessions)
- **Media Management**: Cloudinary CDN

---

## Folder Structure

```text
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages and API routes
│   │   ├── (auth)/               # Authentication route group (login, logout)
│   │   ├── (dashboard)/          # Authenticated app shell & feature pages
│   │   │   ├── dashboard/        # Executive overview and statistics
│   │   │   ├── members/          # Member management, requests, dues, ledgers
│   │   │   ├── groups/           # Foundation groups & group ledgers
│   │   │   ├── contributions/    # Monthly contributions & dues collection
│   │   │   ├── loans/            # Qard Hasan (interest-free loans) management
│   │   │   ├── grants/           # Grants and assistance distribution
│   │   │   ├── campaigns/        # Fundraising campaigns
│   │   │   ├── donors/           # Donor directory and Sadaqah collection
│   │   │   ├── settings/         # System settings, roles, audit logs
│   │   │   └── profile/          # User profile & active devices
│   │   ├── api/                  # Frontend Next.js API routes (NextAuth, Cloudinary upload)
│   │   ├── layout.tsx            # Root HTML layout with providers
│   │   └── page.tsx              # Landing / root route
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Radix UI / shadcn primitives (buttons, modals, tables)
│   │   ├── layout/               # Header, Sidebar, Navigation, Breadcrumbs
│   │   └── shared/               # Shared charts, status badges, filters
│   ├── features/                 # Domain-specific modules & components
│   │   ├── members/              # Member forms, lists, ledger modals
│   │   ├── groups/               # Group management components
│   │   ├── contributions/        # Monthly dues collection & ledgers
│   │   ├── loans/                # Loan schedules, repayments, collection
│   │   └── settings/             # Role editor, user permissions
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Core utilities & API layer
│   │   ├── api/                  # Typed FastAPI client SDK
│   │   │   ├── client.ts         # ApiClient class (handles baseUrl, headers, JWT)
│   │   │   ├── members.ts        # Member endpoints API wrapper
│   │   │   ├── groups.ts         # Groups endpoints API wrapper
│   │   │   ├── funds.ts          # Funds endpoints API wrapper
│   │   │   ├── sadaqah.ts        # Sadaqah endpoints API wrapper
│   │   │   ├── loans.ts          # Loans endpoints API wrapper
│   │   │   ├── grants.ts         # Grants endpoints API wrapper
│   │   │   ├── campaigns.ts      # Campaigns endpoints API wrapper
│   │   │   └── types.ts          # DTOs and API response interfaces
│   │   ├── auth.ts               # NextAuth configuration and session callbacks
│   │   ├── cloudinary.ts         # Media upload and CDN helpers
│   │   └── utils.ts              # Formatting, date helpers, cn class utility
│   └── proxy.ts                  # Route protection middleware (withAuth)
├── public/                       # Static assets, logos, and icons
├── .env.example                  # Template environment variables
├── next.config.ts                # Next.js configuration & API rewrites
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## Requirements

- **Node.js**: `v20.x` or higher (LTS recommended)
- **Package Manager**: `npm` (v10+), `pnpm`, or `bun`
- **FastAPI Backend**: Running instance of the Python backend (local or cloud)

---

## Installation & Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment template:
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required values (see [Environment Variables](#environment-variables) below).

---

## Environment Variables

| Variable | Required | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://127.0.0.1:8000` | Base URL of the FastAPI backend. Used by client and SSR to dispatch API requests. |
| `NEXTAUTH_URL` | **Yes** | `http://localhost:3000` | Canonical URL of your Next.js application (must match deployment URL). |
| `NEXTAUTH_SECRET` | **Yes** | *32+ character random string* | Encryption key used by NextAuth to sign session tokens and cookies. |
| `CLOUDINARY_CLOUD_NAME`| Optional | `your_cloud_name` | Cloudinary cloud identifier for document and avatar storage. |
| `CLOUDINARY_API_KEY` | Optional | `your_api_key` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET`| Optional | `your_api_secret` | Cloudinary API secret. |
| `CLOUDINARY_FOLDER` | Optional | `foundation-erp` | Target folder name in Cloudinary media storage. |

> [!IMPORTANT]
> **Database Credentials Notice**: Never add `DATABASE_URL` or PostgreSQL connection strings to the frontend environment. The frontend communicates exclusively with the backend over HTTP/JSON.

---

## Local Development

1. Ensure the FastAPI backend is running on `http://127.0.0.1:8000`.
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Run

1. **Type-check TypeScript**:
   ```bash
   npm run typecheck
   ```

2. **Lint Code**:
   ```bash
   npm run lint
   ```

3. **Compile Production Bundle**:
   ```bash
   npm run build
   ```

4. **Start Production Server**:
   ```bash
   npm run start
   ```

---

## API Configuration & Communication Architecture

### 1. Unified API Client (`src/lib/api/client.ts`)
All API calls from React components, Server Components, and Server Actions pass through `apiClient`:
- Automatically prepends `NEXT_PUBLIC_API_URL`.
- Injects `Authorization: Bearer <token>` when a user session exists.
- Provides standard error handling with structured `ApiResponse<T>` objects.

```typescript
import { apiClient } from "@/lib/api/client";

// Example typed API call
const members = await apiClient.get<MemberListResponse>("/api/v1/members", {
  params: { page: 1, page_size: 20 },
  token: session?.accessToken,
});
```

### 2. Next.js API Rewrites (`next.config.ts`)
In development and production, `/api/v1/:path*` requests can be proxied transparently to the backend:
```typescript
async rewrites() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return [
    {
      source: "/api/v1/:path*",
      destination: `${backendUrl}/api/v1/:path*`,
    },
  ];
}
```

---

## Authentication & Session Flow

1. **User Login**: User submits credentials on `/login`. NextAuth's `authorize()` handler sends an authentication request to `POST /api/v1/auth/login` on the FastAPI backend.
2. **Token Generation**: FastAPI verifies credentials, queries the PostgreSQL database, and returns a JWT access token containing the user's role and permission flags.
3. **Session Persistence**: NextAuth stores the JWT in an encrypted, HTTP-only cookie.
4. **Subsequent Calls**: Client and Server Actions read the session token and pass it as a Bearer token in the `Authorization` header to FastAPI endpoints.
5. **Role-Based Access Control (RBAC)**: NextAuth middleware (`src/proxy.ts`) protects dashboard routes and verifies permissions before rendering.

---

## Deployment Guides

### Deploying to Vercel (Recommended)

1. Connect your repository to **Vercel**.
2. Set **Root Directory** to `frontend`.
3. In **Environment Variables**, set:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com` (your live FastAPI URL)
   - `NEXTAUTH_URL`: `https://your-app.vercel.app`
   - `NEXTAUTH_SECRET`: Generate a secure key using `openssl rand -base64 32`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
4. Deploy!

### Deploying to Render

1. Create a new **Web Service** on Render.
2. Select your repository and set:
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
3. Configure environment variables in the Render Dashboard.

### Deploying to Netlify / Railway

- **Build Command**: `npm run build`
- **Publish Directory**: `.next` (or standalone Node output)
- **Base Directory**: `frontend`

---

## Troubleshooting Common Issues

### 1. `Network Error` or `Failed to Fetch`
- **Cause**: The FastAPI backend is not running or `NEXT_PUBLIC_API_URL` is incorrect.
- **Fix**: Verify backend health by visiting `<BACKEND_URL>/health`. Ensure `NEXT_PUBLIC_API_URL` is set to the correct scheme and host.

### 2. CORS Errors in Browser Console
- **Cause**: The backend `CORS_ORIGINS` setting does not include your frontend origin.
- **Fix**: Add your frontend URL (e.g., `https://your-app.vercel.app`) to the `CORS_ORIGINS` environment variable on the backend service.

### 3. NextAuth `JWT_SESSION_ERROR` or Login Loop
- **Cause**: `NEXTAUTH_SECRET` is missing, or `NEXTAUTH_URL` does not match the browser's address.
- **Fix**: Ensure `NEXTAUTH_SECRET` is defined in production and `NEXTAUTH_URL` matches your exact public domain including `https://`.

---

## Security Considerations

1. **No Database Exposure**: The frontend possesses no database drivers, connection strings, or direct SQL access.
2. **Encrypted Session Cookies**: NextAuth JWT tokens use HTTP-only, SameSite, and Secure flags in production.
3. **Content Security & Sanitization**: All user-provided inputs are validated with Zod schemas before API dispatch.
4. **Secret Isolation**: Cloudinary secrets and NextAuth keys remain server-side; only public keys use the `NEXT_PUBLIC_` prefix.
