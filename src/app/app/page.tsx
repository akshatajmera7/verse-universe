'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import { syncRealUserYouTubeData } from '@/lib/youtube/google-sync';
import { TopNav } from '@/components/hud/TopNav';
import { LeftRail } from '@/components/hud/LeftRail';
import { UniverseCanvas } from '@/components/universe/UniverseCanvas';
import { UniverseControls } from '@/components/universe/UniverseControls';
import { DetailPanel } from '@/components/panels/DetailPanel';
import confetti from 'canvas-confetti';
import {
  UploadCloud,
  Sparkles,
  Orbit,
  RefreshCw,
  AlertCircle,
  Loader2,
  KeyRound,
} from 'lucide-react';

export default function AppPage() {
  const {
    activities,
    setUser,
    loadParsedData,
    initFromStorage,
  } = useUniverseStore();

  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showManualTokenModal, setShowManualTokenModal] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const syncInProgressRef = useRef(false);

  // Only sync when explicitly requested by user (or very first initial onboarding)
  const performSync = async (token: string) => {
    if (syncInProgressRef.current) return;
    syncInProgressRef.current = true;
    setSyncingGoogle(true);
    setSyncError(null);
    setSyncStatus('Connecting to your Google YouTube account...');

    try {
      const result = await syncRealUserYouTubeData(token, (progress) => {
        setSyncStatus(progress.status);
      });

      // Update state with newly fetched data without flashing empty screen
      loadParsedData(result);
      localStorage.setItem('verse_has_synced_real_data', 'true');
      setSyncStatus(`Updated! Synced ${result.activities.length} personal YouTube records.`);

      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#38bdf8', '#fbbf24'],
        });
      } catch {}
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || 'Failed to sync your real YouTube data.');
    } finally {
      setSyncingGoogle(false);
      syncInProgressRef.current = false;
    }
  };

  useEffect(() => {
    initFromStorage();

    const handleAuth = async () => {
      const supabase = getSupabaseClient();
      const hasExistingData =
        typeof window !== 'undefined' &&
        localStorage.getItem('verse_has_synced_real_data') === 'true';

      // 1. Check for provider_token in hash (#provider_token=... or access_token=...)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const hashPToken = hashParams.get('provider_token') || hashParams.get('access_token');
        if (hashPToken) {
          localStorage.setItem('google_yt_provider_token', hashPToken);
          setProviderToken(hashPToken);
          // Only auto-fetch if no data has ever been synced yet
          if (!hasExistingData) {
            performSync(hashPToken);
          }
          return;
        }
      }

      // 2. Check for PKCE ?code= in search params and exchange it
      if (typeof window !== 'undefined' && window.location.search && supabase) {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
          try {
            setSyncStatus('Connecting to your Google profile...');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error && data.session) {
              const session = data.session;
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                displayName:
                  session.user.user_metadata?.full_name ||
                  session.user.email?.split('@')[0] ||
                  'Google User',
                avatarUrl: session.user.user_metadata?.avatar_url,
                isDemo: false,
              });

              const pToken = session.provider_token;
              if (pToken) {
                localStorage.setItem('google_yt_provider_token', pToken);
                setProviderToken(pToken);
                window.history.replaceState({}, document.title, window.location.pathname);
                // Only auto-fetch on the very first initial sign in
                if (!hasExistingData) {
                  performSync(pToken);
                }
                return;
              }
            }
          } catch (e) {
            console.warn('Code exchange attempt error:', e);
          }
        }
      }

      // 3. Check existing Supabase session - store token but DO NOT refetch automatically
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            displayName:
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              'Google User',
            avatarUrl: session.user.user_metadata?.avatar_url,
            isDemo: false,
          });

          if (session.provider_token) {
            setProviderToken(session.provider_token);
            localStorage.setItem('google_yt_provider_token', session.provider_token);
          }
        }

        // Listen for token updates without auto-refetching
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.provider_token) {
            setProviderToken(session.provider_token);
            localStorage.setItem('google_yt_provider_token', session.provider_token);
          }
        });
      }

      // 4. Fallback to localStorage saved token (only populate state, do NOT auto-refetch)
      const savedToken = localStorage.getItem('google_yt_provider_token');
      if (savedToken) {
        setProviderToken(savedToken);
      }
    };

    handleAuth();
  }, [initFromStorage, setUser]);

  const hasData = activities.length > 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030712] flex flex-col select-none">
      {/* Top HUD */}
      <TopNav />

      {/* Google Sync Floating Banner with Manual Re-sync Button */}
      {providerToken ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-950/90 via-purple-950/80 to-slate-950/90 border-b border-cyan-500/25 px-4 py-2 flex items-center justify-between text-xs z-30 shadow-md backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-cyan-200">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-medium">
              {activities.length > 0
                ? (syncStatus || `Google Connected (${activities.length} records loaded). Click Re-sync to refresh.`)
                : (syncStatus || 'Google Account Connected. Click Sync to fetch your YouTube library.')}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => performSync(providerToken)}
            disabled={syncingGoogle}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingGoogle ? 'animate-spin' : ''}`} />
            <span>{syncingGoogle ? 'Re-syncing...' : 'Re-sync / Refresh'}</span>
          </motion.button>
        </motion.div>
      ) : (
        <div className="bg-slate-900/60 border-b border-white/10 px-4 py-2 flex items-center justify-between text-xs z-30 backdrop-blur-sm">
          <span className="text-slate-400">
            Want your real YouTube music? Sign in or sync with your Google account.
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/auth"
              className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors"
            >
              Sign In with Google
            </Link>
            <button
              onClick={() => setShowManualTokenModal(true)}
              className="px-2.5 py-1 rounded-lg glass-button text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3 h-3 text-cyan-400" />
              <span>Enter OAuth Token</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Token Modal */}
      <AnimatePresence>
        {showManualTokenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-panel p-6 rounded-2xl border border-white/20 max-w-md w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Connect Google YouTube Token</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If your browser didn&apos;t automatically pass the Google OAuth token, paste your Google OAuth Access Token here to load your real YouTube music library.
              </p>
              <input
                type="text"
                placeholder="ya29.a0Ac..."
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowManualTokenModal(false)}
                  className="px-3 py-1.5 rounded-xl glass-button text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (manualTokenInput.trim()) {
                      setProviderToken(manualTokenInput.trim());
                      localStorage.setItem('google_yt_provider_token', manualTokenInput.trim());
                      setShowManualTokenModal(false);
                      performSync(manualTokenInput.trim());
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  Sync Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial Loading Overlay ONLY if there's no data in cache yet */}
      <AnimatePresence>
        {syncingGoogle && activities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#030712]/90 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-5 shadow-2xl shadow-cyan-500/30"
            >
              <Loader2 className="w-10 h-10 animate-spin text-cyan-300" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Synthesizing Your Real YouTube Cosmos...
            </h3>
            <p className="text-sm text-cyan-300 max-w-sm mb-4 font-mono">
              {syncStatus}
            </p>
            <span className="text-xs text-slate-400">
              Extracting Liked Songs, Playlists, and Subscribed Artists directly from Google
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Experience Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Left Rail */}
        <LeftRail />

        {/* Central 3D Canvas or Empty State */}
        <main className="relative flex-1 h-full overflow-hidden">
          {hasData ? (
            <>
              <UniverseCanvas />
              <UniverseControls />
              <DetailPanel />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center z-10 relative">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/20"
              >
                <Orbit className="w-12 h-12 text-cyan-400" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                Your Personal Universe is Ready
              </h2>
              <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
                Connect your real YouTube account or import your Google Takeout history to explore your real listening data in 3D.
              </p>

              {syncError && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 max-w-md text-left space-y-1 shadow-lg">
                  <div className="flex items-center gap-2 font-bold text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>Sync Note</span>
                  </div>
                  <div>{syncError}</div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Tip: Ensure &quot;YouTube Data API v3&quot; is enabled in your Google Cloud Console project.
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {providerToken ? (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => performSync(providerToken)}
                    disabled={syncingGoogle}
                    className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncingGoogle ? 'animate-spin' : ''}`} />
                    <span>{syncingGoogle ? 'Syncing...' : 'Sync Real YouTube Account'}</span>
                  </motion.button>
                ) : (
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Link
                      href="/auth"
                      className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Connect Google Account</span>
                    </Link>
                  </motion.div>
                )}

                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/app/import"
                    className="px-7 py-3.5 rounded-xl glass-button text-white font-medium text-sm transition-all flex items-center gap-2 shadow-lg"
                  >
                    <UploadCloud className="w-4 h-4 text-cyan-400" />
                    <span>Import Takeout File</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
