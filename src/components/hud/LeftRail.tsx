'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import {
  Flame,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export function LeftRail() {
  const {
    artists,
    analytics,
    mode,
    selectObject,
    setFocusedTarget,
    selectedObject,
  } = useUniverseStore();

  const topArtists = artists.slice(0, 6);

  const handleArtistClick = (artist: any) => {
    selectObject({ type: 'artist', data: artist });
    if (artist.position) {
      setFocusedTarget(artist.position);
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 280 }}
      className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] p-4 glass-panel border-r border-white/10 z-20 space-y-6 backdrop-blur-xl"
    >
      {/* Quick Stats Widget */}
      {analytics && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-slate-900/60 rounded-2xl p-3.5 border border-white/10 space-y-3 shadow-lg"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Universe Metrics</span>
            </span>
            <span className="text-cyan-400 font-bold">{analytics.totalActivityCount}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/50 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 mb-0.5">Active Streak</div>
              <div className="text-sm font-bold text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>{analytics.streak.currentStreak} Days</span>
              </div>
            </div>

            <div className="bg-black/50 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 mb-0.5">Est. Hours</div>
              <div className="text-sm font-bold text-cyan-300">
                {analytics.totalEstHours}h
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Prominent Celestial Bodies List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{mode === 'music' ? 'Dominant Artists' : 'Active Channels'}</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
            TOP 6
          </span>
        </div>

        <div className="space-y-1.5">
          {topArtists.map((art, idx) => {
            const isSelected =
              selectedObject?.type === 'artist' && selectedObject.data.id === art.id;

            return (
              <motion.button
                key={art.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleArtistClick(art)}
                className={`w-full p-2.5 rounded-xl transition-all flex items-center justify-between text-xs group border shadow-sm ${
                  isSelected
                    ? 'bg-cyan-500/25 text-cyan-100 border-cyan-500/50 shadow-cyan-500/20 shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-125"
                    style={{ backgroundColor: art.color }}
                  />
                  <span className="truncate font-medium">{art.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[11px] font-mono text-slate-400 group-hover:text-white">
                    {art.totalPlays}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="p-3 rounded-xl bg-purple-950/25 border border-purple-800/40 text-[11px] text-purple-200/90 leading-relaxed shadow-lg backdrop-blur-sm">
        <strong>Tip:</strong> Click & drag to rotate space. Scroll to zoom. Click any planet to fly in and inspect orbits.
      </div>
    </motion.aside>
  );
}
