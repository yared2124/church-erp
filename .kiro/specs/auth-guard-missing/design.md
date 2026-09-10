# Auth Guard Missing Bugfix Design

## Overview

Unauthenticated users can access protected routes (e.g. `/dashboard`, `/members`) directly without being redirected to `/login`. The root cause is a combination of two issues:

1. The `matcher` pattern in `middleware.ts` uses `/((?!api|_next/static|_next/image|favicon.ico).*)` — this correctly covers `/` and all protected paths, but the **dual-layer guard** (the `authorized` callback in `auth.config.ts` + manual if-checks in the middleware handler) creates a potential conflict where the callback short-circuits before the manual redirect logic can run, depending on NextAuth version behaviour.
2. The `authorized` callback in `auth.config.ts` returns `false` for unauthenticated protected routes, which causes NextAuth to internally redirect rather than allowing the explicit `NextResponse.redirect` in the handler to fire — making callbackUrl preservation unreliable.

The fix consolidates auth guarding into one place: remove the `authorized` callback from `auth.config.ts` (leaving only the minimal edge-safe config) and let `middleware.ts` own all routing decisions exclusively.

## Glossary

- **Bug_Condition (C)**: A request is unauthenticated (`req.auth == null`) AND the path is not a public route (`/login` or `/api/auth/*`)
- **Property (P)**: The middleware SHALL respond with a redirect to `/login?callbackUrl=<path>` for every request satisfying C
- **Preservation**: All authenticated requests, login-page requests, and `/api/auth/*` requests must behave identically before and after the fix
- **middleware**: `middleware.ts` — the Next.js edge middleware that intercepts every request matching the `config.matcher` pattern
- **authorized callback**: The `authorized()` function in `auth.config.ts` that NextAuth calls before invoking the middleware handler; returning `false` triggers NextAuth's own internal redirect rather than the explicit handler logic
- **isLoggedIn**: `!!req.auth` — truthy when a valid JWT session cookie is present in the request

## Bug Details

### Bug Condition

The bug manifests when an unauthenticated user visits any route that is not `/login` or `/api/auth/*`. When the `authorized` callback in `auth.config.ts` returns `false`, NextAuth redirects to `/login` using its own internal mechanism — but this bypass can produce a redirect without the `callbackUrl`, and in some code paths (particularly at the app root `/`) the callback may short-circuit in a way that lets the request through entirely.

**Formal Specification:**
```
FUNCTION isBugCondition(request)
  INPUT: request of type NextRequest (with req.auth populated by NextAuth wrapper)
  OUTPUT: boolean

  isProtectedRoute ← NOT request.nextUrl.pathname.startsWith("/login")
                   AND NOT request.nextUrl.pathname.startsWith("/api/auth")
  hasNoSession    ← request.auth = null OR request.auth.user = null

  RETURN isProtectedRoute AND hasNoSession
END FUNCTION
```

### Examples

- Visiting `http://localhost:3000/` with no session cookie → **Expected**: redirect to `/login?callbackUrl=/`; **Actual**: renders dashboard (or blank page that resolves to dashboard)
- Visiting `http://localhost:3000/dashboard` with no session → **Expected**: redirect to `/login?callbackUrl=/dashboard`; **Actual**: page loads without challenge
- Visiting `http://localhost:3000/members` with no session → **Expected**: redirect to `/login?callbackUrl=/members`; **Actual**: page loads without challenge
- Visiting `http://localhost:3000/login` with no session → **Expected**: login page loads normally; **Actual**: login page loads normally (not affected)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- An authenticated user visiting `/dashboard` or any other protected route must continue to see the page without any redirect
- An authenticated user visiting `/login` must continue to be redirected to `/dashboard`
- Any request (authenticated or not) to `/api/auth/*` must continue to pass through without redirection
- Valid credential submission on `/login` must continue to authenticate the user and redirect to `callbackUrl` or `/dashboard`
- Static assets (`_next/static`, `_next/image`, `favicon.ico`) must continue to be served without auth checks

**Scope:**
All requests that do NOT satisfy `isBugCondition` — i.e. authenticated requests, login-page requests, and API auth requests — must be completely unaffected by this fix.

## Hypothesized Root Cause

Based on the bug description and code analysis:

1. **Dual-layer guard conflict**: `auth.config.ts` defines an `authorized` callback AND `middleware.ts` contains manual if/redirect logic. NextAuth's `auth()` wrapper calls `authorized` first; when it returns `false`, NextAuth may issue its own redirect internally before the handler body runs, bypassing the explicit `NextResponse.redirect` with `callbackUrl`.

2. **authorized callback returns false → implicit redirect**: Returning `false` from `authorized` tells NextAuth to redirect to the `signIn` page, but this redirect does not include the `callbackUrl` search parameter that the manual logic in the handler adds explicitly.

3. **Root path edge case**: The `matcher` regex `/((?!api|_next/static|_next/image|favicon.ico).*)` does match `/`, so the matcher itself is not the problem. The conflict between the two guard layers is the primary cause.

4. **Two sources of truth for routing logic**: Having routing decisions split across `auth.config.ts` and `middleware.ts` makes the behaviour hard to reason about and easy to break — whichever layer fires first wins, and which one fires first depends on NextAuth internals.

## Correctness Properties

Property 1: Bug Condition - Unauthenticated Protected Route Access Redirects to Login

_For any_ request where the bug condition holds (isBugCondition returns true — the user has no session and is accessing a non-public route), the fixed middleware SHALL respond with a redirect (HTTP 307 or 302) whose `Location` header starts with `/login` and includes a `callbackUrl` query parameter equal to the original request path.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Authenticated and Public Route Behavior Unchanged

