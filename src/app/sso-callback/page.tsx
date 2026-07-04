"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace("/onboarding");
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">
      <div className="text-center">
        <p className="text-sm text-slate-400">Finishing sign-in…</p>
      </div>
    </div>
  );
}
