"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20">
            <AlertTriangle className="w-10 h-10 text-brand-purple" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">404 - Not Found</h1>
          <p className="text-sm text-slate-400">
            The cinematic sequence you are looking for has been cut from the final edit.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center w-full gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold hover:opacity-90 transition shadow-lg"
        >
          <Home className="w-4 h-4" />
          Return to Box Office
        </Link>
      </div>
    </div>
  );
}