_For any_ request where the bug condition does NOT hold (isBugCondition returns false — the user is authenticated, or the path is `/login`, or the path starts with `/api/auth`), the fixed middleware SHALL produce exactly the same response as the original middleware, preserving all existing routing behaviour for authenticated users and public routes.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming the dual-layer guard conflict is the root cause:

**File**: `auth.config.ts`

**Specific Changes**:
1. **Remove the `authorized` callback entirely**: Delete the `callbacks: { authorized(...) { ... } }` block. The edge-safe config should only contain `pages` and `providers: []`. All routing decisions live exclusively in `middleware.ts`.

---

**File**: `middleware.ts`

**Specific Changes**:
2. **Verify matcher covers root**: Confirm the existing `/((?!api|_next/static|_next/image|favicon.ico).*)` pattern matches `/`. It does (the negative lookahead only excludes `api`, not the root). No change needed to the matcher.

3. **Keep manual if/redirect logic as the single guard**: The existing handler logic is correct — `isApiAuthRoute` passthrough, unauthenticated redirect with `callbackUrl`, authenticated-on-login-page redirect to `/dashboard`. No changes needed to handler body once the `authorized` callback is removed.

4. **(Optional cleanup)** Remove the `NextResponse.next()` import guard for `isApiAuthRoute` if desired — the `authorized` removal means NextAuth won't double-intercept, but the explicit check is harmless and readable.

### Summary of Net Changes

| File | Change |
|------|--------|
| `auth.config.ts` | Delete the `callbacks` block (remove `authorized` callback) |
| `middleware.ts` | No logic changes required; matcher already covers `/` |

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples on the unfixed code to confirm the root cause, then verify the fix redirects correctly and preserves existing behaviour.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the `authorized` callback is the source of inconsistent redirect behaviour.

**Test Plan**: Write tests that simulate unauthenticated requests to protected routes against the middleware, assert on the redirect response. Run these on the UNFIXED code to observe whether the redirect is missing, missing `callbackUrl`, or otherwise incorrect.

**Test Cases**:
1. **Root path test**: Simulate `GET /` with no session — assert redirect to `/login?callbackUrl=/` (will fail or produce wrong redirect on unfixed code)
2. **Dashboard test**: Simulate `GET /dashboard` with no session — assert HTTP 30x to `/login?callbackUrl=/dashboard` (will fail on unfixed code)
3. **Sub-route test**: Simulate `GET /members` with no session — assert redirect with `callbackUrl=/members` (will fail on unfixed code)
4. **Login page test**: Simulate `GET /login` with no session — assert page is served (no redirect), should pass on both fixed and unfixed

**Expected Counterexamples**:
- Redirect to `/login` without `callbackUrl` parameter (NextAuth's internal redirect ignoring the handler)
- No redirect at all (request passes through to the protected page)
- Possible causes: `authorized` callback fires first and issues implicit redirect, bypassing `callbackUrl` injection

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed middleware produces the expected redirect.

**Pseudocode:**
```
FOR ALL request WHERE isBugCondition(request) DO
  result := middleware_fixed(request)
  ASSERT result.status IN [302, 307]
  ASSERT result.headers["Location"] STARTS WITH "/login"
  ASSERT result.headers["Location"] CONTAINS "callbackUrl=" + request.path
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed middleware produces the same result as the original.

**Pseudocode:**
```
FOR ALL request WHERE NOT isBugCondition(request) DO
  ASSERT middleware_original(request) = middleware_fixed(request)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It automatically generates many combinations of authenticated sessions, paths, and HTTP methods
- It catches edge cases (e.g. paths with query strings, trailing slashes) that manual tests miss
- It provides strong guarantees that no previously-working request is broken by the fix

**Test Plan**: Capture baseline behaviour of authenticated requests and public routes on the UNFIXED code first, then assert the same behaviour after the fix.

**Test Cases**:
1. **Authenticated dashboard access**: Authenticated request to `/dashboard` must receive `NextResponse.next()` (no redirect), both before and after fix
2. **Authenticated login redirect**: Authenticated request to `/login` must receive redirect to `/dashboard`, both before and after fix
3. **API auth passthrough**: Any request to `/api/auth/session` must receive `NextResponse.next()`, both before and after fix
4. **Static asset passthrough**: Requests to `/_next/static/...` must not be intercepted (not matched), both before and after fix

### Unit Tests

- Test `isBugCondition` logic: unauthenticated + protected path → true; authenticated + any path → false; unauthenticated + `/login` → false; unauthenticated + `/api/auth/...` → false
- Test redirect response shape: `Location` header contains `/login`, status is 302 or 307, `callbackUrl` param equals original path
- Test edge cases: path `/` (root), path with query string, path with trailing slash

### Property-Based Tests

- Generate random authenticated session objects with random protected paths — verify the middleware never redirects them
- Generate random unauthenticated requests with random protected paths — verify every response is a redirect to `/login` with the correct `callbackUrl`
- Generate random requests to `/api/auth/*` paths (authenticated or not) — verify all pass through without redirect

### Integration Tests

- Full browser flow: open app with no cookie → assert landing on `/login`; submit valid credentials → assert redirect to `/dashboard`
- Full browser flow: open `/members` directly with no cookie → assert redirect to `/login?callbackUrl=/members`; log in → assert redirect back to `/members`
- Authenticated session flow: log in, navigate to `/dashboard`, `/members`, `/finance` — assert no spurious redirects occur
- Session expiry flow: let JWT expire, attempt to navigate to a protected route — assert redirect to `/login` with correct `callbackUrl`
