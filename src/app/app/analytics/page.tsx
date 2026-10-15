'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/hud/TopNav';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Flame,
  Clock,
  Music2,
  Tv,
  Calendar,
  Sparkles,
  Info,
  TrendingUp,
  Disc3,
  ArrowRight,
} from 'lucide-react';
import { TIME_FILTER_OPTIONS } from '@/lib/parser/time-filter';

export default function AnalyticsPage() {
  const {
    analytics,
    artists,
    songs,
    timeFilter,
    setTimeFilter,
    isInitialized,
    initFromStorage,
    loadSampleData,
  } = useUniverseStore();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  if (!analytics || analytics.totalActivityCount === 0) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col">
        <TopNav />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Listening History to Analyze</h2>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            Import your Google Takeout history or test with sample data to generate comprehensive stats and timelines.
          </p>
          <div className="flex gap-3">
            <Link
              href="/app/import"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all"
            >
              Import File
            </Link>
            <button
              onClick={loadSampleData}
              className="px-4 py-2 rounded-xl glass-button text-white text-xs font-medium"
            >
              Load Sample Universe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Distribution Data for Pie Chart
  const pieData = [
    { name: 'Music', value: analytics.musicCount, color: '#06b6d4' },
    { name: 'YouTube Video', value: analytics.videoCount, color: '#a855f7' },
  ];

  // Top 8 Artists for Bar Chart
  const topArtistsData = artists.slice(0, 8).map((a) => ({
    name: a.name,
    plays: a.totalPlays,
  }));

  // Activity Heatmap representation (Active days grouped by 7-day columns)
  const streakCalendar = analytics.streak.streakCalendar;
  const recentDays = Object.entries(streakCalendar).slice(-70);

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col pb-16">
      <TopNav />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Title & Date Span Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Listening Analytics</h1>
            <p className="text-slate-400 text-xs mt-1">
              Data-driven insights calculated from {analytics.totalActivityCount} recorded activity entries.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10 text-xs">
              {TIME_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setTimeFilter(opt.key)}
                  title={opt.description}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${
                    timeFilter === opt.key
                      ? 'bg-cyan-500/25 text-cyan-200 font-semibold border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Link
              href="/app"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <span>Back to 3D Universe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top 4 Key Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Activity</span>
              <Disc3 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {analytics.totalActivityCount}
            </div>
            <div className="text-[11px] text-slate-500">
              {analytics.musicCount} music, {analytics.videoCount} video
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Current Streak</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300">
              {analytics.streak.currentStreak} Days
            </div>
            <div className="text-[11px] text-slate-500">
              Longest: {analytics.streak.longestStreak} days
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Unique Artists</span>
              <Music2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-300">
              {analytics.uniqueArtistsCount}
            </div>
            <div className="text-[11px] text-slate-500">
              Across {analytics.uniqueTracksCount} unique tracks
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Est. Listening Time</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-300">
              ~{analytics.totalEstHours}h
            </div>
            <div className="text-[11px] text-slate-500">Based on ~3.5m/play heuristic</div>
          </div>
        </div>

        {/* Monthly Activity Area Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Monthly Activity Timeline</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Activity volume by month</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthlyDistribution}>
                <defs>
                  <linearGradient id="musicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="videoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="music"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#musicGrad)"
                  name="Music Plays"
                />
                <Area
                  type="monotone"
                  dataKey="video"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#videoGrad)"
                  name="YouTube Videos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row: Top Artists Bar Chart & Music vs Video Pie Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Artists (2 cols) */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-purple-400" />
              <span>Top Artists by Plays</span>
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topArtistsData} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#cbd5e1"
                    fontSize={11}
                    width={110}
                    tick={{ fill: '#cbd5e1' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="plays" fill="#06b6d4" radius={[0, 6, 6, 0]} name="Plays" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ratio Pie (1 col) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
            <h3 className="text-base font-bold text-white">Music vs Video Ratio</h3>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Music
                </span>
                <span className="font-mono font-bold text-cyan-300">
                  {Math.round((analytics.musicCount / analytics.totalActivityCount) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> YouTube Videos
                </span>
                <span className="font-mono font-bold text-purple-300">
                  {Math.round((analytics.videoCount / analytics.totalActivityCount) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Listening Activity Heatmap */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Listening Activity Calendar Grid</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily recorded playback frequency. Darker tiles represent denser listening sessions.
              </p>
            </div>
            {analytics.streak.busiestDay && (
              <div className="text-xs text-slate-300 font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                Peak Day: <strong>{analytics.streak.busiestDay.date}</strong> ({analytics.streak.busiestDay.count} plays)
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {recentDays.map(([dateStr, count]) => {
              const intensity =
                count >= 8
                  ? 'bg-cyan-400 text-black'
                  : count >= 5
                  ? 'bg-cyan-600 text-white'
                  : count >= 2
                  ? 'bg-cyan-900/80 text-cyan-200'
                  : 'bg-slate-900 border border-white/10 text-slate-400';

              return (
                <div
                  key={dateStr}
                  title={`${dateStr}: ${count} activity events`}
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-mono cursor-default transition-transform hover:scale-125 ${intensity}`}
                >
                  {count}
                </div>
              );
            })}
          </div>
        </div>

        {/* Yearly Taste Evolution Table */}
        {analytics.yearly.length > 0 && (
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">Year-over-Year Taste Evolution</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[11px]">
                    <th className="pb-3">Year</th>
                    <th className="pb-3">Total Activity</th>
                    <th className="pb-3">Top Artist</th>
                    <th className="pb-3">Top Track</th>
                    <th className="pb-3">Est. Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {analytics.yearly.map((yr) => (
                    <tr key={yr.year} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono font-bold text-cyan-300">{yr.year}</td>
                      <td className="py-3 font-mono">{yr.totalPlays}</td>
                      <td className="py-3 text-slate-200">{yr.topArtist || '—'}</td>
                      <td className="py-3 text-slate-300">{yr.topTrack || '—'}</td>
                      <td className="py-3 font-mono text-emerald-400">~{yr.estHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data Integrity Transparency Box */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 flex items-start gap-3 text-xs text-cyan-300/80 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-cyan-200 font-semibold mb-0.5">
              Data Integrity &amp; Duration Disclosure
            </strong>
            YouTube Takeout logs record playback initiation events (when a video or song started playing), but does not guarantee the track was played from start to finish. All duration statistics are estimated using a standard 3.5 minute/track median for music and labeled accordingly.
          </div>
        </div>
      </main>
    </div>
  );
}
