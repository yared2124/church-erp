import * as React from "react";
import { Inbox, AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

/** Standard empty state for tables and lists — never leave blank white space. */
export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background-alt text-text-muted">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="text-card-title text-text-primary">{title}</p>
        <p className="mt-1 text-small text-text-secondary">{description}</p>
      </div>
      {actionLabel && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

/** Standard error state. Red is reserved for this context only. */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  actionLabel = "Try Again",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-bg text-danger">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <p className="text-card-title text-text-primary">{title}</p>
        <p className="mt-1 text-small text-text-secondary">{description}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
        {actionLabel}
      </Button>
    </div>
  );
}
