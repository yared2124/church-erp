import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

interface PageHeaderProps {
  breadcrumb: BreadcrumbItem[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/**
 * Shared header used at the top of every module page (breadcrumb, page
 * title, description, right-aligned actions). Mirrors the Dashboard's
 * page-title typography (32px/700) and action-row spacing.
 */
export function PageHeader({ breadcrumb, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <Breadcrumb items={breadcrumb} className="mb-3" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-text-primary">{title}</h1>
          {description && <p className="mt-1 text-body text-text-secondary">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}
