'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import {
  Search,
  Orbit,
  BarChart3,
  UploadCloud,
  Settings,
  Sparkles,
  Music2,
  Tv,
  Disc3,
  X,
  Calendar,
} from 'lucide-react';
import { TIME_FILTER_OPTIONS } from '@/lib/parser/time-filter';

export function TopNav() {
  const pathname = usePathname();
  const {
    user,
    artists,
    songs,
    channels,
    timeFilter,
    setTimeFilter,
    selectObject,
    setFocusedTarget,
  } = useUniverseStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global hotkey Ctrl+K / Cmd+K to open search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const trimmed = searchTerm.trim().toLowerCase();
  const matchedArtists = trimmed
    ? artists.filter((a) => a.name.toLowerCase().includes(trimmed)).slice(0, 4)
    : [];
  const matchedSongs = trimmed
    ? songs.filter((s) => s.cleanTitle.toLowerCase().includes(trimmed) || s.artistName.toLowerCase().includes(trimmed)).slice(0, 5)
    : [];
  const matchedChannels = trimmed
    ? channels.filter((c) => c.name.toLowerCase().includes(trimmed)).slice(0, 3)
    : [];

  const hasResults =
    matchedArtists.length > 0 || matchedSongs.length > 0 || matchedChannels.length > 0;

  const handleSelectArtist = (artist: any) => {
    selectObject({ type: 'artist', data: artist });
    if (artist.position) {
      setFocusedTarget(artist.position);
    }
    setSearchTerm('');
    setSearchOpen(false);
  };

  const handleSelectSong = (song: any) => {
    selectObject({ type: 'song', data: song });
    const parentArtist = artists.find(
      (a) => a.name.toLowerCase() === song.artistName.toLowerCase()
    );
    if (parentArtist && parentArtist.position) {
      setFocusedTarget(parentArtist.position);
    }
    setSearchTerm('');
    setSearchOpen(false);
  };

  const handleSelectChannel = (channel: any) => {
    selectObject({ type: 'channel', data: channel });
    if (channel.position) {
      setFocusedTarget(channel.position);
    }
    setSearchTerm('');
    setSearchOpen(false);
  };

  return (
    <header className="h-16 px-4 md:px-6 w-full flex items-center justify-between glass-panel border-b border-white/10 z-40 relative backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25"
          >
            <Orbit className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-purple-300">
              VERSE UNIVERSE
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs">
          <Link
            href="/app"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              pathname === '/app'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>3D Universe</span>
          </Link>
          <Link
            href="/app/analytics"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              pathname === '/app/analytics'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-medium shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </Link>
          <Link
            href="/app/import"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              pathname === '/app/import'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import History</span>
          </Link>
        </nav>
      </div>

      {/* Center Search & Filters */}
      <div className="flex items-center gap-3">
        {/* Live Audio Equalizer Spectrum from Stitch Design */}
        <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 text-cyan-300 shadow-inner">
          <div className="flex items-end gap-1 h-3.5 w-4.5">
            <span className="w-0.5 bg-cyan-400 rounded-full eq-bar-1" />
            <span className="w-0.5 bg-cyan-300 rounded-full eq-bar-2" />
            <span className="w-0.5 bg-purple-400 rounded-full eq-bar-3" />
            <span className="w-0.5 bg-pink-400 rounded-full eq-bar-4" />
            <span className="w-0.5 bg-cyan-400 rounded-full eq-bar-5" />
          </div>
          <span className="text-[10px] font-mono tracking-wider text-slate-300 uppercase">
            Orbital Audio: <span className="text-cyan-400 font-bold">Synchronized</span>
          </span>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search planets, songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="w-44 md:w-64 pl-8 pr-12 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:flex absolute right-2.5 px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-slate-500 pointer-events-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Search Dropdown with AnimatePresence */}
          <AnimatePresence>
            {searchOpen && trimmed && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-10 left-0 w-80 max-h-96 glass-panel rounded-2xl border border-white/15 p-2 shadow-2xl z-50 overflow-y-auto backdrop-blur-xl"
              >
                {!hasResults && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No celestial matches found in your dataset
                  </div>
                )}

                {/* Matched Artists */}
                {matchedArtists.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
                      Artist Planets
                    </div>
                    {matchedArtists.map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => handleSelectArtist(artist)}
                        className="w-full text-left p-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate text-slate-200 font-medium">
                          <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
                          {artist.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {artist.totalPlays} plays
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Matched Songs */}
                {matchedSongs.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase text-purple-400 tracking-wider">
                      Song Stars
                    </div>
                    {matchedSongs.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => handleSelectSong(song)}
                        className="w-full text-left p-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="truncate pr-2">
                          <div className="text-slate-200 truncate flex items-center gap-1.5 font-medium">
                            <Music2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{song.cleanTitle}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 pl-5">
                            {song.artistName}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {song.totalPlays}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Matched Channels */}
                {matchedChannels.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                      YouTube Channels
                    </div>
                    {matchedChannels.map((chan) => (
                      <button
                        key={chan.id}
                        onClick={() => handleSelectChannel(chan)}
                        className="w-full text-left p-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate text-slate-200 font-medium">
                          <Tv className="w-3.5 h-3.5 text-amber-400" />
                          {chan.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {chan.totalViews} views
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Time Filter Pills */}
        <div className="hidden md:flex items-center bg-black/40 rounded-xl p-1 border border-white/10 text-xs shadow-inner">
          {TIME_FILTER_OPTIONS.map((opt) => (
            <motion.button
              key={opt.key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTimeFilter(opt.key)}
              title={opt.description}
              className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-medium ${
                timeFilter === opt.key
                  ? 'bg-cyan-500/25 text-cyan-200 font-semibold border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Right User & Settings */}
      <div className="flex items-center gap-2">
        <Link
          href="/app/settings"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Universe Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md cursor-pointer"
            >
              {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </motion.div>
            <div className="hidden sm:block text-left text-xs">
              <div className="text-white font-medium truncate max-w-[100px]">
                {user.displayName || 'Traveler'}
              </div>
              <div className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{user.isDemo ? 'Demo Mode' : 'Connected'}</span>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/auth"
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
