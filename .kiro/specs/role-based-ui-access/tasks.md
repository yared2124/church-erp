# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Role-Filtered Navigation and Dashboard
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate that all three root causes exist simultaneously
  - **Scoped PBT Approach**: Scope the property to the concrete failing roles: `"Priest"`, `"Cashier"`, `"Sebeka Gubae"` — for each role, render the Sidebar with a mocked `useSession` and assert that only permitted nav items appear
  - Test case A — Priest nav filtering: Mock `useSession` returning `{ data: { user: { roles: ["Priest"] } } }`, render `<Sidebar>`, assert that "Financial Management", "Audit Logs", and "Users & Roles" labels are NOT present in the DOM
  - Test case B — Cashier nav filtering: Mock `useSession` returning `{ data: { user: { roles: ["Cashier"] } } }`, render `<Sidebar>`, assert that "Sacraments", "Property & Rentals", "Employees" are NOT present
  - Test case C — role code mismatch: Assert that `dashboardNavItem.roles` contains `"ADMIN"` (old shorthand) and NOT `"Super Admin"` (display name) — proving the comparison will always be false
  - Test case D — Sebeka Gubae admin items: Mock `useSession` with `roles: ["Sebeka Gubae"]`, render `<Sidebar>`, assert "Audit Logs" and "Users & Roles" are NOT rendered
  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (proves bug exists — Sidebar renders all items for every role, and role strings never match)
  - Document counterexamples found (e.g., "Priest session renders Financial Management", `"PRIEST" !== "Priest"`)
  - Mark task complete when tests are written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Super Admin and Non-Role-Related Behaviors
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: On UNFIXED code, `<Sidebar>` with `roles: ["Super Admin"]` renders every top-level nav label (Dashboard, Members & Families, Sacraments, Financial Management, Property & Rentals, Assets & Inventory, Employees, Certificate Requests, Reports & Analytics, Church History, Bulk Import, Audit Logs, Users & Roles, System Settings)
  - Observe: Collapse toggle click on UNFIXED code still fires `onCollapsedChange` callback; `collapsed` prop correctly switches the sidebar between expanded and icon-only states
  - Observe: On UNFIXED code, navigating to `/sacraments/baptisms` marks the Sacraments item active with `aria-current="page"`
  - Write property-based test: For `"Super Admin"` role, `filterNavItems` (once written) must return all items — i.e. the filtered set equals the full set (from Preservation Requirements §3.1)
  - Write property-based test: For any role in `["Super Admin", "Priest", "Cashier", "Sebeka Gubae", "Property Manager", "Registrar"]`, the filtered nav set is a non-empty subset of or equal to the full nav item set
  - Write unit test: `collapsed` prop change does not alter which items are rendered — only layout changes (from §3.3)
  - Write unit test: Rendering `<Sidebar>` with `roles: []` (empty array) returns no nav items and no runtime error (edge case preservation)
  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS on unfixed code (confirms baseline behaviors to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.3, 3.4_

- [ ] 3. Fix for role-based UI access — nav filtering and dashboard widget gating

  - [ ] 3.1 Update `nav-config.ts` — replace shorthand codes with full display-name role strings
    - Replace `"ADMIN"` → `"Super Admin"` throughout ALL `roles` arrays (parent `NavItem` and every `NavChild`)
    - Replace `"PRIEST"` → `"Priest"` throughout
    - Replace `"CASHIER"` → `"Cashier"` throughout
    - Replace `"SEBEKA_GUBAE"` → `"Sebeka Gubae"` throughout
    - Add `"Property Manager"` to the `roles` arrays of the Property & Rentals `NavItem` and all its `NavChild` entries
    - Add `"Registrar"` to the `roles` arrays of Members & Families parent + Members and Families children, Certificate Requests parent + child, and Bulk Import parent + all children
    - _Bug_Condition: `isBugCondition` — role code strings in nav-config never match session display-name strings, so comparison always returns false_
    - _Expected_Behavior: After this change, `navItem.roles.includes(sessionRole)` resolves correctly for all six role display names_
    - _Preservation: Super Admin must still appear in every `roles` array; no existing role string is removed_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8_

  - [ ] 3.2 Update `sidebar.tsx` — add `useSession` and `filterNavItems` helper
    - Import `useSession` from `"next-auth/react"` (already imported in `app-shell.tsx`; add to `sidebar.tsx`)
    - Add `const { data: session } = useSession()` inside the `Sidebar` function, before the `pathname` call
    - Add `const userRoles: string[] = session?.user?.roles ?? []` derived from the session
    - Implement `filterNavItems(items: NavItem[], userRoles: string[]): NavItem[]`:
      - For each item: include it if `item.roles` is undefined OR `item.roles` has any overlap with `userRoles`
      - For its children: keep only children where `child.roles` is undefined OR `child.roles` overlaps `userRoles`
      - Return items with filtered children
    - Apply `filterNavItems(mainModuleNavItems, userRoles)` before mapping in the Main Modules section
    - Apply `filterNavItems(settingsNavItems, userRoles)` before mapping in the Settings section
    - Apply a single-item check to `dashboardNavItem`: render it only if `dashboardNavItem.roles` is undefined OR has overlap with `userRoles`
    - _Bug_Condition: `isBugCondition` — Sidebar previously rendered all items unconditionally with no session read_
    - _Expected_Behavior: Only items whose `roles` array intersects `userRoles` (or items with no `roles` restriction) are rendered_
    - _Preservation: Collapse/expand props, active-route highlighting, submenu open/close, and Tooltip behavior are all untouched; only the item list passed to `NavEntry` changes_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.3 Update `app/dashboard/page.tsx` — read session and derive role flags
    - Import `auth` from `"@/auth"` (the server-side NextAuth helper already used elsewhere in the project)
    - After the existing `await requireAuth()` call, add `const session = await auth()`
    - Derive role flags:
      ```ts
      const userRoles = session?.user?.roles ?? []
      const hasFinance   = userRoles.some(r => ["Super Admin","Cashier","Sebeka Gubae"].includes(r))
      const hasSacraments = userRoles.some(r => ["Super Admin","Priest"].includes(r))
      ```
    - Wrap financial KPI StatCards (Total Income, Total Expenses, Net Balance) inside `{hasFinance && ...}` — keep Total Members and Sebeka Families Paid visible to all roles
    - Wrap `<IncomeExpenseChart>` and `<RecentTransactions>` inside `{hasFinance && ...}`
    - Wrap `<SacramentSummary>` inside `{hasSacraments && ...}`
    - Leave `<OverdueRentals>`, `<PendingApprovals>`, and `<AnnouncementBanner>` unconditional (visible to all permitted roles)
    - _Bug_Condition: `isBugCondition` — dashboard called `requireAuth()` only (authentication, not authorization) and rendered all widgets unconditionally_
    - _Expected_Behavior: `hasFinance` is `false` for `"Priest"` → financial widgets hidden; `hasSacraments` is `false` for `"Cashier"` → SacramentSummary hidden_
    - _Preservation: `requireAuth()` call unchanged; all data fetching via `dashboardService.overview()` unchanged; Super Admin sees all widgets_
    - _Requirements: 2.4, 2.6, 2.7, 3.1, 3.7_

  - [ ] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Role-Filtered Navigation and Dashboard
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior: Priest session should not render Financial Management; role code mismatch should be gone; Sebeka Gubae should not see Audit Logs
    - Re-run test case A (Priest nav), B (Cashier nav), C (role code check), D (Sebeka Gubae admin items) against the fixed code
    - **EXPECTED OUTCOME**: All four test cases PASS (confirms bug is fixed for all three root causes)
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.8_

  - [ ] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Super Admin and Non-Role-Related Behaviors
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Re-run: Super Admin sees all items; `filterNavItems` for any role returns a subset; collapsed prop does not change rendered items; empty roles array produces no items
    - **EXPECTED OUTCOME**: All preservation tests PASS (confirms no regressions in collapse, highlighting, or Super Admin access)
    - Confirm no TypeScript errors introduced (run `tsc --noEmit`)
    - _Requirements: 3.1, 3.3, 3.4_

- [ ] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite
  - Verify that Property 1 tests (bug condition) all pass — confirming the fix works
  - Verify that Property 2 tests (preservation) all pass — confirming no regressions
  - Verify TypeScript compilation succeeds (`tsc --noEmit`)
  - Ensure all tests pass; ask the user if any questions arise
