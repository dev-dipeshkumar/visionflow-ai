---
Task ID: 4
Agent: main
Task: Implement HTTP-only Cookie Session Auth for VisionFlow AI

Work Log:
- Explored entire auth system: 12 API routes, Prisma Session model, Zustand store, login/signup UI, header signOut
- Identified critical security issues: session tokens created but never used, userId trusted from request body/headers/params, no cookie-based auth, no session persistence across page refreshes
- Created src/lib/auth.ts with getAuthUser(), setSessionCookie(), clearSessionCookie(), unauthenticated(), unauthorized()
- Updated /api/auth/login to set HTTP-only cookie (httpOnly, secure in prod, sameSite=lax, path=/, 30-day expiry)
- Updated /api/auth/signup to auto-create session and set cookie (auto-login on signup)
- Updated /api/auth/logout to read session token from cookie, delete only the current session (not all sessions), clear cookie
- Updated /api/auth/verify to use getAuthUser() from cookie instead of body userId
- Updated /api/billing/subscription GET to use session-based auth (no query param userId)
- Updated /api/billing/subscription POST to derive userId from session, enforce owner/admin role check
- Updated /api/billing/invoices to use session-based auth (no query param userId)
- Updated /api/users to use session-based auth instead of x-user-id header
- Updated /api/chat to require session auth, include user context in AI system prompt
- Updated login-page.tsx to map plan/workspace/subscriptionStatus from response, updated security notice
- Updated signup-page.tsx to map plan/workspace/subscriptionStatus from response, updated security notice
- Updated billing-page.tsx to fetch subscription without userId query param (use session cookie)
- Updated invoices-page.tsx to fetch invoices without userId query param (use session cookie)
- Updated pricing-page.tsx to send only newPlan in body (userId derived from session)
- Updated chat-page.tsx to include credentials:'same-origin', handle 401 auth errors
- Updated store.ts: signOut now async, calls /api/auth/logout API, added isRestoringSession state
- Updated page.tsx: added session restore on mount via /api/auth/verify, shows loading spinner during restore
- Build passed with zero errors, server restarted

Stage Summary:
- VisionFlow AI now uses production-grade HTTP-only cookie session auth
- All protected API routes derive userId from verified session cookie (not request body/headers/params)
- Session cookies: httpOnly, secure in production, sameSite=lax, path=/, 30-day expiry
- Signup auto-creates session (auto-login)
- Logout invalidates server session and clears cookie
- Session persistence: page refresh restores session via cookie-based verify
- Role/plan enforcement added to billing/subscription POST (owner/admin only)
- Tenant isolation enforced: all data queries use tenantId from authenticated user's session
