'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import {
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Flame,
  Clock,
  Radio,
  Tv,
} from 'lucide-react';

export function UniverseControls() {
  const {
    mode,
    setMode,
    metricMode,
    setMetricMode,
    showLabels,
    setShowLabels,
    reducedMotion,
    setReducedMotion,
    setFocusedTarget,
    clearSelection,
  } = useUniverseStore();

  const handleResetCamera = () => {
    clearSelection();
    setFocusedTarget([0, 0, 0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl cosmic-glass shadow-2xl border border-cyan-500/30 text-xs backdrop-blur-2xl"
    >
      {/* Mode Switcher */}
      <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5 mr-1">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setMode('music')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mode === 'music'
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm font-semibold shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Explore Artists & Songs"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Music</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setMode('youtube')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mode === 'youtube'
              ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-sm font-semibold shadow-purple-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Explore YouTube Channels & Videos"
        >
          <Tv className="w-3.5 h-3.5" />
          <span>YouTube</span>
        </motion.button>
      </div>

      <div className="h-5 w-[1px] bg-white/10 mx-1" />

      {/* Metric Mode Toggle */}
      <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setMetricMode('plays')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
            metricMode === 'plays'
              ? 'bg-white/15 text-white font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Scale celestial bodies by recorded play count"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Plays</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setMetricMode('duration')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
            metricMode === 'duration'
              ? 'bg-white/15 text-white font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Scale celestial bodies by estimated listening time"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Time</span>
        </motion.button>
      </div>

      <div className="h-5 w-[1px] bg-white/10 mx-1" />

      {/* Camera Reset */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleResetCamera}
        className="glass-button p-2 rounded-xl text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors"
        title="Reset Camera to Universe Center"
      >
        <RotateCcw className="w-4 h-4" />
      </motion.button>

      {/* Toggle Labels */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowLabels(!showLabels)}
        className={`p-2 rounded-xl border transition-all ${
          showLabels
            ? 'bg-white/15 border-white/25 text-cyan-300 shadow-sm shadow-cyan-500/20'
            : 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300'
        }`}
        title={showLabels ? 'Hide Floating Celestial Labels' : 'Show Floating Celestial Labels'}
      >
        {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </motion.button>

      {/* Toggle Motion */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setReducedMotion(!reducedMotion)}
        className={`p-2 rounded-xl border transition-all ${
          !reducedMotion
            ? 'bg-white/15 border-white/25 text-purple-300 shadow-sm shadow-purple-500/20'
            : 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300'
        }`}
        title={reducedMotion ? 'Enable Cosmic Motion' : 'Reduce Celestial Motion'}
      >
        <Sparkles className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
