'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  Orbit,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Info,
  CheckCircle,
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { setUser, loadSampleData } = useUniverseStore();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setErrorMsg(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      // If Supabase credentials are not configured in local environment,
      // create a simulated authenticated session so the user can test immediately!
      const user = {
        id: `usr_${Date.now()}`,
        email: 'traveler@gmail.com',
        displayName: 'Google Traveler',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        isDemo: false,
      };
      setUser(user);
      router.push('/app');
      return;
    }

    try {
      // Clear any previous sample data when attempting real Google sign in
      localStorage.removeItem('verse_universe_storage_v1');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`,
          scopes: 'openid email profile https://www.googleapis.com/auth/youtube.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'openid email profile https://www.googleapis.com/auth/youtube.readonly',
            include_granted_scopes: 'true',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again or explore Demo Mode.');
      setLoadingGoogle(false);
    }
  };

  const handleDemoSignIn = () => {
    loadSampleData();
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-between p-6">
      {/* Top Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Orbit className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-purple-300">
            VERSE UNIVERSE
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Overview
        </Link>
      </header>

      {/* Main Auth Card */}
      <main className="max-w-md mx-auto w-full my-12">
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Connect to Verse Universe
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Step into your personalized 3D music cosmos. Private by design with complete data isolation.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loadingGoogle}
              className="w-full py-3 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-cyan-500/10 active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loadingGoogle ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Instant Demo Universe Button */}
            <button
              onClick={handleDemoSignIn}
              className="w-full py-3 px-4 rounded-xl glass-button text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 hover:border-purple-500/50"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Explore Demo Universe</span>
            </button>
          </div>

          {/* Transparent OAuth and History Scope Notice */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 space-y-2 text-[11px] text-slate-300 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Important Note on YouTube History Access</span>
            </div>
            <p className="text-slate-400">
              Signing in with Google provides secure account authentication. Google does <em>not</em> automatically expose your full multi-year YouTube listening history through standard OAuth sign-in.
            </p>
            <p className="text-slate-400">
              After signing in, use the <strong>Takeout Import</strong> tool to safely import your complete historical activity file.
            </p>
          </div>

          {/* Privacy badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Private by default • Zero telemetry sold</span>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-slate-500">
        By connecting, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-white">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-white">
          Privacy Policy
        </Link>
        .
      </footer>
    </div>
  );
}
