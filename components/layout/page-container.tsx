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
    <main className={cn("mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6", className)}>
      {children}
    </main>
  );
}
