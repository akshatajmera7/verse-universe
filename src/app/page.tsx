'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import { UniverseCanvas } from '@/components/universe/UniverseCanvas';
import {
  Orbit,
  Disc3,
  Music2,
  TrendingUp,
  ShieldCheck,
  Flame,
  ArrowRight,
  UploadCloud,
  Sparkles,
  Layers,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const { isInitialized, initFromStorage, loadSampleData } = useUniverseStore();

  useEffect(() => {
    initFromStorage();
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.has('code') || params.has('error')) {
        window.location.href = `/app${window.location.search}`;
      }
    }
  }, [initFromStorage]);

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      {/* 1. Header */}
      <header className="h-20 px-6 max-w-7xl mx-auto w-full flex items-center justify-between z-30">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Orbit className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-purple-300">
              VERSE UNIVERSE
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a href="#features" className="hover:text-cyan-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
            How it works
          </a>
          <a href="#privacy" className="hover:text-cyan-400 transition-colors">
            Privacy
          </a>
          <Link href="/app/analytics" className="hover:text-cyan-400 transition-colors">
            Analytics
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="px-4 py-2 rounded-xl glass-button text-xs font-semibold text-slate-200 hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/app"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-10 pb-20">
        {/* Interactive 3D Canvas Background in Hero */}
        <div className="absolute inset-0 w-full h-full opacity-60 pointer-events-auto">
          <UniverseCanvas />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/30 via-transparent to-[#030712] pointer-events-none" />
        </div>

        {/* Hero Overlay Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-xl shadow-cyan-500/10 pointer-events-auto">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Interactive 3D Music Visualization Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Your listening history.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
              Your own universe.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Transform your historical YouTube &amp; YouTube Music activity into an interactive, navigable 3D galaxy. Where your favorite artists form celestial planets, and every song shines as an orbiting star.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pointer-events-auto">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Explore Your Universe</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/app/import"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-panel glass-panel-hover text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>Import Takeout File</span>
            </Link>
          </div>

          <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-400 pointer-events-auto">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Private by default</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Pure 3D WebGL</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Streak telemetry</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300">
            <Layers className="w-3.5 h-3.5" />
            <span>Cosmic Mechanics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Designed for Real Music History
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Not a generic dashboard with a starry background. Every planet, star, orbit, and constellation is mathematically mapped to your actual listening telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Artist Planets */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4 hover:border-cyan-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Disc3 className="w-6 h-6 animate-spin-slow" />
            </div>
            <h3 className="text-xl font-bold text-white">Artist Planets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your most listened-to artists expand into prominent celestial worlds. Planet radii are scaled using logarithmic volume metrics so that standout artists stay prominent without eclipsing hidden favorites.
            </p>
          </div>

          {/* Card 2: Song Stars & Systems */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4 hover:border-purple-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Music2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Orbital Song Stars</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Individual songs revolve in rhythmic orbits around their parent artist planet. Click any star to pull up its first-listened date, total recorded play counts, and direct YouTube playback links.
            </p>
          </div>

          {/* Card 3: Streaks & Analytics */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4 hover:border-pink-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Listening Streaks &amp; Trends</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore your longest active streaks, peak listening days, and how your musical taste evolved year-over-year from 2021 through 2026 with comprehensive calendar heatmap matrices.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How It Works (Takeout Workflow) */}
      <section id="how-it-works" className="py-20 px-6 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">How to Build Your Universe</h2>
          <p className="text-xs text-slate-400">
            Three simple steps to visualize years of listening data without sharing account credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold">
              01
            </div>
            <h3 className="font-bold text-white">Export Activity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export your YouTube history using standard Google Takeout in JSON format. No passwords or tokens required.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold">
              02
            </div>
            <h3 className="font-bold text-white">Parse &amp; Deduplicate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drop your <code className="text-cyan-300">watch-history.json</code> into Verse Universe. Our heuristic engine categorizes music vs general video and normalizes timestamps.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-mono font-bold">
              03
            </div>
            <h3 className="font-bold text-white">Navigate in 3D</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore your galaxy with smooth orbit cameras, search planets, filter by year, and discover listening patterns you never knew you had.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Privacy Commitment */}
      <section id="privacy" className="py-16 px-6 max-w-4xl mx-auto w-full">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-emerald-500/30 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-xl shadow-emerald-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white">Private by Default. Always.</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your listening habits are deeply personal. Verse Universe creates zero public profiles, runs no advertising trackers, and never sells user telemetry. All imported records remain isolated to your session, and can be permanently wiped with a single click at any time.
            </p>
            <div className="pt-2">
              <Link
                href="/privacy"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-1"
              >
                <span>Read our full Privacy Policy</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Orbit className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">Verse Universe</span>
            <span>— 3D YouTube &amp; Music Listening Universe</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/app/import" className="hover:text-white transition-colors">
              Import Guide
            </Link>
            <Link href="/app" className="hover:text-white transition-colors">
              Launch App
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
