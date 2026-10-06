import { Suspense } from "react";
import type { Metadata } from "next";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — Chagni Birhane Genet Kidist Ba'ata Lemariyam",
};

export default function LoginPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[420px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-b from-primary/90 to-sidebar shadow-glow-gold">
            <EthiopicCross size={28} variant="gold" />
          </div>
          <h1 className="text-[20px] font-bold text-text-primary text-balance">
            Chagni Birhane Genet Kidist Ba&apos;ata Lemariyam
          </h1>
          <p className="mt-1 font-ethiopic text-[13px] text-text-secondary">
            ቻግኒ ብርሃነ ገነት ቅድስት በዓታ ለማርያም ቤተክርስቲያን
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Card>
    </main>
  );
}
