import {
  NormalizedActivity,
  TakeoutRawItem,
  ArtistEntity,
  SongEntity,
  ChannelEntity,
  ImportJobSummary,
  UniverseAnalytics,
} from '@/types';
import {
  classifyAndExtractMetadata,
  cleanVideoTitle,
  estimateDuration,
  extractVideoId,
  getCelestialColor,
  normalizeArtistName,
} from './heuristics';

export interface ParseResult {
  summary: ImportJobSummary;
  activities: NormalizedActivity[];
  artists: ArtistEntity[];
  songs: SongEntity[];
  channels: ChannelEntity[];
  analytics: UniverseAnalytics;
}

/**
 * Parses Google Takeout watch-history.json format
 */
export function parseTakeoutJSON(rawJson: unknown[], existingIds?: Set<string>): ParseResult {
  const activities: NormalizedActivity[] = [];
  const seenKeys = existingIds || new Set<string>();

  let totalRecords = 0;
  let acceptedRecords = 0;
  let skippedDuplicates = 0;
  let rejectedRecords = 0;
  let musicRecords = 0;
  let videoRecords = 0;

  for (const item of rawJson) {
    totalRecords++;

    if (!item || typeof item !== 'object') {
      rejectedRecords++;
      continue;
    }

    const raw = item as Partial<TakeoutRawItem>;

    // Must have a title and time
    if (!raw.title || !raw.time) {
      rejectedRecords++;
      continue;
    }

    // Skip generic ad views or system messages
    if (raw.title.startsWith('Answered survey') || raw.title.startsWith('Story was viewed')) {
      rejectedRecords++;
      continue;
    }

    const timestamp = new Date(raw.time);
    if (isNaN(timestamp.getTime())) {
      rejectedRecords++;
      continue;
    }

    const videoId = extractVideoId(raw.titleUrl);
    const channelSub = raw.subtitles && raw.subtitles[0];
    const channelTitle = channelSub?.name || 'Unknown Channel';
    const channelUrl = channelSub?.url;

    // Deduplication Key: Video ID + Exact ISO timestamp
    const dedupKey = `${videoId || raw.title}_${raw.time}`;
    if (seenKeys.has(dedupKey)) {
      skippedDuplicates++;
      continue;
    }
    seenKeys.add(dedupKey);

    const { isMusic, cleanTitle, artistName } = classifyAndExtractMetadata(
      raw.title,
      channelTitle,
      raw.products || [],
      raw.details || []
    );

    const isExplicitYTM = (raw.products || []).some((p) => p.toLowerCase().includes('youtube music'));
    const sourcePlatform = isExplicitYTM ? 'youtube_music' : 'youtube';
    const estDurationSeconds = estimateDuration(isMusic);

    const normalized: NormalizedActivity = {
      id: `act_${activities.length + 1}_${Date.now()}`,
      sourceId: dedupKey,
      videoId,
      title: raw.title,
      cleanTitle,
      artistName,
      channelTitle,
      channelUrl,
      playbackUrl: raw.titleUrl,
      timestamp: raw.time,
      isMusic,
      sourcePlatform,
      estDurationSeconds,
    };

    activities.push(normalized);
    acceptedRecords++;
    if (isMusic) {
      musicRecords++;
    } else {
      videoRecords++;
    }
  }

  return buildUniverseState(activities, {
    id: `job_${Date.now()}`,
    source: 'takeout_json',
    status: 'completed',
    totalRecords,
    acceptedRecords,
    skippedDuplicates,
    rejectedRecords,
    musicRecords,
    videoRecords,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Parses Google Takeout watch-history.html format
 */
export function parseTakeoutHTML(htmlContent: string, existingIds?: Set<string>): ParseResult {
  const seenKeys = existingIds || new Set<string>();
  const activities: NormalizedActivity[] = [];

  let totalRecords = 0;
  let acceptedRecords = 0;
  let skippedDuplicates = 0;
  let rejectedRecords = 0;
  let musicRecords = 0;
  let videoRecords = 0;

  // Regex parser for Google Takeout HTML entries
  // Structure: Watched <a href="https://www.youtube.com/watch?v=...">Title</a><br><a href="...">Channel</a><br>Date
  const entryRegex = /Watched\s+<a\s+href="([^"]+)">([^<]+)<\/a>(?:\s*<br\s*\/?>\s*)?(?:<a\s+href="([^"]+)">([^<]+)<\/a>)?(?:\s*<br\s*\/?>\s*)?([^<]+)/gi;

  let match;
  while ((match = entryRegex.exec(htmlContent)) !== null) {
    totalRecords++;
    const [, titleUrl, rawTitle, channelUrl, rawChannelTitle, rawDateStr] = match;

    if (!rawTitle || !rawDateStr) {
      rejectedRecords++;
      continue;
    }

    const cleanDateStr = rawDateStr.replace(/<[^>]*>?/gm, '').trim();
    const timestamp = new Date(cleanDateStr);
    const isoTime = isNaN(timestamp.getTime()) ? new Date().toISOString() : timestamp.toISOString();

    const videoId = extractVideoId(titleUrl);
    const channelTitle = rawChannelTitle ? rawChannelTitle.trim() : 'Unknown Channel';

    const dedupKey = `${videoId || rawTitle}_${isoTime}`;
    if (seenKeys.has(dedupKey)) {
      skippedDuplicates++;
      continue;
    }
    seenKeys.add(dedupKey);

    const { isMusic, cleanTitle, artistName } = classifyAndExtractMetadata(
      rawTitle,
      channelTitle,
      [],
      []
    );

    const estDurationSeconds = estimateDuration(isMusic);

    const normalized: NormalizedActivity = {
      id: `act_${activities.length + 1}_${Date.now()}`,
      sourceId: dedupKey,
      videoId,
      title: rawTitle,
      cleanTitle,
      artistName,
      channelTitle,
      channelUrl,
      playbackUrl: titleUrl,
      timestamp: isoTime,
      isMusic,
      sourcePlatform: 'youtube',
      estDurationSeconds,
    };

    activities.push(normalized);
    acceptedRecords++;
    if (isMusic) {
      musicRecords++;
    } else {
      videoRecords++;
    }
  }

  return buildUniverseState(activities, {
    id: `job_${Date.now()}`,
    source: 'takeout_html',
    status: 'completed',
    totalRecords,
    acceptedRecords,
    skippedDuplicates,
    rejectedRecords,
    musicRecords,
    videoRecords,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Aggregates normalized activities into Artists, Songs, Channels, Streaks and Analytics
 */
export function buildUniverseState(
  activities: NormalizedActivity[],
  summary: ImportJobSummary
): ParseResult {
  // Sort activities chronologically ascending
  activities.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const artistMap = new Map<string, ArtistEntity>();
  const songMap = new Map<string, SongEntity>();
  const channelMap = new Map<string, ChannelEntity>();

  const dailyCountMap: Record<string, number> = {};
  const monthlyMap: Record<string, { music: number; video: number }> = {};
  const yearlyMap: Record<number, { total: number; music: number; video: number; estHours: number; artists: Record<string, number>; tracks: Record<string, number>; monthly: number[] }> = {};

  let totalEstDurationSeconds = 0;

  for (const act of activities) {
    totalEstDurationSeconds += act.estDurationSeconds;

    const dateObj = new Date(act.timestamp);
    const dayKey = act.timestamp.slice(0, 10); // YYYY-MM-DD
    const monthKey = act.timestamp.slice(0, 7); // YYYY-MM
    const year = dateObj.getFullYear();
    const monthIndex = dateObj.getMonth();

    // Streak / Daily Counts
    dailyCountMap[dayKey] = (dailyCountMap[dayKey] || 0) + 1;

    // Monthly
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { music: 0, video: 0 };
    }
    if (act.isMusic) {
      monthlyMap[monthKey].music++;
    } else {
      monthlyMap[monthKey].video++;
    }

    // Yearly
    if (!yearlyMap[year]) {
      yearlyMap[year] = {
        total: 0,
        music: 0,
        video: 0,
        estHours: 0,
        artists: {},
        tracks: {},
        monthly: new Array(12).fill(0),
      };
    }
    yearlyMap[year].total++;
    yearlyMap[year].monthly[monthIndex]++;
    yearlyMap[year].estHours += act.estDurationSeconds / 3600;

    if (act.isMusic) {
      yearlyMap[year].music++;
      yearlyMap[year].artists[act.artistName] = (yearlyMap[year].artists[act.artistName] || 0) + 1;
      yearlyMap[year].tracks[act.cleanTitle] = (yearlyMap[year].tracks[act.cleanTitle] || 0) + 1;
    } else {
      yearlyMap[year].video++;
    }

    // Process Music: Artists & Songs
    if (act.isMusic) {
      const normArtist = normalizeArtistName(act.artistName);
      let artist = artistMap.get(normArtist);
      if (!artist) {
        artist = {
          id: `art_${artistMap.size + 1}`,
          name: act.artistName,
          normalizedName: normArtist,
          channelUrl: act.channelUrl,
          color: getCelestialColor(act.artistName),
          totalPlays: 0,
          estDurationSeconds: 0,
          firstSeenAt: act.timestamp,
          lastSeenAt: act.timestamp,
          topTracks: [],
          yearlyPlays: {},
        };
        artistMap.set(normArtist, artist);
      }
      artist.totalPlays++;
      artist.estDurationSeconds += act.estDurationSeconds;
      artist.lastSeenAt = act.timestamp;
      artist.yearlyPlays[year] = (artist.yearlyPlays[year] || 0) + 1;

      // Song Map
      const songKey = `${normArtist}___${act.cleanTitle.toLowerCase()}`;
      let song = songMap.get(songKey);
      if (!song) {
        song = {
          id: `song_${songMap.size + 1}`,
          artistId: artist.id,
          artistName: artist.name,
          videoId: act.videoId,
          title: act.title,
          cleanTitle: act.cleanTitle,
          channelTitle: act.channelTitle,
          playbackUrl: act.playbackUrl,
          totalPlays: 0,
          estDurationSeconds: 0,
          firstSeenAt: act.timestamp,
          lastSeenAt: act.timestamp,
          isMusic: true,
          yearlyPlays: {},
        };
        songMap.set(songKey, song);
      }
      song.totalPlays++;
      song.estDurationSeconds += act.estDurationSeconds;
      song.lastSeenAt = act.timestamp;
      if (!song.yearlyPlays) song.yearlyPlays = {};
      song.yearlyPlays[year] = (song.yearlyPlays[year] || 0) + 1;
    }

    // Process General YouTube Video Channels
    const chanKey = act.channelTitle.toLowerCase();
    let channel = channelMap.get(chanKey);
    if (!channel) {
      channel = {
        id: `chan_${channelMap.size + 1}`,
        name: act.channelTitle,
        channelUrl: act.channelUrl,
        totalViews: 0,
        firstSeenAt: act.timestamp,
        lastSeenAt: act.timestamp,
        topVideos: [],
      };
      channelMap.set(chanKey, channel);
    }
    channel.totalViews++;
    channel.lastSeenAt = act.timestamp;
  }

  // Populate topTracks for each artist
  const allSongs = Array.from(songMap.values());
  for (const artist of artistMap.values()) {
    artist.topTracks = allSongs
      .filter((s) => s.artistName.toLowerCase() === artist.name.toLowerCase())
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 10);
  }

  // Calculate Streaks
  const sortedDates = Object.keys(dailyCountMap).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;
  let busiestDay = { date: '', count: 0 };

  for (const dateStr of sortedDates) {
    const curDate = new Date(dateStr);
    const count = dailyCountMap[dateStr];
    if (count > busiestDay.count) {
      busiestDay = { date: dateStr, count };
    }

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(curDate.getTime() - prevDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = curDate;
  }
  currentStreak = tempStreak;

  // Convert Yearly map
  const yearlyAnalytics = Object.entries(yearlyMap).map(([yearStr, val]) => {
    const year = Number(yearStr);
    let topArtistName = '';
    let maxArtistPlays = 0;
    for (const [art, plays] of Object.entries(val.artists)) {
      if (plays > maxArtistPlays) {
        maxArtistPlays = plays;
        topArtistName = art;
      }
    }

    let topTrackName = '';
    let maxTrackPlays = 0;
    for (const [trk, plays] of Object.entries(val.tracks)) {
      if (plays > maxTrackPlays) {
        maxTrackPlays = plays;
        topTrackName = trk;
      }
    }

    return {
      year,
      totalPlays: val.total,
      musicPlays: val.music,
      videoPlays: val.video,
      topArtist: topArtistName || undefined,
      topTrack: topTrackName || undefined,
      estHours: Math.round(val.estHours * 10) / 10,
      monthlyCounts: val.monthly,
    };
  }).sort((a, b) => a.year - b.year);

  // Convert Monthly Distribution
  const monthlyDistribution = Object.entries(monthlyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, counts]) => ({
      month,
      music: counts.music,
      video: counts.video,
    }));

  const startDate = activities.length > 0 ? activities[0].timestamp : undefined;
  const endDate = activities.length > 0 ? activities[activities.length - 1].timestamp : undefined;

  summary.startDate = startDate;
  summary.endDate = endDate;

  // Artists sorted by activity descending
  const sortedArtists = Array.from(artistMap.values()).sort(
    (a, b) => b.totalPlays - a.totalPlays
  );

  // Assign spatial coordinates in 3D universe for Artists
  // Spiral galaxy distribution based on golden ratio
  sortedArtists.forEach((artist, index) => {
    const angle = index * 2.39996; // Golden angle in radians
    const radius = 15 + Math.sqrt(index) * 12;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.sin(index * 0.5) * 8) - 4;

    artist.position = [x, y, z];
    // Logarithmic size: 1.0 to 4.5 based on plays
    artist.size = Math.min(4.5, Math.max(1.0, Math.log10(artist.totalPlays + 1) * 1.6));
  });

  // Assign spatial coordinates for Channels
  const sortedChannels = Array.from(channelMap.values()).sort((a, b) => b.totalViews - a.totalViews);
  sortedChannels.forEach((channel, index) => {
    const angle = index * 2.39996;
    const radius = 20 + Math.sqrt(index) * 14;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.cos(index * 0.4) * 10) - 5;

    channel.position = [x, y, z];
    channel.size = Math.min(5.0, Math.max(1.2, Math.log10(channel.totalViews + 1) * 1.7));
  });

  const analytics: UniverseAnalytics = {
    totalActivityCount: activities.length,
    musicCount: summary.musicRecords,
    videoCount: summary.videoRecords,
    uniqueArtistsCount: artistMap.size,
    uniqueTracksCount: songMap.size,
    uniqueChannelsCount: channelMap.size,
    totalEstHours: Math.round((totalEstDurationSeconds / 3600) * 10) / 10,
    dateRange: {
      start: startDate || '',
      end: endDate || '',
    },
    streak: {
      currentStreak,
      longestStreak,
      activeDaysCount: sortedDates.length,
      totalDaysSpan: sortedDates.length,
      streakCalendar: dailyCountMap,
      busiestDay: busiestDay.date ? busiestDay : undefined,
    },
    yearly: yearlyAnalytics,
    monthlyDistribution,
  };

  return {
    summary,
    activities,
    artists: sortedArtists,
    songs: allSongs.sort((a, b) => b.totalPlays - a.totalPlays),
    channels: sortedChannels,
    analytics,
  };
}
