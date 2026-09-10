# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Unauthenticated Protected Route Access Redirects to Login
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug (missing redirect or missing `callbackUrl`)
  - **Scoped PBT Approach**: Scope the property to concrete failing cases — unauthenticated requests to `/`, `/dashboard`, and `/members` — to ensure reproducibility
  - Bug Condition (from design): `isBugCondition(request)` is true when `request.auth == null` AND path does NOT start with `/login` AND path does NOT start with `/api/auth`
  - Write a property-based test that, for any path satisfying `isBugCondition`, calls the middleware and asserts:
    - Response status is `302` or `307`
    - `Location` header starts with `/login`
    - `Location` header contains `callbackUrl=<original-path>`
  - Concrete cases to verify: `GET /` with no session, `GET /dashboard` with no session, `GET /members` with no session
  - Run test on **UNFIXED** code (with `authorized` callback still present in `auth.config.ts`)
  - **EXPECTED OUTCOME**: Test FAILS — confirms the bug (NextAuth's internal redirect bypasses `callbackUrl` or passes through entirely)
  - Document counterexamples found (e.g., "GET /dashboard with no session → no redirect" or "redirect to /login without callbackUrl")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Authenticated and Public Route Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Run the **UNFIXED** code with non-buggy inputs (cases where `isBugCondition` returns false)
  - Observe and record actual outputs for each non-buggy case:
    - Observe: authenticated `GET /dashboard` → `NextResponse.next()` (no redirect)
    - Observe: authenticated `GET /login` → redirect to `/dashboard`
    - Observe: unauthenticated `GET /login` → page served normally (no redirect)
    - Observe: any request to `GET /api/auth/session` → passes through without redirect
  - Write property-based tests asserting:
    - For all authenticated requests to protected routes (`!isBugCondition` because `req.auth != null`): response is `NextResponse.next()`, no redirect
    - For authenticated requests to `/login`: response is a redirect to `/dashboard`
    - For any request (authenticated or not) to `/api/auth/*`: response passes through
  - Verify all tests PASS on **UNFIXED** code (this establishes the preservation baseline)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix: Remove `authorized` callback to consolidate auth guarding in `middleware.ts`

  - [ ] 3.1 Implement the fix in `auth.config.ts`
    - Open `auth.config.ts`
    - Delete the entire `callbacks: { authorized({ auth, request }) { ... } }` block
    - The resulting file should contain only `pages: { signIn: "/login" }` and `providers: []`
    - `middleware.ts` requires no changes — its existing handler logic is the sole and correct auth guard
    - _Bug_Condition: `isBugCondition(request)` where `request.auth == null` AND path NOT `/login` AND NOT `/api/auth/*`_
    - _Expected_Behavior: `middleware_fixed(request)` returns `302`/`307` redirect to `/login?callbackUrl=<path>` for all requests satisfying the bug condition_
    - _Preservation: All requests NOT satisfying `isBugCondition` — authenticated requests, `/login` requests, `/api/auth/*` requests — receive the same response as before the fix_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Unauthenticated Protected Route Access Redirects to Login
    - **IMPORTANT**: Re-run the SAME test written in task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior (redirect to `/login?callbackUrl=<path>`)
    - Run bug condition exploration test from step 1 against the **FIXED** code
    - **EXPECTED OUTCOME**: Test PASSES — confirms the `authorized` callback removal allows `middleware.ts` to redirect with correct `callbackUrl`
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Authenticated and Public Route Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests written in task 2 — do NOT write new tests
    - Run preservation property tests from step 2 against the **FIXED** code
    - **EXPECTED OUTCOME**: Tests PASS — confirms no regressions for authenticated users, the login page, and `/api/auth/*` passthrough
    - Confirm all tests still pass after fix (no regressions)

- [ ] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite and confirm both the bug condition test and the preservation tests are green
  - Verify manually (or via integration test) that opening the app with no session redirects to `/login` with the correct `callbackUrl`
  - Ensure all tests pass; ask the user if any questions arise
