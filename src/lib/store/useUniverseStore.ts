'use client';

import { create } from 'zustand';
import {
  ArtistEntity,
  SongEntity,
  ChannelEntity,
  NormalizedActivity,
  UniverseAnalytics,
  ImportJobSummary,
  UniverseMode,
  MetricMode,
  GraphicsQuality,
  TimeFilter,
} from '@/types';
import { parseTakeoutJSON, ParseResult } from '../parser/takeout-parser';
import { SAMPLE_TAKEOUT_DATA } from '../data/sample-dataset';
import { getUniverseStateForTimeFilter } from '../parser/time-filter';

export interface UserSession {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isDemo?: boolean;
}

export type SelectedUniverseObject =
  | { type: 'artist'; data: ArtistEntity }
  | { type: 'song'; data: SongEntity }
  | { type: 'channel'; data: ChannelEntity };

interface UniverseState {
  user: UserSession | null;
  mode: UniverseMode;
  timeFilter: TimeFilter;
  metricMode: MetricMode;
  graphicsQuality: GraphicsQuality;
  reducedMotion: boolean;
  showLabels: boolean;
  selectedObject: SelectedUniverseObject | null;
  focusedTarget: [number, number, number] | null;
  searchQuery: string;

  // Unfiltered original dataset
  allActivities: NormalizedActivity[];
  baseResult: ParseResult | null;

  // Filtered dataset currently displayed in the 3D scene & UI
  activities: NormalizedActivity[];
  artists: ArtistEntity[];
  songs: SongEntity[];
  channels: ChannelEntity[];
  analytics: UniverseAnalytics | null;
  importSummary: ImportJobSummary | null;
  isInitialized: boolean;
  isProcessing: boolean;

  // Actions
  setUser: (user: UserSession | null) => void;
  setMode: (mode: UniverseMode) => void;
  setTimeFilter: (filter: TimeFilter) => void;
  setMetricMode: (metric: MetricMode) => void;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  setReducedMotion: (reduced: boolean) => void;
  setShowLabels: (show: boolean) => void;
  selectObject: (obj: SelectedUniverseObject | null) => void;
  clearSelection: () => void;
  setFocusedTarget: (target: [number, number, number] | null) => void;
  setSearchQuery: (query: string) => void;

  loadSampleData: () => void;
  loadParsedData: (result: ParseResult) => void;
  wipeAllData: () => void;
  initFromStorage: () => void;
}

const STORAGE_KEY = 'verse_universe_storage_v1';

