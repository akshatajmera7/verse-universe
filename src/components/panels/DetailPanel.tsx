'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import {
  X,
  ExternalLink,
  Flame,
  Clock,
  Calendar,
  Disc3,
  Music2,
  Tv,
  Info,
  Sparkles,
} from 'lucide-react';

function AudioEqualizer({ color = '#38bdf8' }: { color?: string }) {
  return (
    <div className="flex items-end gap-1 h-4 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
      {[0.4, 0.8, 0.5, 0.9, 0.6].map((initialHeight, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: ['20%', '100%', '40%', '80%', '20%'],
          }}
          transition={{
            duration: 0.8 + i * 0.15,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

export function DetailPanel() {
  const { selectedObject, clearSelection, selectObject, setFocusedTarget } = useUniverseStore();

  return (
    <AnimatePresence>
      {selectedObject && (
        <motion.div
          key={selectedObject.type + (selectedObject.data?.id || '')}
          initial={{ opacity: 0, x: 60, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.92 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="absolute top-20 right-6 w-96 max-h-[calc(100vh-7rem)] z-30 cosmic-glass rounded-2xl p-5 border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
        >
          {/* Header with Close */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              {selectedObject.type === 'artist' && (
                <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Disc3 className="w-4 h-4 animate-spin-slow" />
                </span>
              )}
              {selectedObject.type === 'song' && (
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Music2 className="w-4 h-4" />
                </span>
              )}
              {selectedObject.type === 'channel' && (
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Tv className="w-4 h-4" />
                </span>
              )}
              <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
                {selectedObject.type} Overview
              </span>
            </div>

            <div className="flex items-center gap-2">
              <AudioEqualizer
                color={
                  selectedObject.type === 'artist'
                    ? selectedObject.data.color || '#38bdf8'
                    : selectedObject.type === 'song'
                    ? '#c084fc'
                    : '#fbbf24'
                }
              />
              <button
                onClick={clearSelection}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto pt-4 space-y-5 pr-1 custom-scrollbar">
            {/* ARTIST VIEW */}
            {selectedObject.type === 'artist' && (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <motion.span
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-3.5 h-3.5 rounded-full shadow-lg"
                      style={{ backgroundColor: selectedObject.data.color }}
                    />
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {selectedObject.data.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Luminous Artist Planet</span>
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-900/60 p-3 rounded-xl border border-white/5 transition-colors hover:border-cyan-500/30"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recorded Plays</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {selectedObject.data.totalPlays}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-900/60 p-3 rounded-xl border border-white/5 transition-colors hover:border-cyan-500/30"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Est. Listening</span>
                    </div>
                    <div className="text-2xl font-bold text-cyan-300">
                      ~{Math.round((selectedObject.data.estDurationSeconds / 60) * 10) / 10}m
                    </div>
                  </motion.div>
                </div>

                {/* Timeline Range */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> First Seen
                    </span>
                    <span className="text-slate-200 font-mono">
                      {new Date(selectedObject.data.firstSeenAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Latest Seen
                    </span>
                    <span className="text-slate-200 font-mono">
                      {new Date(selectedObject.data.lastSeenAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Yearly Trend Pills */}
                {selectedObject.data.yearlyPlays && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Plays by Year
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(selectedObject.data.yearlyPlays).map(([yr, count]) => (
                        <span
                          key={yr}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300"
                        >
                          {yr}: <strong className="text-cyan-300">{count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Orbiting Songs */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Top Orbiting Tracks ({selectedObject.data.topTracks.length})
                  </h4>
                  <div className="space-y-1.5">
                    {selectedObject.data.topTracks.map((song, i) => (
                      <motion.div
                        key={song.id || i}
                        whileHover={{ scale: 1.02, x: 2 }}
                        onClick={() => selectObject({ type: 'song', data: song })}
                        className="p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/40 transition-all flex items-center justify-between cursor-pointer group shadow-sm"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] font-mono text-cyan-400/70 w-4">
                            #{i + 1}
                          </span>
                          <span className="text-xs text-slate-200 group-hover:text-cyan-300 truncate font-medium">
                            {song.cleanTitle}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400 group-hover:text-white shrink-0 ml-2">
                          {song.totalPlays} plays
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SONG VIEW */}
            {selectedObject.type === 'song' && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight leading-snug mb-1">
                    {selectedObject.data.cleanTitle}
                  </h2>
                  <p className="text-sm text-cyan-400 font-medium">
                    {selectedObject.data.artistName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-900/60 p-3 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Flame className="w-3.5 h-3.5 text-purple-400" />
                      <span>Recorded Plays</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {selectedObject.data.totalPlays}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-900/60 p-3 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Est. Duration</span>
                    </div>
                    <div className="text-2xl font-bold text-cyan-300">
                      ~{Math.round((selectedObject.data.estDurationSeconds / 60) * 10) / 10}m
                    </div>
                  </motion.div>
                </div>

                {/* Date Details */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>First Listened</span>
                    <span className="text-slate-200 font-mono">
                      {new Date(selectedObject.data.firstSeenAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Last Listened</span>
                    <span className="text-slate-200 font-mono">
                      {new Date(selectedObject.data.lastSeenAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Audio Waveform Preview from Stitch Design */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                    <span>Frequency Resonance</span>
                    <span className="text-purple-400">Harmonic Orbit</span>
                  </div>
                  <div className="flex items-end gap-1 h-8 pt-1">
                    {[12, 28, 45, 60, 35, 75, 90, 65, 40, 85, 95, 70, 50, 80, 45, 30, 60, 85, 40, 20].map((h, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-purple-500/30 to-cyan-400 rounded-t-sm"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions: YouTube Link & Camera Focus */}
                <div className="space-y-2">
                  {selectedObject.data.playbackUrl && (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={selectedObject.data.playbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-medium text-xs transition-all shadow-lg"
                    >
                      <span>Play on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </motion.a>
                  )}
                </div>

                {/* Uncertainty Disclaimer */}
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 flex items-start gap-2 text-[11px] text-cyan-300/80 leading-relaxed">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-400" />
                  <span>
                    Listening time is estimated from recorded history playback events. Takeout records initiation, not completed duration.
                  </span>
                </div>
              </>
            )}

            {/* CHANNEL VIEW */}
            {selectedObject.type === 'channel' && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight mb-1">
                    {selectedObject.data.name}
                  </h2>
                  <p className="text-xs text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>YouTube Channel Hub</span>
                  </p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Tv className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recorded Viewing Events</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {selectedObject.data.totalViews}
                  </div>
                </div>

                <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>First Watch</span>
                    <span className="text-slate-200 font-mono">
                      {new Date(selectedObject.data.firstSeenAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Last Watch</span>
                    <span className="text-slate-200 font-mono">
                      {new Date(selectedObject.data.lastSeenAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {selectedObject.data.channelUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedObject.data.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 font-medium text-xs transition-all shadow-lg"
                  >
                    <span>Visit Channel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </motion.a>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
