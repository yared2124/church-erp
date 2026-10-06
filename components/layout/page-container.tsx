import { cn } from "@/lib/utils";

/** Consistent max-width + padding wrapper for every module page. */
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1360px] px-3 py-2.5 sm:px-4 sm:py-3", className)}>
      {children}
    </div>
  );
}
