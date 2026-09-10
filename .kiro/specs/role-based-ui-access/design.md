# Role-Based UI Access Bugfix Design

## Overview

All authenticated users currently see the full sidebar and all dashboard widgets, regardless of their role. The fix has three distinct surfaces:

1. **`nav-config.ts`** — role filter strings use shorthand codes (`"ADMIN"`, `"PRIEST"`, etc.) that never match the full display-name strings returned by the session (`"Super Admin"`, `"Priest"`, etc.).
2. **`sidebar.tsx`** — the `Sidebar` component and its `NavEntry` helper never read `session.user.roles`; they render all `NavItem` and `NavChild` entries unconditionally.
3. **`app/dashboard/page.tsx`** — the dashboard page is a Server Component that calls `requireAuth()` for authentication but never checks the user's role before rendering widgets.

The fix is targeted and minimal: align the role strings in `nav-config.ts` with the actual DB values, add role filtering inside the `Sidebar` component using `useSession`, and add role-aware conditional rendering inside the dashboard page using the server-side `auth()` helper.

---

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — the three root causes above acting together cause every user to see the same, unfiltered UI.
- **Property (P)**: The desired behavior — a user sees only the sidebar items and dashboard widgets that their role permits.
- **Preservation**: Existing behaviors (sidebar collapse, active-route highlighting, JWT session creation, `requireAuth`/`requireRole` API guards) that must remain unchanged by the fix.
- **`NavItem` / `NavChild`**: Types in `nav-config.ts` whose optional `roles?: string[]` array lists which roles may see that item.
- **`session.user.roles`**: The array of full display-name role strings (`["Super Admin"]`, `["Priest"]`, etc.) stored in the JWT and surfaced by `useSession()` on the client or `auth()` on the server.
- **`isBugCondition(input)`**: Pseudocode predicate — returns `true` when the rendered nav/dashboard content does not match what the user's role permits.

---

## Bug Details

### Bug Condition

The bug manifests on every page render for every authenticated non-Super-Admin user. The three root causes compound each other: even if the Sidebar were fixed to filter by role, the role strings in `nav-config.ts` would never match, so the filter would hide everything instead of the right subset.

**Formal Specification:**
```
FUNCTION isBugCondition(userRoles, renderedNavItems, renderedWidgets)
  INPUT:
    userRoles         — string[]  (from session.user.roles, e.g. ["Priest"])
    renderedNavItems  — string[]  (hrefs of nav items actually rendered)
    renderedWidgets   — string[]  (widget IDs actually rendered on dashboard)
  OUTPUT: boolean

  permittedNavItems  := getPermittedNavItems(userRoles)   // using corrected role strings
  permittedWidgets   := getPermittedWidgets(userRoles)

  RETURN renderedNavItems  ≠ permittedNavItems
      OR renderedWidgets   ≠ permittedWidgets
END FUNCTION
```

### Examples

| User Role | Current (Buggy) Behavior | Expected Correct Behavior |
|---|---|---|
| `"Priest"` | Sees Financial Management, Audit Logs, Users & Roles, Bulk Import | Sees only Members & Families, Sacraments, Certificate Requests, Church History |
| `"Cashier"` | Sees full sidebar including Property, Inventory, Employees | Sees only Financial Management (subset), Church History |
| `"Sebeka Gubae"` | Sees Audit Logs, Users & Roles, System Settings | Sees Members, Finance (subset), Property, Employees, Reports, History |
| `"Property Manager"` | Sees all items (no `"PROPERTY_MANAGER"` code exists in config) | Sees only Property & Rentals |
| `"Registrar"` | Sees all items (no `"REGISTRAR"` code exists in config) | Sees only Members & Families, Certificate Requests, Bulk Import |
| `"Super Admin"` | Sees everything | Sees everything (no change) |
| Dashboard — `"Priest"` | Sees Total Income, Total Expenses, Net Balance, financial chart | Does NOT see financial KPI widgets or financial chart |
| Dashboard — `"Cashier"` | Sees Sacrament Summary widget | Does NOT see Sacrament Summary widget |

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Mouse clicks on nav links must continue to navigate correctly.
- The sidebar collapse/expand animation and tooltip-on-icon behavior must remain unchanged.
- Active-route highlighting and submenu auto-open for the current path must remain unchanged.
- The `requireAuth()` and `requireRole()` API-layer guards must remain unchanged — this fix is UI-only.
- The JWT session creation in `auth.ts` including the `session.user.roles` array must remain unchanged.
- A `"Super Admin"` user must continue to see every nav item and every dashboard widget.

**Scope:**
All inputs that do NOT involve a role mismatch — i.e. Super Admin sessions, and all non-role-related interactions (clicking, collapsing, navigating) — must be completely unaffected by this fix.

---

## Hypothesized Root Cause

1. **Shorthand code vs. display-name mismatch in `nav-config.ts`**: Every `roles` array uses codes like `"ADMIN"`, `"PRIEST"`, `"CASHIER"`, `"SEBEKA_GUBAE"`. The JWT carries full display names (`"Super Admin"`, `"Priest"`, `"Cashier"`, `"Sebeka Gubae"`). The comparison `userRoles.includes(navItem.roles[i])` is always `false`, so even a correctly filtering Sidebar would hide everything.

