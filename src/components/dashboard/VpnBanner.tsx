"use client";

import React, { useEffect, useState } from "react";
import { Shield, X, Wifi, ExternalLink } from "lucide-react";

export default function VpnBanner() {
  const [status, setStatus] = useState<"checking" | "blocked" | "ok" | "dismissed">("checking");

  useEffect(() => {
    const dismissed = sessionStorage.getItem("vpn_banner_dismissed");
    if (dismissed) { setStatus("dismissed"); return; }

    // Probe TMDB with a tiny request — if it fails/times out, TMDB is blocked
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch("https://api.themoviedb.org/3/configuration?api_key=1", {
      signal: controller.signal,
      mode: "no-cors", // avoids CORS error masking the real network failure
    })
      .then(() => setStatus("ok"))
      .catch(() => setStatus("blocked"))
      .finally(() => clearTimeout(timeout));
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("vpn_banner_dismissed", "1");
    setStatus("dismissed");
  };

  if (status !== "blocked") return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Icon */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
          <Shield className="w-4 h-4 text-amber-400" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-amber-200 leading-snug">
            <span className="font-extrabold text-amber-300">VPN required in India.</span>
            {" "}TMDB (movie data & images) is blocked by Indian ISPs.{" "}
            <span className="hidden sm:inline text-amber-200/80">Enable a VPN to load posters, ratings, and discover features.</span>
          </p>
        </div>

        {/* CTA */}
        <a
          href="https://protonvpn.com/download"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition whitespace-nowrap"
        >
          Get VPN <ExternalLink className="w-3 h-3" />
        </a>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10 transition"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile CTA row */}
      <div className="sm:hidden px-4 pb-2.5 flex items-center gap-2">
        <Wifi className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
        <span className="text-[11px] text-amber-200/70">Enable VPN to load movie posters & ratings.</span>
        <a
          href="https://protonvpn.com/download"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 flex items-center gap-1 text-[11px] font-bold text-amber-300 underline underline-offset-2"
        >
          Get free VPN <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
