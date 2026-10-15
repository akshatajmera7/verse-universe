import { describe, it, expect } from 'vitest';
import {
  parseTakeoutJSON,
  parseTakeoutHTML,
  buildUniverseState,
} from '../lib/parser/takeout-parser';
import {
  classifyAndExtractMetadata,
  cleanVideoTitle,
  estimateDuration,
  extractVideoId,
  normalizeArtistName,
} from '../lib/parser/heuristics';
import { TakeoutRawItem } from '../types';

describe('Heuristics & Normalization', () => {
  it('extracts YouTube video IDs accurately', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=5NV6Rdv1a3I')).toBe('5NV6Rdv1a3I');
    expect(extractVideoId('https://youtu.be/FGBhQbmPwH8')).toBe('FGBhQbmPwH8');
    expect(extractVideoId('https://www.youtube.com/shorts/34Na4j8AVgA')).toBe('34Na4j8AVgA');
    expect(extractVideoId(undefined)).toBeUndefined();
  });

  it('cleans noisy video titles', () => {
    expect(cleanVideoTitle('Watched Get Lucky (Official Audio)')).toBe('Get Lucky');
    expect(cleanVideoTitle('Watched Blinding Lights (Official Music Video)')).toBe('Blinding Lights');
    expect(cleanVideoTitle('Watched Instant Crush [Official Video]')).toBe('Instant Crush');
    expect(cleanVideoTitle('Watched Starboy [HD]')).toBe('Starboy');
  });

  it('classifies YouTube Music artist topics correctly', () => {
    const result = classifyAndExtractMetadata(
      'Watched Get Lucky',
      'Daft Punk - Topic',
      ['YouTube Music']
    );
    expect(result.isMusic).toBe(true);
    expect(result.artistName).toBe('Daft Punk');
    expect(result.cleanTitle).toBe('Get Lucky');
  });

  it('classifies VEVO channels correctly', () => {
    const result = classifyAndExtractMetadata(
      'Watched Blinding Lights',
      'The Weeknd VEVO',
      []
    );
    expect(result.isMusic).toBe(true);
    expect(result.artistName).toBe('The Weeknd');
  });

  it('normalizes artist names for case-insensitive grouping', () => {
    expect(normalizeArtistName('Daft Punk')).toBe('daft punk');
    expect(normalizeArtistName('  DAFT PUNK! ')).toBe('daft punk');
  });

  it('estimates duration based on media type', () => {
    expect(estimateDuration(true)).toBe(210); // 3.5 min
    expect(estimateDuration(false)).toBe(360); // 6 min
    expect(estimateDuration(true, 180)).toBe(180); // explicit duration preserved
  });
});

describe('Takeout JSON Parser & Deduplication', () => {
  const sampleItems: TakeoutRawItem[] = [
    {
      header: 'YouTube Music',
      title: 'Watched Get Lucky',
      titleUrl: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
      subtitles: [{ name: 'Daft Punk - Topic', url: 'https://www.youtube.com/channel/UC_daftpunk' }],
      time: '2024-01-12T08:15:00.000Z',
      products: ['YouTube Music'],
    },
    // Duplicate of first item
    {
      header: 'YouTube Music',
      title: 'Watched Get Lucky',
      titleUrl: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
      subtitles: [{ name: 'Daft Punk - Topic', url: 'https://www.youtube.com/channel/UC_daftpunk' }],
      time: '2024-01-12T08:15:00.000Z',
      products: ['YouTube Music'],
    },
    // Different timestamp (distinct play event)
    {
      header: 'YouTube Music',
      title: 'Watched Get Lucky',
      titleUrl: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
      subtitles: [{ name: 'Daft Punk - Topic', url: 'https://www.youtube.com/channel/UC_daftpunk' }],
      time: '2024-01-13T09:00:00.000Z',
      products: ['YouTube Music'],
    },
    // Non-music YouTube video
    {
      header: 'YouTube',
      title: 'Watched The Black Hole Bomb',
      titleUrl: 'https://www.youtube.com/watch?v=ulCdoCjz-mM',
      subtitles: [{ name: 'Kurzgesagt – In a Nutshell', url: 'https://www.youtube.com/channel/UCsXVk37bltHxD1rDPwtNM8Q' }],
      time: '2024-01-14T15:00:00.000Z',
      products: ['YouTube'],
    },
  ];

  it('correctly deduplicates identical records and counts metrics', () => {
    const result = parseTakeoutJSON(sampleItems);

    expect(result.summary.totalRecords).toBe(4);
    expect(result.summary.acceptedRecords).toBe(3);
    expect(result.summary.skippedDuplicates).toBe(1);
    expect(result.summary.musicRecords).toBe(2);
    expect(result.summary.videoRecords).toBe(1);

    // Verify Daft Punk total plays
    const daftPunk = result.artists.find((a) => a.name === 'Daft Punk');
    expect(daftPunk).toBeDefined();
    expect(daftPunk?.totalPlays).toBe(2);
  });

  it('calculates streaks across consecutive active days', () => {
    const result = parseTakeoutJSON(sampleItems);
    // Activities occur on Jan 12, Jan 13, Jan 14 -> Consecutive streak of 3 days
    expect(result.analytics.streak.currentStreak).toBe(3);
    expect(result.analytics.streak.longestStreak).toBe(3);
    expect(result.analytics.streak.activeDaysCount).toBe(3);
  });
});