2. **Sidebar never reads the session**: `sidebar.tsx` imports and renders `dashboardNavItem`, `mainModuleNavItems`, and `settingsNavItems` directly with no call to `useSession()`. There is no filtering step whatsoever.

3. **Dashboard is unaware of the user's role**: `app/dashboard/page.tsx` calls `requireAuth()` (authentication only) and then renders all widgets inside fixed JSX with no conditional based on `session.user.roles`.

4. **Missing role codes for new roles**: `"Property Manager"` and `"Registrar"` have no corresponding shorthand codes in the current `nav-config.ts`, so fixing just the mismatch is not enough — the role lists must be extended.

---

## Correctness Properties

Property 1: Bug Condition — Role-Filtered Navigation and Dashboard

_For any_ authenticated session where `isBugCondition` returns `true` (the user is not a Super Admin and the current render includes items their role does not permit), the fixed system SHALL render only the `NavItem` and `NavChild` entries whose `roles` array contains at least one of the user's session roles, and SHALL render only the dashboard widgets the user's role permits.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8**

Property 2: Preservation — Non-Buggy Inputs Unchanged

_For any_ authenticated session where `isBugCondition` returns `false` (Super Admin, or non-role-related interactions such as collapsing the sidebar, clicking a permitted link, or navigating to an accessible route), the fixed system SHALL produce exactly the same behavior as the original system, preserving sidebar animation, active-route highlighting, session creation, and API-layer authorization guards.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

---

## Fix Implementation

### Changes Required

#### File: `components/layout/nav-config.ts`

**Change 1 — Align role strings with DB display names and add missing roles:**

Replace all shorthand role codes with full display-name strings. Extend every `roles` array that previously covered `"ADMIN"` to also cover `"Super Admin"`, add `"Property Manager"` to Property & Rentals items, and add `"Registrar"` to Members, Certificate Requests, and Bulk Import items.

Role mapping:
| Old code | New display name |
|---|---|
| `"ADMIN"` | `"Super Admin"` |
| `"PRIEST"` | `"Priest"` |
| `"CASHIER"` | `"Cashier"` |
| `"SEBEKA_GUBAE"` | `"Sebeka Gubae"` |
| *(missing)* | `"Property Manager"` |
| *(missing)* | `"Registrar"` |

Specific access per role derived from the requirements:
- **Super Admin** — all items.
- **Priest** — Members & Families (Members, Families children), Sacraments (all), Certificate Requests, Church History.
- **Cashier** — Financial Management (Overview, Transactions, Sebeka Payments, Income, Expenses, Reports), Church History.
- **Sebeka Gubae** — Members & Families (Members, Families, Family Payments), Financial Management (Overview, Sebeka Payments, Reports), Property & Rentals (all), Assets & Inventory (most), Employees (most), Reports & Analytics, Church History.
- **Property Manager** — Property & Rentals (all children).
- **Registrar** — Members & Families (Members, Families), Certificate Requests, Bulk Import.

#### File: `components/layout/sidebar.tsx`

**Change 2 — Read session roles inside `Sidebar`:**

Add `const { data: session } = useSession()` inside the `Sidebar` function to obtain `userRoles: string[]`.

**Change 3 — Filter `NavItem` entries before rendering:**

Define a `filterNavItems(items: NavItem[], userRoles: string[]): NavItem[]` helper:
```
FUNCTION filterNavItems(items, userRoles)
  FOR EACH item IN items
    IF item.roles is undefined OR item.roles intersects userRoles
      filteredChildren := filterChildren(item.children, userRoles)
      YIELD { ...item, children: filteredChildren }
    END IF
  END FOR
END FUNCTION

FUNCTION filterChildren(children, userRoles)
  IF children is undefined THEN RETURN undefined
  RETURN children WHERE (child.roles is undefined OR child.roles intersects userRoles)
END FUNCTION
```

Apply `filterNavItems` to `mainModuleNavItems` and `settingsNavItems`, and apply the same single-item check to `dashboardNavItem` before rendering each section.

#### File: `app/dashboard/page.tsx`

**Change 4 — Read session and derive role flags:**

Convert the page to use the server-side `auth()` helper (already available in the project via `@/auth`) to obtain `session.user.roles` after the existing `requireAuth()` call.

Derive boolean flags:
```
const userRoles = session.user.roles  // string[]
const isAdmin     = userRoles.includes("Super Admin")
const hasFinance  = userRoles.some(r => ["Super Admin","Cashier","Sebeka Gubae"].includes(r))
const hasSacraments = userRoles.some(r => ["Super Admin","Priest"].includes(r))
```

**Change 5 — Conditionally render dashboard widgets:**

