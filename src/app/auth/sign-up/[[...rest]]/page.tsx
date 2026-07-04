import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Film } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative p-6 bg-brand-dark overflow-hidden">
      {/* Background neon flares */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-brand-blue/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] flex flex-col items-center space-y-8">
        
        {/* Brand Header */}
        <Link href="/" className="flex flex-col items-center group">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="bg-slate-900 border border-white/10 p-2 rounded-lg text-white">
              <Film className="w-5 h-5 text-brand-purple group-hover:text-brand-blue transition duration-300" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-wider text-white">
              Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Verse</span>
            </span>
          </div>
        </Link>

        {/* Clerk Sign Up Component */}
        <SignUp signInUrl="/auth/sign-in" forceRedirectUrl="/onboarding" />
      </div>
    </div>
  );
}
