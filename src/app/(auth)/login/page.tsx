import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { LoginForm } from "@/modules/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-28 h-72 w-72 rounded-full bg-brand-100 blur-3xl" />
        <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-brand-50 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-4">
        <div className="flex w-full size-12 items-center justify-center rounded-2xl">
          <Sparkles className="size-12 text-brand-600 bg-brand-100 p-2 rounded-2xl" />
        </div>
        <LoginForm />
      </div>
    </section>
  );
}
