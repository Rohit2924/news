<!-- Moved from repository root -> docs -->

This document outlines upgrades and architectural changes made to the News Portal to bring it to production readiness (migrated here for repo organization).

See `docs/FULL_STACK_GUIDE_NOTEPAD.md` and `docs/PROJECT_DOCUMENTATION.md` for detailed information.

### Summary of recent upgrades (Nov 2025)

- Centralized API client (`src/lib/api.ts`) with `apiCall` helper to standardize fetch calls, include credentials, and normalize responses.
- Authentication improvements: `AuthContext` for client-side state; `/api/auth/login` sets `authToken` cookie; `/api/auth/check` verifies cookie; middleware protects `/admin` routes.
- Build/deploy fixes: corrected Page/Document usage to avoid importing `Html` outside document; set `NODE_ENV=production` for Render; recommended enabling build cache.

For implementation details and a step-by-step upgrade checklist, refer to `docs/PROJECT_DOCUMENTATION.md` → **Latest Upgrades (Nov 2025)**.
