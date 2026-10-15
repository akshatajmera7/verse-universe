'use client';

import React, { useState } from 'react';
import { TopNav } from '@/components/hud/TopNav';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import { GraphicsQuality, MetricMode } from '@/types';
import {
  Settings,
  Shield,
  Monitor,
  Download,
  Trash2,
  CheckCircle2,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    graphicsQuality,
    setGraphicsQuality,
    reducedMotion,
    setReducedMotion,
    showLabels,
    setShowLabels,
    metricMode,
    setMetricMode,
    activities,
    wipeAllData,
  } = useUniverseStore();

  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportData = () => {
    if (activities.length === 0) return;
    const blob = new Blob([JSON.stringify(activities, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verse-universe-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col pb-16">
      <TopNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300">
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences &amp; Privacy</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Universe Settings</h1>
          <p className="text-slate-400 text-sm">
            Configure 3D graphics rendering, default telemetry metrics, and data privacy controls.
          </p>
        </div>

        {/* 1. 3D Graphics Preferences */}
        <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Visual &amp; Performance</h2>
          </div>

          <div className="space-y-5 text-sm">
            {/* Graphics Quality */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold block text-white">Graphics Quality</span>
                <span className="text-xs text-slate-400">
                  Controls celestial starfield particle density and shader antialiasing.
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
                {(['ultra', 'high', 'medium', 'low'] as GraphicsQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => setGraphicsQuality(q)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                      graphicsQuality === q
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
              <div>
                <span className="font-semibold block text-white">Reduced Motion Mode</span>
                <span className="text-xs text-slate-400">
                  Freezes celestial planetary rotations and nebula drift for accessibility.
                </span>
              </div>
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  reducedMotion ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Show Floating Labels */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
              <div>
                <span className="font-semibold block text-white">Floating Celestial Labels</span>
                <span className="text-xs text-slate-400">
                  Always display artist names and play counts on planets.
                </span>
              </div>
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showLabels ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showLabels ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Default Metric */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
              <div>
                <span className="font-semibold block text-white">Default Sizing Metric</span>
                <span className="text-xs text-slate-400">
                  Choose whether planets scale by play counts or estimated listening duration.
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
                {(['plays', 'duration'] as MetricMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetricMode(m)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                      metricMode === m
                        ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m === 'plays' ? 'Play Count' : 'Est. Duration'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Privacy & Data Isolation */}
        <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Privacy by Default</h2>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-300 font-semibold mb-0.5">
                  Tenant Isolation &amp; Zero Public Sharing
                </strong>
                Your listening history and 3D universe are strictly private. No public leaderboards, public profiles, or search engine indexing exist. Data is never shared or sold.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-sm font-semibold text-white block">Export Normalized History</span>
                <span className="text-xs text-slate-400">
                  Download a structured JSON backup of your parsed activity ({activities.length} records).
                </span>
              </div>
              <button
                onClick={handleExportData}
                disabled={activities.length === 0}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white font-medium text-xs transition-all flex items-center gap-1.5"
              >
                {exportSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Exported!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* 3. Danger Zone */}
        <section className="p-6 rounded-3xl bg-red-950/20 border border-red-500/20 space-y-4">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold text-white">Danger Zone</h2>
          </div>
          <p className="text-xs text-slate-400">
            Permanently delete all imported watch history, calculated streaks, artists, and reset your 3D universe.
          </p>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to permanently delete all imported history?')) {
                wipeAllData();
                alert('All data has been wiped.');
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 text-xs font-semibold transition-all"
          >
            Delete All Activity &amp; Reset Universe
          </button>
        </section>
      </main>
    </div>
  );
}
