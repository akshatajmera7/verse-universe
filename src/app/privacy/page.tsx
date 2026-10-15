'use client';

import React from 'react';
import Link from 'next/link';
import { Orbit, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy by Default</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Effective Date: October 15, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Core Philosophy: Private by Default</h2>
          <p>
            Verse Universe transforms your YouTube and YouTube Music activity history into an interactive 3D universe.
            We operate on a strict <strong>private-by-default</strong> model: your listening data, artists, streams, and preferences belong exclusively to you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Information We Access</h2>
          <p>
            <strong>Authentication:</strong> When connecting with Google OAuth, we request minimal public identity details (email address, display name, and avatar) solely to maintain your personal session.
          </p>
          <p>
            <strong>Uploaded Activity:</strong> When you upload a Google Takeout export (such as <code className="text-cyan-300">watch-history.json</code>), records are processed directly in your browser or your private, isolated PostgreSQL tenant. We never inspect your activity for advertising or data brokerage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Zero Data Sale or Public Profiles</h2>
          <p>
            We do not sell, rent, or monetize your activity logs. There are no public search listings, global leaderboards, or crawlable user profiles in Verse Universe.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Total Data Deletion Rights</h2>
          <p>
            You hold total control over your information. At any point, you can navigate to <strong>Settings</strong> or the <strong>Import Dashboard</strong> and click <strong>&quot;Wipe All Data&quot;</strong> to immediately and irrevocably destroy all imported records, computed streaks, and cached coordinates.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Security &amp; Tenant Isolation</h2>
          <p>
            In persistent cloud configurations, all activity tables are safeguarded with PostgreSQL Row Level Security (RLS), verifying that requests match the authenticated user&apos;s identity token on every query.
          </p>
        </section>
      </main>
    </div>
  );
}