export const useUniverseStore = create<UniverseState>((set, get) => ({
  user: null,
  mode: 'music',
  timeFilter: 'all',
  metricMode: 'plays',
  graphicsQuality: 'high',
  reducedMotion: false,
  showLabels: true,
  selectedObject: null,
  focusedTarget: null,
  searchQuery: '',

  allActivities: [],
  baseResult: null,

  activities: [],
  artists: [],
  songs: [],
  channels: [],
  analytics: null,
  importSummary: null,
  isInitialized: false,
  isProcessing: false,

  setUser: (user) => {
    set({ user });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('verse_user_session', JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    }
  },

  setMode: (mode) => set({ mode, selectedObject: null, focusedTarget: null }),

  setTimeFilter: (timeFilter) => {
    const { allActivities, baseResult } = get();
    if (allActivities.length === 0) {
      set({ timeFilter });
      return;
    }

    const filtered = getUniverseStateForTimeFilter(allActivities, timeFilter, baseResult || undefined);
    set({
      timeFilter,
      activities: filtered.activities,
      artists: filtered.artists,
      songs: filtered.songs,
      channels: filtered.channels,
      analytics: filtered.analytics,
      selectedObject: null,
      focusedTarget: null,
    });
  },

  setMetricMode: (metricMode) => set({ metricMode }),
  setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setShowLabels: (showLabels) => set({ showLabels }),
  selectObject: (selectedObject) => set({ selectedObject }),
  clearSelection: () => set({ selectedObject: null }),
  setFocusedTarget: (focusedTarget) => set({ focusedTarget }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  loadSampleData: () => {
    set({ isProcessing: true });
    try {
      const result = parseTakeoutJSON(SAMPLE_TAKEOUT_DATA);
      const demoUser: UserSession = {
        id: 'usr_demo_cosmic',
        email: 'traveler@verseuniverse.space',
        displayName: 'Cosmic Explorer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        isDemo: true,
      };

      const currentFilter = get().timeFilter;
      const filtered = getUniverseStateForTimeFilter(result.activities, currentFilter, result);

      set({
        user: get().user || demoUser,
        allActivities: result.activities,
        baseResult: result,
        activities: filtered.activities,
        artists: filtered.artists,
        songs: filtered.songs,
        channels: filtered.channels,
        analytics: filtered.analytics,
        importSummary: result.summary,
        isProcessing: false,
        isInitialized: true,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            allActivities: result.activities,
            activities: result.activities,
            artists: result.artists,
            songs: result.songs,
            channels: result.channels,
            analytics: result.analytics,
            importSummary: result.summary,
          })
        );
      }
    } catch (err) {
      console.error('Failed to load sample data:', err);
      set({ isProcessing: false });
    }
  },

  loadParsedData: (result: ParseResult) => {
    const currentFilter = get().timeFilter;
    const filtered = getUniverseStateForTimeFilter(result.activities, currentFilter, result);

    set({
      allActivities: result.activities,
      baseResult: result,
      activities: filtered.activities,
      artists: filtered.artists,
      songs: filtered.songs,
      channels: filtered.channels,
      analytics: filtered.analytics,
      importSummary: result.summary,
      isInitialized: true,
      selectedObject: null,
      focusedTarget: null,
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            allActivities: result.activities,
            activities: result.activities,
            artists: result.artists,
            songs: result.songs,
            channels: result.channels,
            analytics: result.analytics,
            importSummary: result.summary,
          })
        );
      } catch (err) {
        console.warn('Storage quota warning when caching data:', err);
      }
    }
  },

  wipeAllData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('verse_user_session');
      localStorage.removeItem('google_yt_provider_token');
      localStorage.removeItem('verse_has_synced_real_data');
    }
    set({
      allActivities: [],
      baseResult: null,
      activities: [],
      artists: [],
      songs: [],
      channels: [],
      analytics: null,
      importSummary: null,
      selectedObject: null,
      focusedTarget: null,
      user: null,
    });
  },

  initFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const savedUserStr = localStorage.getItem('verse_user_session');
      let isRealUser = false;
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        set({ user: parsed });
        isRealUser = !parsed?.isDemo;
      }

      const savedDataStr = localStorage.getItem(STORAGE_KEY);
      if (savedDataStr) {
        const data = JSON.parse(savedDataStr);
        const allActs: NormalizedActivity[] = data.allActivities || data.activities || [];
        const baseRes: ParseResult = {
          summary: data.importSummary || {
            id: 'job_cached',
            source: 'demo',
            status: 'completed',
            totalRecords: allActs.length,
            acceptedRecords: allActs.length,
            skippedDuplicates: 0,
            rejectedRecords: 0,
            musicRecords: allActs.filter((a) => a.isMusic).length,
            videoRecords: allActs.filter((a) => !a.isMusic).length,
          },
          activities: allActs,
          artists: data.artists || [],
          songs: data.songs || [],
          channels: data.channels || [],
          analytics: data.analytics || null,
        };

        const currentFilter = get().timeFilter;
        const filtered = getUniverseStateForTimeFilter(allActs, currentFilter, baseRes);

        set({
          allActivities: allActs,
          baseResult: baseRes,
          activities: filtered.activities,
          artists: filtered.artists,
          songs: filtered.songs,
          channels: filtered.channels,
          analytics: filtered.analytics,
          importSummary: data.importSummary || null,
          isInitialized: true,
        });
      } else if (!isRealUser) {
        get().loadSampleData();
      }
    } catch (e) {
      console.error('Error initializing from storage:', e);
    }
  },
}));
