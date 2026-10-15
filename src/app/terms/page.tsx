'use client';

import React from 'react';
import Link from 'next/link';
import { Orbit, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      <header className="h-16 px-6 glass-panel border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Orbit className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            VERSE UNIVERSE
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto w-full px-6 py-12 space-y-8 text-sm text-slate-300 leading-relaxed">
        <div className="space-y-2 pb-6 border-b border-white/10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400">Effective Date: October 15, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Introduction</h2>
          <p>
            By accessing or using Verse Universe (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any portion of these terms, you should discontinue using the application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Permitted Use</h2>
          <p>
            Verse Universe is provided to visualize your personal YouTube and YouTube Music viewing and listening records. You agree not to upload corrupted, malicious archives or files containing illegal content.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Third-Party Trademarks &amp; Attribution</h2>
          <p>
            YouTube and YouTube Music are registered trademarks of Google LLC. Verse Universe is an independent visualization project and is not affiliated with, endorsed by, or sponsored by Google or YouTube.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Disclaimer of Warranties</h2>
          <p>
            The service is provided &quot;as is&quot; without warranties of any kind. Playback duration metrics are estimated based on documented heuristics and do not constitute an official auditing standard.
          </p>
        </section>
      </main>
    </div>
  );
}
