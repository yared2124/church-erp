# Bugfix Requirements Document

## Introduction

Unauthenticated users can navigate directly to the dashboard (and other protected routes) without being challenged for credentials. The authentication middleware exists in `middleware.ts` but its route `matcher` pattern excludes the `/` root path and may not cover all protected routes correctly, allowing the app to serve protected pages to users who have no active session. The fix must ensure every unauthenticated request to a protected route is redirected to `/login`, while authenticated users are routed normally, and the login page itself remains publicly accessible.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an unauthenticated user visits `/dashboard` or any other protected route THEN the system displays the page content without redirecting to `/login`

1.2 WHEN the app first loads with no active session THEN the system renders the dashboard instead of the login page

1.3 WHEN an unauthenticated user navigates directly to a protected sub-route (e.g. `/members`, `/finance`, `/settings`) THEN the system serves the page without requiring authentication

### Expected Behavior (Correct)

2.1 WHEN an unauthenticated user visits `/dashboard` or any other protected route THEN the system SHALL redirect the user to `/login?callbackUrl=<original-path>`

2.2 WHEN the app first loads with no active session THEN the system SHALL display the login page and prompt the user for credentials

2.3 WHEN an unauthenticated user navigates directly to any protected sub-route THEN the system SHALL redirect to `/login` with the original path preserved as `callbackUrl`

### Unchanged Behavior (Regression Prevention)

3.1 WHEN an authenticated user visits `/dashboard` THEN the system SHALL CONTINUE TO display the dashboard without any redirect

3.2 WHEN an authenticated user visits `/login` THEN the system SHALL CONTINUE TO redirect them to `/dashboard`

3.3 WHEN any user (authenticated or not) accesses `/api/auth/*` routes THEN the system SHALL CONTINUE TO allow those requests through without redirection

3.4 WHEN an authenticated user navigates to any protected route THEN the system SHALL CONTINUE TO serve that route normally

3.5 WHEN a user submits valid credentials on the login page THEN the system SHALL CONTINUE TO authenticate and redirect to the `callbackUrl` or `/dashboard`

---

## Bug Condition Pseudocode

**Bug Condition Function** — identifies requests that trigger the bug:

```pascal
FUNCTION isBugCondition(request)
  INPUT: request of type NextRequest
  OUTPUT: boolean

  isProtectedRoute ← NOT request.path.startsWith("/login")
                   AND NOT request.path.startsWith("/api/auth")
  hasNoSession    ← request.auth = null OR request.auth.user = null

  RETURN isProtectedRoute AND hasNoSession
END FUNCTION
```

**Fix Checking Property:**

```pascal
// Property: Fix Checking — unauthenticated requests to protected routes must redirect
FOR ALL request WHERE isBugCondition(request) DO
  result ← middleware'(request)
  ASSERT result.status = 307 OR result.status = 302
  ASSERT result.headers.Location STARTS WITH "/login"
END FOR
```

**Preservation Checking Property:**

```pascal
// Property: Preservation Checking — authenticated requests must not be disrupted
FOR ALL request WHERE NOT isBugCondition(request) DO
  ASSERT middleware(request) = middleware'(request)
END FOR
```
