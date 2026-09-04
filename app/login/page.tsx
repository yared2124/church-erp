import { Suspense } from "react";
import type { Metadata } from "next";
import { Church } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — Birhane Genet St. Mary Church",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sidebar">
            <Church size={26} className="text-[#C9A24B]" strokeWidth={1.75} />
          </div>
          <h1 className="text-[20px] font-bold text-text-primary">Birhane Genet St. Mary Church</h1>
          <p className="mt-1 text-small text-text-secondary">Sign in to the Church Management System</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
