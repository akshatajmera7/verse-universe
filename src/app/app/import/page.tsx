'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/hud/TopNav';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import { parseTakeoutJSON, parseTakeoutHTML } from '@/lib/parser/takeout-parser';
import confetti from 'canvas-confetti';
import {
  UploadCloud,
  FileCode,
  FileCheck2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ImportPage() {
  const router = useRouter();
  const {
    activities,
    importSummary,
    loadParsedData,
    loadSampleData,
    wipeAllData,
  } = useUniverseStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setIsParsing(true);
    setErrorMsg(null);
    setSuccessReport(null);

    try {
      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith('.json') && !fileName.endsWith('.html')) {
        throw new Error('Please upload a valid Google Takeout .json or .html file (e.g. watch-history.json).');
      }

      const text = await file.text();

      let result;
      if (fileName.endsWith('.json')) {
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error('Invalid JSON format in the uploaded file.');
        }

        if (!Array.isArray(json)) {
          throw new Error('Expected a JSON array of YouTube watch history items.');
        }

        result = parseTakeoutJSON(json);
      } else {
        result = parseTakeoutHTML(text);
      }

      if (result.activities.length === 0) {
        throw new Error('No valid YouTube watch history events found in the uploaded file.');
      }

      loadParsedData(result);
      setSuccessReport(result.summary);

      // Celebrate success
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#8b5cf6', '#ec4899'],
        });
      } catch {}
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to process file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Activity Ingestion Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Import Your YouTube & Music History
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Upload your official Google Takeout activity file. Verse Universe parses, deduplicates, and organizes your listening records locally and securely.
          </p>
        </div>

        {/* Direct Google Account YouTube Sync Card */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-4 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Direct Google YouTube Account Sync</h3>
                <p className="text-xs text-slate-300 max-w-lg mt-0.5 leading-relaxed">
                  Directly fetch your real <strong>Liked Music Tracks</strong>, <strong>Personal Playlists</strong>, and <strong>Subscribed Artists</strong> from your connected Google account using the official YouTube Data API.
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                const token =
                  localStorage.getItem('google_yt_provider_token') ||
                  prompt('Please enter your Google OAuth Access Token (or sign in at /auth):');
                if (!token) return;
                setIsParsing(true);
                setErrorMsg(null);
                try {
                  const { syncRealUserYouTubeData } = await import('@/lib/youtube/google-sync');
                  const result = await syncRealUserYouTubeData(token);
                  loadParsedData(result);
                  setSuccessReport(result.summary);
                  try {
                    confetti({
                      particleCount: 100,
                      spread: 80,
                      origin: { y: 0.6 },
                      colors: ['#06b6d4', '#8b5cf6', '#ec4899'],
                    });
                  } catch {}
                } catch (err: any) {
                  setErrorMsg(err.message || 'Direct Google Sync failed.');
                } finally {
                  setIsParsing(false);
                }
              }}
              disabled={isParsing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 shrink-0 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isParsing ? 'Syncing...' : 'Sync Real Google Account'}</span>
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
              : 'border-white/15 hover:border-cyan-500/40 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.html"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleProcessFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-xl shadow-cyan-500/10">
            {isParsing ? (
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {isParsing ? 'Processing Activity History...' : 'Drop watch-history.json or click to browse'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Supports official Google Takeout JSON and HTML exports. Files are validated for malicious paths and parsed client-side.
          </p>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/5">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" /> watch-history.json
            </span>
            <span className="flex items-center gap-1 text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/5">
              <FileCode className="w-3.5 h-3.5 text-purple-400" /> watch-history.html
            </span>
          </div>
        </div>

        {/* Quick Demo Button */}
        <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Don&apos;t have a Takeout file ready?</h4>
              <p className="text-xs text-slate-400">
                Instantly load our realistic multi-year sample listening dataset to explore the 3D universe.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              loadSampleData();
              router.push('/app');
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md shrink-0 ml-4"
          >
            Load Sample Universe
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-start gap-3 text-sm text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Import Error</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Success Report */}
        {(successReport || importSummary) && (
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Import Summary Report</h3>
              </div>
              <Link
                href="/app"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <span>Enter 3D Universe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px] mb-1">Processed</span>
                <span className="text-lg font-bold text-white font-mono">
                  {(successReport || importSummary)?.totalRecords}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px] mb-1">Accepted</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">
                  {(successReport || importSummary)?.acceptedRecords}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px] mb-1">Duplicates Skipped</span>
                <span className="text-lg font-bold text-amber-300 font-mono">
                  {(successReport || importSummary)?.skippedDuplicates}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px] mb-1">Music Classified</span>
                <span className="text-lg font-bold text-purple-300 font-mono">
                  {(successReport || importSummary)?.musicRecords}
                </span>
              </div>
            </div>

            {(successReport || importSummary)?.startDate && (
              <div className="text-xs text-slate-400 font-mono">
                Detected Date Span:{' '}
                <strong className="text-slate-200">
                  {new Date((successReport || importSummary)!.startDate!).toLocaleDateString()}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-200">
                  {new Date((successReport || importSummary)!.endDate!).toLocaleDateString()}
                </strong>
              </div>
            )}
          </div>
        )}

        {/* Step by step Takeout Guide */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">How to Get Your Google Takeout History</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-cyan-300">
                1
              </div>
              <h4 className="font-semibold text-white">Go to Google Takeout</h4>
              <p className="text-slate-400 leading-relaxed">
                Visit{' '}
                <a
                  href="https://takeout.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline inline-flex items-center gap-1"
                >
                  takeout.google.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and click &quot;Deselect all&quot;.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-cyan-300">
                2
              </div>
              <h4 className="font-semibold text-white">Select YouTube History</h4>
              <p className="text-slate-400 leading-relaxed">
                Check &quot;YouTube and YouTube Music&quot;. Click &quot;Multiple formats&quot; and set History to <strong>JSON</strong> format.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-cyan-300">
                3
              </div>
              <h4 className="font-semibold text-white">Extract &amp; Drop</h4>
              <p className="text-slate-400 leading-relaxed">
                Download the archive, extract the zip, and upload the <code className="text-cyan-300">watch-history.json</code> file above.
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Data & Deletion */}
        {activities.length > 0 && (
          <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Delete Stored Activity History</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Permanently wipes all {activities.length} imported activity records and resets your 3D universe.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to permanently delete all imported history?')) {
                  wipeAllData();
                }
              }}
              className="px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 text-xs font-semibold transition-all shrink-0"
            >
              Wipe All Data
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
