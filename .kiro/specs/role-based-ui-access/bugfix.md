# Bugfix Requirements Document

## Introduction

All authenticated users see the identical sidebar navigation and dashboard widgets regardless of their assigned role. The root cause is a mismatch between the shorthand role codes used as filters in `nav-config.ts` (e.g. `"ADMIN"`, `"PRIEST"`, `"CASHIER"`, `"SEBEKA_GUBAE"`) and the full display names stored in the database and carried in the JWT session token (e.g. `"Super Admin"`, `"Priest"`, `"Cashier"`, `"Sebeka Gubae"`). Because no session role string ever matches a nav-config filter string, the sidebar renders every nav item for every user. Compounding this, the Sidebar component never reads the session at all — it renders all items unconditionally — and the dashboard page shows all widgets to every role with no role-aware filtering.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user with role `"Priest"` logs in THEN the system displays the full sidebar including Financial Management, Property & Rentals, Assets & Inventory, Employees, Bulk Import, Audit Logs, Users & Roles, and System Settings, which should be hidden for that role.

1.2 WHEN a user with role `"Cashier"` logs in THEN the system displays nav items such as Members & Families sub-items restricted to ADMIN/PRIEST/SEBEKA_GUBAE, and admin-only sections, because the `roles` arrays in `nav-config.ts` use codes like `"CASHIER"` that never match the session value `"Cashier"`.

1.3 WHEN a user with role `"Sebeka Gubae"` logs in THEN the system displays nav items intended only for `"ADMIN"` (e.g. Audit Logs, Users & Roles, Bulk Import), because the sidebar never filters by role at all.

1.4 WHEN any authenticated user views the dashboard THEN the system displays all KPI widgets (Total Income, Total Expenses, Net Balance), Sacrament Summary, Overdue Rentals, and Pending Approvals regardless of whether the user's role should have access to financial or sacramental data.

1.5 WHEN the Sidebar component renders nav items THEN the system ignores the `roles` array defined on each `NavItem` and `NavChild` in `nav-config.ts`, rendering all items unconditionally.

### Expected Behavior (Correct)

2.1 WHEN a user with role `"Priest"` logs in THEN the system SHALL display only the nav items whose `roles` array includes `"Priest"` (e.g. Dashboard, Members & Families, Sacraments, Certificate Requests, Church History) and SHALL hide all other sections.

2.2 WHEN a user with role `"Cashier"` logs in THEN the system SHALL display only the nav items whose `roles` array includes `"Cashier"` (e.g. Dashboard, Financial Management sub-items, Church History) and SHALL hide sections restricted to other roles.

2.3 WHEN a user with role `"Sebeka Gubae"` logs in THEN the system SHALL display only the nav items whose `roles` array includes `"Sebeka Gubae"` and SHALL hide admin-only sections such as Audit Logs, Users & Roles, and Bulk Import.

2.4 WHEN a user with role `"Super Admin"` logs in THEN the system SHALL display all nav items and all dashboard widgets, as the Super Admin role has unrestricted access.

2.5 WHEN the Sidebar component renders nav items THEN the system SHALL read the current user's roles from the session and SHALL filter `NavItem` and `NavChild` entries so that only items whose `roles` array contains at least one of the user's roles (or items with no `roles` restriction) are rendered.

2.6 WHEN the dashboard page renders for a user whose role does not include financial access THEN the system SHALL hide financial KPI widgets (Total Income, Total Expenses, Net Balance) and the financial charts from that user's view.

2.7 WHEN the dashboard page renders for a user whose role does not include sacramental access THEN the system SHALL hide the Sacrament Summary widget from that user's view.

2.8 WHEN the role filter strings in `nav-config.ts` are compared against session role values THEN the system SHALL use the same full display name format as stored in the database (e.g. `"Super Admin"`, `"Sebeka Gubae"`, `"Priest"`, `"Cashier"`) so that comparisons resolve correctly.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user with role `"Super Admin"` logs in THEN the system SHALL CONTINUE TO display every nav item and every dashboard widget without restriction.

3.2 WHEN a user navigates to a route they have access to THEN the system SHALL CONTINUE TO render that page without error or redirect.

3.3 WHEN the sidebar is collapsed or expanded THEN the system SHALL CONTINUE TO animate the transition and show tooltips on collapsed icon-only items.

3.4 WHEN an active route matches a nav item THEN the system SHALL CONTINUE TO highlight the active item and expand its submenu.

3.5 WHEN a user logs in with valid credentials THEN the system SHALL CONTINUE TO create a JWT session containing the user's full display-name role strings as returned by `auth.ts`.

3.6 WHEN a user with access to a section that has children navigates into it THEN the system SHALL CONTINUE TO render the filtered child links relevant to their role within the open submenu.

3.7 WHEN the dashboard page loads for an authenticated user THEN the system SHALL CONTINUE TO fetch and display all data widgets the user is permitted to see without performance regression.
