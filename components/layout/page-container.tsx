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
    <main className={cn("mx-auto w-full max-w-[1440px] px-3 py-3.5 sm:px-5 sm:py-4", className)}>
      {children}
    </main>
  );
}