Wrap financial KPI cards, the `IncomeExpenseChart`, and `RecentTransactions` inside `{hasFinance && ...}`.
Wrap `SacramentSummary` inside `{hasSacraments && ...}`.
`OverdueRentals`, `PendingApprovals`, and `AnnouncementBanner` remain visible to all permitted roles that can reach the dashboard.

---

## Testing Strategy

### Validation Approach

Two-phase: first run exploratory tests against the **unfixed** code to confirm and observe the bug, then verify the fix with unit and property-based tests.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm root causes 1–3.

**Test Plan**: Render `<Sidebar>` with a mocked `useSession` returning `{ roles: ["Priest"] }` and assert that only the Priest-permitted nav items appear. Run against unfixed code — all items will appear, confirming root cause 2. Also verify that `"PRIEST"` !== `"Priest"` (string equality check) to confirm root cause 1.

**Test Cases**:
1. **Priest role — nav filtering** (will fail on unfixed code): Mock session with `roles: ["Priest"]`, render Sidebar, assert Financial Management is NOT in the DOM.
2. **Cashier role — nav filtering** (will fail on unfixed code): Mock session with `roles: ["Cashier"]`, render Sidebar, assert Sacraments section is NOT rendered.
3. **Sebeka Gubae — admin items hidden** (will fail on unfixed code): Mock session with `roles: ["Sebeka Gubae"]`, render Sidebar, assert Audit Logs and Users & Roles are NOT rendered.
4. **Role code mismatch** (will fail on unfixed code): Assert `navConfigRoles.includes("Priest")` where `navConfigRoles = dashboardNavItem.roles` — this will be `false` for the old `"ADMIN"/"PRIEST"` codes.
5. **Dashboard financial widgets — Priest** (will fail on unfixed code): Render `DashboardPage` with a mocked session for Priest, assert Total Income `<StatCard>` is NOT present.

**Expected Counterexamples**:
- All nav items render for every mocked non-admin role — confirming the Sidebar does no filtering.
- Role code strings like `"PRIEST"` never appear in `session.user.roles`.

---

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed system renders only role-permitted items.

**Pseudocode:**
```
FOR ALL userRole IN ["Priest", "Cashier", "Sebeka Gubae", "Property Manager", "Registrar"] DO
  session := { user: { roles: [userRole] } }
  renderedNavItems := renderSidebar(session)
  renderedWidgets  := renderDashboard(session)
  ASSERT isBugCondition(session.user.roles, renderedNavItems, renderedWidgets) = false
END FOR
```

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (Super Admin, and non-role-related interactions), behavior is unchanged.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalSystem(input) = fixedSystem(input)
END FOR
```

**Testing Approach**: Property-based testing generates many role combinations and interaction states automatically, catching edge cases like a user with multiple roles or an empty roles array.

**Test Cases**:
1. **Super Admin — all items visible**: Render Sidebar with `roles: ["Super Admin"]`, assert every top-level nav label is present.
2. **Collapse toggle preservation**: Render Sidebar and toggle collapse, assert animation classes are unchanged.
3. **Active-route highlighting**: Navigate to `/sacraments/baptisms` with a Priest session, assert that the Sacraments item has the `bg-sidebar-active` class.
4. **Empty roles array**: Render Sidebar with `roles: []`, assert no nav items render and no runtime error occurs.

---

### Unit Tests

- Test `filterNavItems(mainModuleNavItems, ["Priest"])` returns only Members & Families, Sacraments, Certificate Requests, Church History.
- Test `filterNavItems(settingsNavItems, ["Priest"])` returns an empty array.
- Test `filterNavItems(mainModuleNavItems, ["Super Admin"])` returns all items.
- Test child filtering: `filterNavItems` with `["Cashier"]` on the Members & Families item returns only the Family Payments child.
- Test dashboard role flags: `hasFinance` is `true` for `["Cashier"]`, `false` for `["Priest"]`.
- Test dashboard role flags: `hasSacraments` is `true` for `["Priest"]`, `false` for `["Cashier"]`.

### Property-Based Tests

- For any role in `["Super Admin", "Priest", "Cashier", "Sebeka Gubae", "Property Manager", "Registrar"]`, the filtered nav item set is a subset of (or equal to) all nav items.
- For any two distinct non-admin roles, their filtered nav sets differ.
- For `"Super Admin"`, the filtered nav set equals the full nav set.
- For any role, the `roles` array on every rendered `NavItem` includes that role (or the item has no `roles` restriction).

### Integration Tests

- Full render of `AppShell` with a live (mocked) NextAuth session for `"Priest"`: assert Financial Management, Audit Logs, and Users & Roles are absent from the rendered sidebar.
- Full render of `AppShell` for `"Cashier"`: assert Sacraments, Property, Inventory, and Employees sections are absent.
- Dashboard page for `"Priest"`: assert Total Income, Total Expenses, Net Balance StatCards and IncomeExpenseChart are not rendered; assert SacramentSummary is rendered.
- Dashboard page for `"Cashier"`: assert financial KPI cards are rendered; assert SacramentSummary is not rendered.
- Sidebar collapse/expand for `"Priest"`: assert the collapsed state still shows only Priest-permitted icon tooltips.
