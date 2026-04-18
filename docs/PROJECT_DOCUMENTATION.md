<!-- Moved from repository root -> docs -->

<The original project documentation has been moved here.>

Refer to the root README for quick links; this file provides an expanded project overview, folder layout, and environment variables.

## Latest Upgrades (Nov 2025)

This section summarizes the important upgrades and fixes made to the project recently. Additions and references below will help developers get the project to a working state quickly and understand where changes were made.

- Authentication & Authorization
	- Implemented/refined `AuthContext` (client) at `src/context/AuthContext.tsx` for centralized auth state, login/logout, and role-based redirects.
	- Added auth-check API at `/api/auth/check` (server) to verify JWT from httpOnly cookies and return user info.
	- Login API `/api/auth/login` updated to set `authToken` as an httpOnly cookie. Ensure `JWT_SECRET` is set in environment variables.
	- Middleware (`src/middleware.ts`) now protects admin routes under `/admin` by verifying JWT and checking `role==='admin'`.

- API client improvements
	- Added `src/lib/api.ts` with `apiCall<T>` helper. This centralizes fetch logic, sets appropriate headers, includes credentials, and normalizes response shape.
	- Ensure imports use the correct exported name (`apiCall`) and path alias `@/lib/api` (check `tsconfig.json` paths configuration).

- Server & Deployment fixes
	- Fixed build-time error caused by importing `Html` outside of document. Confirm `src/app/layout.tsx` uses `<html>` and `<body>` directly (App Router). Remove any stray `Html` imports.
	- Render deployment notes:
		- Set `NODE_ENV=production` in the Render environment variables to avoid non-standard NODE_ENV warnings.
		- Enable build caching (cache `.next` where supported) to speed rebuilds.
	- See `build.log` in repo root (if present) for recent build failure stack traces and suggested fixes.

- Prisma / Database
	- User model expected to include `role` (default `user`), `password` (hashed), and timestamps. Verify `prisma/schema.prisma` and run `npx prisma migrate` or `npx prisma db push` after changes.

- Admin pages and protection
	- Admin pages under `src/app/admin/*` rely on server cookie auth and client `AuthContext` for role checks.
	- Ensure `AuthProvider` wraps the app at `src/app/layout.tsx` so client components obtain auth state.

- Error handling & UX
	- Standardized API responses under `{ success: boolean, data?, error? }` are used by admin pages. Client pages show error messages and provide retry actions.

## Actionable setup checklist (quick)

1. Add environment variables:
	 - `DATABASE_URL` (Postgres connection)
	 - `JWT_SECRET` (secure random string)
	 - `NODE_ENV=production` (for production deploys)

2. Database:
	 - Run: `npx prisma generate`
	 - Apply schema: `npx prisma db push` (or `npx prisma migrate dev` as appropriate)

3. Local dev start:
	 - `npm install`
	 - `npm run dev`

4. Deployment checks:
	 - Ensure `authToken` cookie is being set by `/api/auth/login` (httpOnly cookie recommended).
	 - Check `src/app/layout.tsx` is App Router compatible (use `<html>` directly — do not import `Html`).
	 - If deploying to Render or similar, set `NODE_ENV=production` and enable build cache.

## Where to look for related code

- Client API helper: `src/lib/api.ts`
- Auth context: `src/context/AuthContext.tsx`
- Middleware: `src/middleware.ts`
- Auth routes: `src/app/api/auth/*`
- Admin pages: `src/app/admin/*`
- Prisma schema: `prisma/schema.prisma`

If you want, I can also annotate the specific code locations with inline comments and add a small troubleshooting section (e.g., "Token not set" / "Middleware redirecting unexpectedly").
