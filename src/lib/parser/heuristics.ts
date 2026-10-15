/**
 * Heuristics and normalization for YouTube and YouTube Music activity
 */

const PALETTE = [
  '#06b6d4', // cyan
  '#8b5cf6', // purple
  '#ec4899', // magenta
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f43f5e', // coral
  '#a855f7', // violet
  '#eab308', // gold
];

export function getCelestialColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

export function extractVideoId(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    // Handle youtube.com/watch?v=ID
    const match = url.match(/(?:v=|\/embed\/|\/watch\?v=|\/v\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
}

export function cleanVideoTitle(rawTitle: string): string {
  let title = rawTitle.trim();

  // Remove Takeout prefixes: "Watched ", "A regardé ", etc.
  title = title.replace(/^watched\s+/i, '');
  title = title.replace(/^(?:a regardé|hat|visto|ha guardato)\s+/i, '');

  // Remove common noisy video suffixes
  title = title
    .replace(/\s*\(official (?:music )?(?:video|audio|lyric video|visualizer)\)/gi, '')
    .replace(/\s*\[official (?:music )?(?:video|audio|lyric video|visualizer|hd)\]/gi, '')
    .replace(/\s*\(lyrics?\)/gi, '')
    .replace(/\s*\[lyrics?\]/gi, '')
    .replace(/\s*\(visualizer\)/gi, '')
    .replace(/\s*\(audio\)/gi, '')
    .replace(/\s*\[hd\]/gi, '')
    .replace(/\s*\(live\)/gi, '')
    .replace(/\s*\|.*$/g, '') // remove trailing brand titles like " | VEVO"
    .trim();

  return title || rawTitle;
}

export interface ClassificationResult {
  isMusic: boolean;
  cleanTitle: string;
  artistName: string;
  channelTitle: string;
}

export function classifyAndExtractMetadata(
  rawTitle: string,
  channelTitle: string = 'Unknown Channel',
  products: string[] = [],
  details: { name?: string }[] = []
): ClassificationResult {
  const cleanTitle = cleanVideoTitle(rawTitle);

  // Check 1: Explicit YouTube Music product flag
  const isExplicitYTM =
    products.some((p) => p.toLowerCase().includes('youtube music')) ||
    details.some((d) => d.name?.toLowerCase().includes('youtube music'));

  // Check 2: Topic channel indicates YouTube Music auto-generated artist channel
  const isTopicChannel = /- Topic$/i.test(channelTitle);

  // Check 3: VEVO channel
  const isVevo = /vevo$/i.test(channelTitle);

  // Check 4: Common music label or audio indicator
  const hasMusicKeywords =
    /records|recordings|music|entertainment/i.test(channelTitle) ||
    /\b(ft\.|feat\.|prod\.|remix|cover|album|song)\b/i.test(cleanTitle);

  // Check 5: Title format "Artist - Track"
  const hasDashSplit = cleanTitle.includes(' - ');

  const isMusic = isExplicitYTM || isTopicChannel || isVevo || (hasDashSplit && hasMusicKeywords);

  let artistName = channelTitle;
  let trackTitle = cleanTitle;

  if (isTopicChannel) {
    artistName = channelTitle.replace(/\s*-\s*Topic$/i, '').trim();
    if (hasDashSplit) {
      const parts = cleanTitle.split(' - ');
      if (parts.length >= 2 && parts[0].trim().toLowerCase() === artistName.toLowerCase()) {
        trackTitle = parts.slice(1).join(' - ').trim();
      }
    }
  } else if (isVevo) {
    artistName = channelTitle.replace(/vevo$/i, '').trim();
    if (hasDashSplit) {
      const parts = cleanTitle.split(' - ');
      if (parts.length >= 2) {
        trackTitle = parts.slice(1).join(' - ').trim();
      }
    }
  } else if (hasDashSplit) {
    const parts = cleanTitle.split(' - ');
    if (parts.length >= 2) {
      artistName = parts[0].trim();
      trackTitle = parts.slice(1).join(' - ').trim();
    }
  }

  // Fallback cleanup
  if (!artistName || artistName === 'Unknown Channel') {
    artistName = channelTitle !== 'Unknown Channel' ? channelTitle : 'Various Artists';
  }

  return {
    isMusic,
    cleanTitle: isMusic ? trackTitle : cleanTitle,
    artistName: isMusic ? artistName : channelTitle,
    channelTitle: channelTitle || 'Unknown Channel',
  };
}

export function normalizeArtistName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Duration estimation rule with documented defensible median
 * Music: ~210 seconds (3.5 minutes) per recorded play
 * Video: ~360 seconds (6 minutes) per recorded play
 */
export function estimateDuration(isMusic: boolean, explicitSeconds?: number): number {
  if (explicitSeconds && explicitSeconds > 0) {
    return explicitSeconds;
  }
  return isMusic ? 210 : 360;
}