describe('Takeout HTML Parser', () => {
  it('parses Google Takeout HTML watch-history snippet', () => {
    const htmlSnippet = `
      <div class="outer-cell mdl-cell mdl-cell--12-col mdl-shadow--2dp">
        <div class="content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1">
          Watched <a href="https://www.youtube.com/watch?v=5NV6Rdv1a3I">Daft Punk - Get Lucky</a><br>
          <a href="https://www.youtube.com/channel/UC_daftpunk">Daft Punk - Topic</a><br>
          Jan 12, 2024, 8:15:00 AM UTC
        </div>
      </div>
    `;

    const result = parseTakeoutHTML(htmlSnippet);
    expect(result.summary.acceptedRecords).toBe(1);
    expect(result.activities[0].cleanTitle).toBe('Get Lucky');
    expect(result.activities[0].artistName).toBe('Daft Punk');
    expect(result.activities[0].isMusic).toBe(true);
  });
});

describe('Empty dataset handling', () => {
  it('handles empty input gracefully without crashing', () => {
    const result = parseTakeoutJSON([]);
    expect(result.summary.totalRecords).toBe(0);
    expect(result.activities.length).toBe(0);
    expect(result.artists.length).toBe(0);
    expect(result.analytics.totalActivityCount).toBe(0);
    expect(result.analytics.streak.currentStreak).toBe(0);
  });
});

describe('Dynamic Time Filtering', () => {
  const baseNow = new Date('2024-10-01T12:00:00Z').getTime();
  const mockActivities = [
    {
      id: '1',
      sourceId: '1',
      title: 'Track A',
      cleanTitle: 'Track A',
      artistName: 'Artist One',
      channelTitle: 'Artist One',
      timestamp: new Date(baseNow - 10 * 86400000).toISOString(), // 10 days ago (in 30d, 3m, 6m, 1y)
      isMusic: true,
      sourcePlatform: 'youtube_music' as const,
      estDurationSeconds: 210,
    },
    {
      id: '2',
      sourceId: '2',
      title: 'Track B',
      cleanTitle: 'Track B',
      artistName: 'Artist Two',
      channelTitle: 'Artist Two',
      timestamp: new Date(baseNow - 45 * 86400000).toISOString(), // 45 days ago (in 3m, 6m, 1y)
      isMusic: true,
      sourcePlatform: 'youtube_music' as const,
      estDurationSeconds: 210,
    },
    {
      id: '3',
      sourceId: '3',
      title: 'Track C',
      cleanTitle: 'Track C',
      artistName: 'Artist Three',
      channelTitle: 'Artist Three',
      timestamp: new Date(baseNow - 120 * 86400000).toISOString(), // 120 days ago (in 6m, 1y)
      isMusic: true,
      sourcePlatform: 'youtube_music' as const,
      estDurationSeconds: 210,
    },
    {
      id: '4',
      sourceId: '4',
      title: 'Track D',
      cleanTitle: 'Track D',
      artistName: 'Artist Four',
      channelTitle: 'Artist Four',
      timestamp: new Date(baseNow - 300 * 86400000).toISOString(), // 300 days ago (in 1y)
      isMusic: true,
      sourcePlatform: 'youtube_music' as const,
      estDurationSeconds: 210,
    },
    {
      id: '5',
      sourceId: '5',
      title: 'Track E',
      cleanTitle: 'Track E',
      artistName: 'Artist Five',
      channelTitle: 'Artist Five',
      timestamp: new Date(baseNow - 500 * 86400000).toISOString(), // 500 days ago (all time only)
      isMusic: true,
      sourcePlatform: 'youtube_music' as const,
      estDurationSeconds: 210,
    },
  ];

  it('filters activities accurately by relative windows', async () => {
    const { filterActivitiesByTime } = await import('../lib/parser/time-filter');

    const in30d = filterActivitiesByTime(mockActivities, '30d');
    expect(in30d.length).toBe(1);
    expect(in30d[0].cleanTitle).toBe('Track A');

    const in3m = filterActivitiesByTime(mockActivities, '3m');
    expect(in3m.length).toBe(2);

    const in6m = filterActivitiesByTime(mockActivities, '6m');
    expect(in6m.length).toBe(3);

    const in1y = filterActivitiesByTime(mockActivities, '1y');
    expect(in1y.length).toBe(4);

    const all = filterActivitiesByTime(mockActivities, 'all');
    expect(all.length).toBe(5);
  });
});
