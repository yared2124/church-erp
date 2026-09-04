# Birhane Genet St. Mary Church — Management ERP

Next.js 16 (App Router) + TypeScript + Tailwind CSS. This is the first
module: the **Dashboard**, built to establish the design system that every
later module (Members, Sacraments, Finance, Property, etc.) will reuse.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/dashboard`.

## Design system

Every token lives in `tailwind.config.ts`. Never hardcode a color, radius,
shadow, or spacing value in a component — extend the theme instead.

| Token group | Where |
|---|---|
| Colors (primary, sidebar, semantic, text, border) | `tailwind.config.ts` → `theme.extend.colors` |
| Typography scale | `tailwind.config.ts` → `theme.extend.fontSize` |
| Spacing (8px system) | `tailwind.config.ts` → `theme.extend.spacing` |
| Radius | `tailwind.config.ts` → `theme.extend.borderRadius` (sm 6px / md 8px / lg 12px / xl 16px) |
| Shadows | `tailwind.config.ts` → `theme.extend.boxShadow` (card / elevated / modal) |
| Fonts | `app/layout.tsx` (Inter for Latin, Noto Sans Ethiopic for Amharic, via `next/font`) |

## Component architecture

```
components/
  ui/            Button, Card, Input/Select/Search/Textarea/Checkbox/Radio/Switch,
                 Badge, Table, Tooltip, Skeleton, EmptyState/ErrorState
  layout/        Sidebar, Header, AppShell, PageContainer, nav-config
  dashboard/     KpiCard, IncomeExpenseChart, RecentTransactions,
                 SacramentSummary, OverdueRentals, PendingApprovals,
                 AnnouncementBanner, DashboardHeader
data/
  mock-data.ts   All sample data for the dashboard, typed and centralized
```

Rule of thumb: if two pages need the same button or card, they import the
same component from `components/ui`. If something looks inconsistent, fix
the shared component — don't add a one-off style in a page.

## What's implemented in this pass

- Full design-token system wired into Tailwind (colors, type, spacing, radius, shadow)
- Sidebar: desktop, collapsed (with tooltips), and mobile drawer states; active/hover states
- Header: search, notifications badge, calendar/mail icons, profile menu
- Dashboard: KPI cards, Income vs Expenses chart (Recharts), Recent Transactions,
  Sacraments summary, Overdue Rentals, Pending Approvals, announcement banner
- Reusable Empty/Error/Skeleton states, ready to wire up once real data loads
- next/font for Inter + Noto Sans Ethiopic so Amharic renders correctly once i18n copy is added

## Not yet implemented (intentionally, per "Dashboard first" scope)

- i18n / translation keys (`t("dashboard.title")`) — copy is still hardcoded English strings;
  next step is introducing `next-intl` or `next-i18next` and moving all strings into locale files
- Other module pages (Members, Sacraments, Finance, Property, etc.) — build these on top of the
  same `components/ui` and `components/layout` primitives
- Dialog, Dropdown, Tabs, Pagination, DatePicker, Toast — referenced in the target architecture
  but not needed by the Dashboard yet; add them to `components/ui` following the same token rules
  when the next module needs them
- Auth/role gating (Cashier vs Sebeka Gubae vs Priest visibility rules)

## Backend setup (Prisma + PostgreSQL + Auth.js)

The frontend no longer talks to a live backend by default in this snapshot —
that integration is in progress. Here's what's built and exactly what to run
to bring it up on your machine (this sandbox can't reach Prisma's binary CDN
or a live Postgres instance, so these steps are unverified beyond a manual
schema review — run them and tell me what breaks):

```bash
cp .env.example .env
# edit .env: set a real DATABASE_URL and generate a real AUTH_SECRET
npx auth secret   # writes a value into .env for you

npm run db:generate   # prisma generate — needs to reach binaries.prisma.sh
npm run db:migrate    # prisma migrate dev — creates all tables from prisma/schema.prisma
npm run db:seed       # loads development fixtures (see prisma/seed.ts)

