"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Technical Difficulties</h1>
          <p className="text-sm text-slate-400">
            The projector jammed. An unexpected error occurred while loading this page.
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center w-full gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
          Restart Projector
        </button>
      </div>
    </div>
  );
}
