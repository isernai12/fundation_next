# Foundation ERP

## 1. Project Overview
Foundation ERP is a comprehensive, modern enterprise resource planning application tailored for managing the complex operations of a non-profit foundation. 

**Main Modules:**
- **Authentication**: Secure login, session persistence, and role-based access control.
- **Members**: Complete membership management.
- **Groups**: Organize members into structured foundation groups.
- **Beneficiaries**: Track individuals receiving support.
- **Donors**: Manage donor profiles and donation history.
- **Monthly Contributions**: Track recurring membership payments.
- **Campaigns**: Run and manage fund collection campaigns.
- **Loans & Grants**: Disburse and track financial assistance.
- **Ledger**: Centralized financial truth for all transactions.
- **Documents**: Cloud-based document and media management.

**Technology Stack:**
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database Engine**: Turso (libSQL)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS & shadcn/ui components

## 2. Requirements
To run this project, ensure you have the following installed on your machine:
- **Node.js**: Version 18.x or higher
- **Package Manager**: npm or pnpm
- **Version Control**: Git
- **Local Proxy**: Cloudflare Tunnel (optional, for development only if you need to expose your local server)
- **Hosting**: Vercel Account (for production deployment)

## 3. Installation
Follow these step-by-step commands to set up the project locally:

```bash
# 1. Clone the repository
git clone <repository_url>
cd foundation_next

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy the example env file and fill in your details (see section 4)
cp .env.example .env

# 4. Generate the Prisma Client
npx prisma generate

# 5. Run migrations to initialize your Turso (libSQL) database
npx prisma migrate dev

# 6. Seed the default System Administrator account
npx tsx create-admin.ts

# 7. Start the development server
npm run dev
```

## 4. Environment Variables
You must configure the following variables in your `.env` file for the application to function correctly.

```env
TURSO_DATABASE_URL="libsql://your-database-name.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

- **`TURSO_DATABASE_URL`**: The connection string for your Turso database.
- **`TURSO_AUTH_TOKEN`**: The authentication token for your Turso database.
- **`DATABASE_URL`**: Set this to "file:./dev.db" to pass Prisma validation.
- **`NEXTAUTH_URL`**: The canonical URL of your site (use `http://localhost:3000` for local development).
- **`NEXTAUTH_SECRET`**: A random 32+ character string used to encrypt NextAuth JWT session cookies. (Generate via `openssl rand -base64 32`).
- **`CLOUDINARY_*`**: Credentials for the Cloudinary API, used to upload and serve member photos and module documents.

## 5. Turso Setup
To configure the libSQL database from scratch:

1. Log in to [Turso](https://turso.tech/) and create a new database.
2. Copy the database URL and create an auth token using the Turso CLI: `turso db tokens create <db-name>`.
3. Paste the URL into `TURSO_DATABASE_URL` and the token into `TURSO_AUTH_TOKEN` in your `.env` file.
4. Set `DATABASE_URL="file:./dev.db"` in your `.env` file.
5. Generate the migration SQL: `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/schema.sql`
6. Apply the schema to Turso: You can write a small Node script using `@libsql/client` to execute the SQL, or use the Turso CLI: `turso db shell <db-name> < prisma/schema.sql`.
7. Run `npx prisma generate` to update your local Prisma Client.

## 6. Default Admin Account
The system requires at least one System Administrator account to access the dashboard and configure settings.

- **How it is created**: Run the seeder script, which checks for the `SUPER_ADMIN` role and creates the user if it doesn't exist.
- **Seeder Command**: `npx tsx create-admin.ts`
- **Default Credentials**: 
  - Username: `admin`
  - Password: `admin123`
- **How to change**: After logging in, click the Avatar in the top right corner, select `আমার প্রোফাইল` (My Profile), and securely change your password and username from the UI.

## 7. Database Commands
Prisma provides several powerful commands for database management:

- `npx prisma generate`: Rebuilds the TypeScript Prisma Client. Run this every time you modify `schema.prisma` or run `npm install`.
- `npx prisma migrate dev`: Creates a new migration file and applies it to your development database. Use this when you add new tables or alter columns locally.
- `npx prisma migrate deploy`: Applies all pending migrations. **Use this exclusively in production** (e.g., during Vercel builds) as it does not reset the database.
- `npx prisma db push`: Pushes the current schema state directly to the database without creating migration history. (Use with caution; mostly for rapid prototyping).
- `npx prisma studio`: Launches a local web-based GUI at `http://localhost:5555` to view, edit, and delete database records manually.
- `npx prisma db seed`: Executes the database seed script defined in your `package.json`.

## 8. Running Development
To start the local Next.js development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

**Cloudflare Tunnel:**
If you need to expose your local development environment to the public internet (e.g., for testing webhooks or sharing progress), you can use Cloudflare Tunnel:
```bash
cloudflared tunnel --url http://localhost:3000
```
This generates a secure, temporary `https://*.trycloudflare.com` URL that tunnels directly to your local Next.js instance.

## 9. Git Workflow
Before deploying to production, follow this standard Git workflow to ensure your changes are safely committed:

```bash
# 1. Check which files have been modified
git status

# 2. Stage all changes
git add .

# 3. Commit with a descriptive message
git commit -m "feat: implemented group ledger module"

# 4. Push to the remote repository
git push origin main
```

## 10. Deploy to Vercel
Vercel is the recommended hosting provider for Next.js applications. Follow these steps to deploy:

1. **Connect GitHub**: Log in to Vercel, click **Add New...** -> **Project**, and authorize Vercel to access your GitHub account.
2. **Import Project**: Select the `foundation_next` repository and click **Import**.
3. **Configure Environment Variables**: Expand the "Environment Variables" section before deploying and add:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `DATABASE_URL="file:./dev.db"`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (Set this to your production Vercel domain, e.g., `https://my-foundation.vercel.app`)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. **Deploy**: Click the **Deploy** button. Vercel will build the Next.js application.
5. **Run Production Migration**: To ensure the production Turso database matches your schema, you must configure the build script in `package.json` to run migrations automatically during deployment:
   ```json
   "scripts": {
     "build": "prisma generate && prisma migrate deploy && next build"
   }
   ```
   *(If not configured in `package.json`, you must run `npx prisma migrate deploy` manually against your production database).*

## 11. Common Problems

- **Login loop (Redirects back to login after success)**: 
  - *Cause*: NextAuth uses `jti` internally as a reserved claim and will aggressively overwrite manual assignments during JSON Web Encryption, causing database session lookups to fail. 
  - *Fix*: Map the custom database session UUID to `sessionId` in the JWT token instead of fighting NextAuth for control over the `jti` claim.
- **Foundation not found**: 
  - *Cause*: The database was reset or freshly migrated, and the required root Foundation record doesn't exist.
  - *Fix*: The application is designed to auto-heal. Creating a Group triggers `src/features/groups/actions.ts` to automatically generate the `Main Foundation` record if it detects the table is empty.
- **Prisma client mismatch**: 
  - *Cause*: Switching database engines (e.g., SQLite to PostgreSQL) leaves stale artifacts. 
  - *Fix*: Run `rm -rf .next node_modules/.prisma`, then run `npx prisma generate` and restart the dev server.
- **Migration errors**: 
  - *Cause*: Manually editing `.sql` migration files or the database schema directly in Supabase.
  - *Fix*: Never alter the database directly. Always apply changes via `prisma migrate dev`.
- **Session errors & NextAuth redirect issues**: 
  - *Cause*: Misconfigured `NEXTAUTH_URL` or an expired `NEXTAUTH_SECRET`. 
  - *Fix*: Clear browser cookies and ensure `NEXTAUTH_URL` perfectly matches your active domain.
- **Turso connection problems**: 
  - *Cause*: Invalid URL or expired auth token. 
  - *Fix*: Ensure your `TURSO_DATABASE_URL` starts with `libsql://` or `https://` and the `TURSO_AUTH_TOKEN` is correct and not expired.
- **Hydration errors**: 
  - *Cause*: Server-rendered HTML doesn't match the Client HTML (e.g., rendering `Date.now()` directly in a component). 
  - *Fix*: Use `useEffect` to render client-specific data or suppress hydration warnings on specific tags.

## 12. Backup & Restore
- **Backup**: The safest way to backup is using the Turso CLI to dump the database:
  ```bash
  turso db shell <db-name> .dump > backup.sql
  ```
- **Restore**: To restore, use `turso db shell` to execute the dump against a fresh Turso instance.
- **Safe Migration**: Never drop tables to fix schema issues in production. Always create incremental Prisma migrations (`prisma migrate dev`) to alter tables safely without destroying user data.

## 13. Project Structure
- **`src/app/`**: Next.js App Router. Contains page definitions, layouts, global CSS, and API routes.
- **`src/components/`**: Shared, reusable UI components (Buttons, Inputs, Modals, Shadcn UI library).
- **`src/features/`**: Domain-driven feature folders. Each module (Members, Groups, Loans, Donors) encapsulates its own `actions.ts`, `components/`, and `schema.ts`.
- **`src/lib/`**: Core utilities, Prisma client instantiation, NextAuth configurations, and formatting helpers.
- **`prisma/`**: Contains `schema.prisma` and the chronological `/migrations` history folder.
- **`public/`**: Static assets like logos, images, and fonts served at the root path.
- **`scripts/`**: Development and administration scripts (e.g., `create-admin.ts`, database seeders).

## 14. Future Development
This application is designed to be highly extensible. As the foundation grows, the database schema will continue evolving as new ERP modules are added. 

**Critical Rule:** All schema changes MUST be executed exclusively through Prisma migrations (`npx prisma migrate dev`). You must never manually alter the database schema using the Turso Dashboard or direct SQL queries, as this will irreparably break Prisma's synchronization and deployment pipeline.
