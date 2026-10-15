import { z } from 'zod';

// Raw item schema from Google Takeout watch-history.json
export const TakeoutSubtitleSchema = z.object({
  name: z.string().optional(),
  url: z.string().optional(),
});

export const TakeoutRawItemSchema = z.object({
  header: z.string().optional(),
  title: z.string(),
  titleUrl: z.string().optional(),
  subtitles: z.array(TakeoutSubtitleSchema).optional(),
  time: z.string(),
  products: z.array(z.string()).optional(),
  details: z.array(z.object({ name: z.string().optional() })).optional(),
});

export type TakeoutRawItem = z.infer<typeof TakeoutRawItemSchema>;

export type SourcePlatform = 'youtube_music' | 'youtube';

export interface NormalizedActivity {
  id: string;
  sourceId: string;
  videoId?: string;
  title: string;
  cleanTitle: string;
  artistName: string;
  channelTitle: string;
  channelUrl?: string;
  playbackUrl?: string;
  timestamp: string; // ISO string
  isMusic: boolean;
  sourcePlatform: SourcePlatform;
  estDurationSeconds: number; // e.g. 210s for music tracks unless known
}

export interface SongEntity {
  id: string;
  artistId?: string;
  artistName: string;
  videoId?: string;
  title: string;
  cleanTitle: string;
  channelTitle: string;
  playbackUrl?: string;
  totalPlays: number;
  estDurationSeconds: number;
  firstSeenAt: string;
  lastSeenAt: string;
  isMusic: boolean;
  yearlyPlays?: Record<number, number>;
}

export interface ArtistEntity {
  id: string;
  name: string;
  normalizedName: string;
  channelUrl?: string;
  color: string;
  totalPlays: number;
  estDurationSeconds: number;
  firstSeenAt: string;
  lastSeenAt: string;
  topTracks: SongEntity[];
  yearlyPlays: Record<number, number>;
  // Spatial coordinates in 3D universe
  position?: [number, number, number];
  size?: number;
}

export interface ChannelEntity {
  id: string;
  name: string;
  channelUrl?: string;
  totalViews: number;
  firstSeenAt: string;
  lastSeenAt: string;
  topVideos: SongEntity[];
  position?: [number, number, number];
  size?: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  activeDaysCount: number;
  totalDaysSpan: number;
  streakCalendar: Record<string, number>; // "YYYY-MM-DD" -> count
  busiestDay?: { date: string; count: number };
}

export interface YearlyAnalytics {
  year: number;
  totalPlays: number;
  musicPlays: number;
  videoPlays: number;
  topArtist?: string;
  topTrack?: string;
  estHours: number;
  monthlyCounts: number[]; // 12 months index 0-11
}

export interface UniverseAnalytics {
  totalActivityCount: number;
  musicCount: number;
  videoCount: number;
  uniqueArtistsCount: number;
  uniqueTracksCount: number;
  uniqueChannelsCount: number;
  totalEstHours: number;
  dateRange: {
    start: string;
    end: string;
  };
  streak: StreakInfo;
  yearly: YearlyAnalytics[];
  monthlyDistribution: { month: string; music: number; video: number }[];
}

export interface ImportJobSummary {
  id: string;
  source: 'takeout_json' | 'takeout_html' | 'demo';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  acceptedRecords: number;
  skippedDuplicates: number;
  rejectedRecords: number;
  musicRecords: number;
  videoRecords: number;
  startDate?: string;
  endDate?: string;
  errorMessage?: string;
  completedAt?: string;
}

export type UniverseMode = 'music' | 'youtube';
export type MetricMode = 'plays' | 'duration';
export type GraphicsQuality = 'ultra' | 'high' | 'medium' | 'low';
export type TimeFilter = 'all' | '30d' | '3m' | '6m' | '1y' | string;
