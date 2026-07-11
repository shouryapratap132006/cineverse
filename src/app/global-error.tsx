"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
          <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Critical System Failure</h1>
              <p className="text-sm text-slate-400">
                The projection system encountered a fatal error. Please reload the system.
              </p>
            </div>

            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center w-full gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              Restart System
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
