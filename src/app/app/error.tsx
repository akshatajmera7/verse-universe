'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Route Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="w-screen h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Cosmic Rendering Glitch</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A temporary rendering anomaly occurred while loading your universe. You can reload the cosmos or return to base.
          </p>
        </div>

        {error.message && (
          <div className="w-full p-3 rounded-xl bg-slate-950/80 border border-white/10 text-left">
            <span className="text-[11px] font-mono text-amber-300 break-all line-clamp-3">
              {error.message}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Universe</span>
          </button>
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-xl glass-button text-xs text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
