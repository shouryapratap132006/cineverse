"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCineverseAuth } from "@/components/provider";
import { SignUp as ClerkSignUp } from "@clerk/nextjs";
import { Film, User, Mail, Lock, ShieldCheck } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

const isClerkActive = typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isSignedIn } = useCineverseAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSignedIn) {
      router.push("/onboarding");
    }
  }, [isSignedIn, router]);

  const handleMockSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (!username || username.length < 3) {
        setError("Username must be at least 3 characters.");
        setLoading(false);
        return;
      }
      if (!email.includes("@")) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      signUp(username, email);
      router.push("/onboarding");
    }, 1200);
  };

  const handleSocialBypass = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      const usernameVal = provider === "github" ? "GitHub_Cinephile" : "Google_Cinephile";
      const emailVal = `${usernameVal.toLowerCase()}@cineverse.com`;
      signUp(usernameVal, emailVal);
      router.push("/onboarding");
    }, 800);
  };

  if (isClerkActive) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-6 bg-brand-dark">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-brand-blue/10 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[20%] w-[450px] h-[450px] rounded-full bg-brand-purple/10 blur-[110px]" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center space-x-2.5 mb-2">
              <div className="bg-slate-900 border border-white/10 p-2 rounded-lg text-white">
                <Film className="w-5 h-5 text-brand-purple" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-wider text-white">
                Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Verse</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400">Secure connection powered by Clerk</p>
          </div>
          <GlassCard hoverGlow={false} className="p-1 bg-slate-950/40 border-white/5">
            <ClerkSignUp routing="path" path="/auth/sign-up" signInUrl="/auth/sign-in" forceRedirectUrl="/onboarding" />
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6 bg-brand-dark overflow-hidden">
      {/* Background neon flares */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-brand-blue/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center space-x-2.5 mb-2 group">
            <div className="bg-slate-900 border border-white/10 p-2 rounded-lg text-white">
              <Film className="w-5 h-5 text-brand-purple group-hover:text-brand-blue transition duration-300" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-wider text-white">
              Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Verse</span>
            </span>
          </Link>
          <span className="px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/20 text-[9px] font-bold uppercase tracking-widest">
            Sandbox Registration Bypass
          </span>
        </div>

        {/* Auth Panel Card */}
        <GlassCard hoverGlow={true} className="border-white/10 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="text-xs text-slate-400">Join the ultimate community for cinema lovers</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleMockSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cinephile"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          {/* Social connections */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-x-0 h-[1px] bg-white/5" />
            <span className="relative z-10 px-3 bg-[#0c0f1d] text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Or Sign Up With
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialBypass("google")}
              disabled={loading}
              className="py-2.5 border border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center space-x-2 cursor-pointer active:scale-95 transition"
            >
              <svg className="w-4 h-4 text-rose-400 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.422 2.057 15.6 1 12.24 1 6.002 1 1 6.002 1 12.24s5.002 11.24 11.24 11.24c6.513 0 10.84-4.57 10.84-11.04 0-.74-.08-1.305-.18-1.855H12.24z"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              onClick={() => handleSocialBypass("github")}
              disabled={loading}
              className="py-2.5 border border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center space-x-2 cursor-pointer active:scale-95 transition"
            >
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </GlassCard>

        {/* Footnote Link */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-brand-purple hover:underline font-semibold">
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
}