npm run dev
```

Seeded login (from `prisma/seed.ts`): any of the seeded emails (e.g.
`abba.yohannes@stmarychurch.et`) with password `ChangeMe123!`.

**What's wired up:** every one of the 13 modules (Dashboard, Members & Families,
Sacraments, Financial Management, Property & Rentals, Assets & Inventory,
Employees, Certificate Requests, Reports & Analytics, Church History, Bulk
Import, Audit Logs, Users & Roles, System Settings) now reads from real
PostgreSQL tables through `features/<module>/*.repository.ts` →
`*.service.ts` → `app/api/**/route.ts`, not from mock arrays. The `data/`
directory has been deleted entirely.

- `prisma/schema.prisma` — full relational schema for every module, including
  two tracking tables (`GeneratedReport`, `ImportJob`) added specifically to
  back Reports & Analytics / Bulk Import with real (if initially empty) data
  instead of fabricated numbers
- `auth.config.ts` / `auth.ts` — split Auth.js config (middleware runs on the
  Edge Runtime and cannot load Prisma's engine, so `auth.config.ts` has zero
  DB dependencies and is the only one `middleware.ts` is allowed to import)
- `lib/api-helpers.ts` — `requireAuth()` / `requireRole()` used by every API
  route and every Server Component page, `withErrorHandling()` for
  consistent error responses
- `/login` page + real session in the header + working sign-out
- Every list view (Members, Families, Sacraments, Transactions, Inventory,
  Employees, Certificates, Audit Logs, Users) has real server-side search,
  filtering, and pagination — no "load everything and filter in the browser"
- Audit logging is real: every create/update/archive in Members, Families,
  and Family Payments writes a row to `AuditLog`, which the Audit Logs page
  then reads back
- The Family Payment → ledger link is a real Prisma `$transaction`: paying a
  family's Sebeka creates the `FamilyPayment` row, a matching `Transaction`
  income record, and updates the church's `FinanceAccount` balance
  atomically — exactly the "financial payment" transaction example from the
  spec
- The Dashboard's KPIs, chart, and panels are now live aggregate queries
  across Members/Finance/Certificates/Property/Sacraments — no more
  `data/mock-data.ts` (deleted)

**Honestly scaled down or not implemented** (disclosed here rather than
silently faked):
- **Sidebar sub-pages beyond each module's main list/overview** (e.g.
  `/sacraments/baptisms/new`, `/inventory/items`, `/employees/departments`)
  still don't have real pages — only the screens shown in your uploaded
  designs were built, same as disclosed in the earlier UI-only pass
- **Bulk Import**: the stats (Total Imports, Successful, Failed, Last
  Import) are real, backed by a new `ImportJob` table — but actual CSV/Excel
  parsing and row-by-row import execution is not implemented. Choosing a
  file in the dropzone doesn't process it
- **Reports & Analytics**: "Recent Reports" reads a real `GeneratedReport`
  table (starts empty on a fresh install) — but clicking "Generate Report"
  doesn't actually produce a PDF/Excel file yet
- **System Settings**: only Church Information reads/is meant to write to
  the real `SystemSetting` table (seeded). The other five settings groups
  (System Preferences, Organization, Documents, Email, Session) still show
  sensible defaults with no persistence — saving them doesn't do anything yet
- **Church History**: dropped the Photo Gallery, Oral Histories, and
  Upcoming Commemoration widgets from the original mockup — there's no
  schema for photos/interviews/commemorations, and I chose not to fabricate
  data for them. Timeline and Documents are real
- **Employees**: dropped "Upcoming Birthdays" and "Gender Distribution" —
  `Employee` has no `dateOfBirth` or `gender` field in the schema
- Certificate approval, sacrament editing, and most "Add/Edit" buttons across
  modules still don't submit anywhere — only Members, Families, and Family
  Payments have real Create/Update forms wired to the API

**Verification limits, stated plainly:** this sandbox cannot reach
`binaries.prisma.sh`, so `prisma generate`/`migrate` never ran here. Every
`npx next build` I ran fails with exactly one error class —
`Module '"@prisma/client"' has no exported member 'Prisma'/'PrismaClient'`
— across every file that imports Prisma, which is the direct, mechanical
consequence of the client never being generated. I fixed every other
TypeScript error I found (including two real bugs: a naming collision that
silently overwrote a KPI count with a list, and a stale field name in the
audit log detail panel). Run the commands above on your machine — where
Prisma can actually reach its CDN — and this should build clean; if it
doesn't, the error will be a genuinely new one, not this cascade.

