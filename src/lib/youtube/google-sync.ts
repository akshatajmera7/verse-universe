import { NormalizedActivity } from '@/types';
import {
  classifyAndExtractMetadata,
  estimateDuration,
} from '../parser/heuristics';
import { buildUniverseState, ParseResult } from '../parser/takeout-parser';

export interface GoogleSyncProgress {
  status: string;
  count: number;
}

/**
 * Deeply fetches as much previous and historical user data as Google YouTube Data API allows:
 * - Liked Music (`LM`) with multi-page pagination (up to 250+ songs)
 * - Liked Videos (`LL` and relatedPlaylists.likes) with multi-page pagination
 * - Videos with `myRating=like` with multi-page pagination
 * - User's custom playlists and all contained tracks with pagination
 * - Subscribed Artists & Channels with multi-page pagination
 * - Popular catalog tracks for top subscribed favorite artists
 */
export async function syncRealUserYouTubeData(
  accessToken: string,
  onProgress?: (progress: GoogleSyncProgress) => void,
  customApiKey?: string
): Promise<ParseResult> {
  const activities: NormalizedActivity[] = [];
  const seenIds = new Set<string>();
  let lastGoogleApiError: string | null = null;

  const rawApiKey =
    customApiKey ||
    process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ||
    process.env.YOUTUBE_API_KEY ||
    '';
  // Standard Google Cloud API keys always begin with 'AIzaSy'. Omit incompatible keys to prevent 401/400 gateway rejection.
  const apiKey = rawApiKey.startsWith('AIzaSy') ? rawApiKey : '';

  const withKey = (url: string) => {
    if (!apiKey) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}key=${encodeURIComponent(apiKey)}`;
  };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };
  if (apiKey) {
    headers['x-goog-api-key'] = apiKey;
  }

  // 1. Fetch User Channel Profile & Related Playlists
  let userLikesPlaylistId = 'LL';
  try {
    onProgress?.({
      status: 'Connecting to your Google YouTube account...',
      count: 0,
    });

    const channelRes: Response = await fetch(
      withKey('https://www.googleapis.com/youtube/v3/channels?mine=true&part=snippet,contentDetails,statistics'),
      { headers }
    );

    if (channelRes.ok) {
      const channelData: any = await channelRes.json();
      const firstChannel = channelData.items?.[0];
      if (firstChannel?.contentDetails?.relatedPlaylists?.likes) {
        userLikesPlaylistId = firstChannel.contentDetails.relatedPlaylists.likes;
      }
    } else {
      const errJson: any = await channelRes.json().catch(() => null);
      if (errJson?.error?.message) {
        lastGoogleApiError = errJson.error.message;
      }
    }
  } catch (err) {
    console.warn('Could not inspect channel profile:', err);
  }

  // 2. Fetch User's Liked Music & Liked Videos with Multi-Page Pagination
  const playlistsToTry = Array.from(new Set([userLikesPlaylistId, 'LM', 'LL']));
  for (const plId of playlistsToTry) {
    let pageToken: string | undefined = undefined;
    let pageCount = 0;
    const MAX_PAGES = 5;

    while (pageCount < MAX_PAGES) {
      pageCount++;
      try {
        const listLabel = plId === 'LM' ? 'YouTube Music Liked Tracks' : 'Liked Videos';
        onProgress?.({
          status: `Fetching ${listLabel} (Page ${pageCount})...`,
          count: activities.length,
        });

        const reqUrl: string = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${plId}&part=snippet,contentDetails&maxResults=50${
          pageToken ? `&pageToken=${pageToken}` : ''
        }`;
        const plRes: Response = await fetch(withKey(reqUrl), { headers });

        if (plRes.ok) {
          const plData: any = await plRes.json();
          if (plData.items && Array.isArray(plData.items)) {
            for (const item of plData.items) {
              const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
              if (!videoId || seenIds.has(videoId)) continue;
              seenIds.add(videoId);

              const title = item.snippet?.title || 'Unknown Title';
              if (title === 'Private video' || title === 'Deleted video') continue;

              const channelTitle =
                item.snippet?.videoOwnerChannelTitle ||
                item.snippet?.channelTitle ||
                'Unknown Artist';
              const publishedAt = item.snippet?.publishedAt || new Date().toISOString();

              const { isMusic, cleanTitle, artistName } = classifyAndExtractMetadata(
                title,
                channelTitle,
                plId === 'LM' ? ['YouTube Music'] : [],
                []
              );

              activities.push({
                id: `yt_${plId}_${videoId}`,
                sourceId: `${plId}_${videoId}`,
                videoId,
                title,
                cleanTitle,
                artistName,
                channelTitle,
                channelUrl: `https://www.youtube.com/channel/${item.snippet?.channelId || ''}`,
                playbackUrl: `https://www.youtube.com/watch?v=${videoId}`,
                timestamp: publishedAt,
                isMusic: plId === 'LM' ? true : isMusic,
                sourcePlatform: plId === 'LM' ? 'youtube_music' : 'youtube',
                estDurationSeconds: estimateDuration(isMusic),
              });
            }
          }

          pageToken = plData.nextPageToken;
          if (!pageToken) break;
        } else {
          const errJson: any = await plRes.json().catch(() => null);
          if (errJson?.error?.message) {
            lastGoogleApiError = errJson.error.message;
          }
          break;
        }
      } catch (e) {
        console.warn(`Could not access playlist ${plId}:`, e);
        break;
      }
    }
  }

  // 3. Fetch Liked Videos directly via Rating Endpoint with Multi-Page Pagination
  let likedPageToken: string | undefined = undefined;
  let likedPageCount = 0;
  while (likedPageCount < 5) {
    likedPageCount++;
    try {
      onProgress?.({
        status: `Fetching rated music history (Page ${likedPageCount})...`,
        count: activities.length,
      });

      const ratedUrl: string = `https://www.googleapis.com/youtube/v3/videos?myRating=like&part=snippet,contentDetails&maxResults=50${
        likedPageToken ? `&pageToken=${likedPageToken}` : ''
      }`;
      const likedRes: Response = await fetch(withKey(ratedUrl), { headers });

      if (likedRes.ok) {
        const likedData: any = await likedRes.json();
        if (likedData.items && Array.isArray(likedData.items)) {
          for (const item of likedData.items) {
            const videoId = item.id;
            if (!videoId || seenIds.has(videoId)) continue;
            seenIds.add(videoId);

            const title = item.snippet?.title || 'Unknown Title';
            const channelTitle = item.snippet?.channelTitle || 'Unknown Channel';
            const publishedAt = item.snippet?.publishedAt || new Date().toISOString();

            let durationSeconds = 210;
            const durationStr = item.contentDetails?.duration || '';
            const match = durationStr.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
              const minutes = parseInt(match[1] || '0', 10);
              const seconds = parseInt(match[2] || '0', 10);
              durationSeconds = minutes * 60 + seconds || 210;
            }

            const { isMusic, cleanTitle, artistName } = classifyAndExtractMetadata(
              title,
              channelTitle,
              ['YouTube Music'],
              []
            );

            activities.push({
              id: `yt_like_${videoId}`,
              sourceId: `like_${videoId}`,
              videoId,
              title,
              cleanTitle,
              artistName,
              channelTitle,
              channelUrl: `https://www.youtube.com/channel/${item.snippet?.channelId || ''}`,
              playbackUrl: `https://www.youtube.com/watch?v=${videoId}`,
              timestamp: publishedAt,
              isMusic,
              sourcePlatform: 'youtube_music',
              estDurationSeconds: durationSeconds,
            });
          }
        }

        likedPageToken = likedData.nextPageToken;
        if (!likedPageToken) break;
      } else {
        const errJson: any = await likedRes.json().catch(() => null);
        if (errJson?.error?.message) {
          lastGoogleApiError = errJson.error.message;
        }
        break;
      }
    } catch (err) {
      console.error('Error fetching liked videos from YouTube API:', err);
      break;
    }
  }

  // 4. Fetch User's Personal Playlists & Contained Tracks
  try {
    onProgress?.({
      status: 'Fetching your personal YouTube playlists & songs...',
      count: activities.length,
    });

    const playlistsRes: Response = await fetch(
      withKey('https://www.googleapis.com/youtube/v3/playlists?mine=true&part=snippet,contentDetails&maxResults=25'),
      { headers }
    );

    if (playlistsRes.ok) {
      const playlistsData: any = await playlistsRes.json();
      if (playlistsData.items && Array.isArray(playlistsData.items)) {
        for (const pl of playlistsData.items.slice(0, 15)) {
          const playlistId = pl.id;

          let plItemToken: string | undefined = undefined;
          let plItemPages = 0;
          while (plItemPages < 3) {
            plItemPages++;
            const pUrl: string = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet,contentDetails&maxResults=50${
              plItemToken ? `&pageToken=${plItemToken}` : ''
            }`;
            const itemsRes: Response = await fetch(withKey(pUrl), { headers });

            if (itemsRes.ok) {
              const itemsData: any = await itemsRes.json();
              if (itemsData.items && Array.isArray(itemsData.items)) {
                for (const pItem of itemsData.items) {
                  const videoId = pItem.contentDetails?.videoId || pItem.snippet?.resourceId?.videoId;
                  if (!videoId || seenIds.has(videoId)) continue;
                  seenIds.add(videoId);

                  const title = pItem.snippet?.title || 'Unknown Title';
                  if (title === 'Private video' || title === 'Deleted video') continue;

                  const channelTitle =
                    pItem.snippet?.videoOwnerChannelTitle ||
                    pItem.snippet?.channelTitle ||
                    'Unknown Artist';
                  const addedAt = pItem.snippet?.publishedAt || new Date().toISOString();

                  const { isMusic, cleanTitle, artistName } = classifyAndExtractMetadata(
                    title,
                    channelTitle,
                    ['YouTube Music'],
                    []
                  );

                  activities.push({
                    id: `yt_pl_${videoId}`,
                    sourceId: `pl_${playlistId}_${videoId}`,
                    videoId,
                    title,
                    cleanTitle,
                    artistName,
                    channelTitle,
                    playbackUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    timestamp: addedAt,
                    isMusic,
                    sourcePlatform: 'youtube_music',
                    estDurationSeconds: estimateDuration(isMusic),
                  });
                }
              }
              plItemToken = itemsData.nextPageToken;
              if (!plItemToken) break;
            } else {
              break;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching playlists from YouTube API:', err);
  }

  // 5. Fetch User's Subscriptions (Artists & Channels) with Multi-Page Pagination
  const subscribedChannelIds: string[] = [];
  let subsToken: string | undefined = undefined;
  let subsPages = 0;
  while (subsPages < 3) {
    subsPages++;
    try {
      onProgress?.({
        status: `Fetching your subscribed artists and channels (Page ${subsPages})...`,
        count: activities.length,
      });

      const subsUrl: string = `https://www.googleapis.com/youtube/v3/subscriptions?mine=true&part=snippet&maxResults=50${
        subsToken ? `&pageToken=${subsToken}` : ''
      }`;
      const subsRes: Response = await fetch(withKey(subsUrl), { headers });

      if (subsRes.ok) {
        const subsData: any = await subsRes.json();
        if (subsData.items && Array.isArray(subsData.items)) {
          for (const sub of subsData.items) {
            const channelTitle = sub.snippet?.title || 'Unknown Channel';
            const channelId = sub.snippet?.resourceId?.channelId;
            if (channelId) subscribedChannelIds.push(channelId);

            const subDate = sub.snippet?.publishedAt || new Date().toISOString();
            const { isMusic, artistName } = classifyAndExtractMetadata(channelTitle, channelTitle, [], []);

            activities.push({
              id: `yt_sub_${channelId}`,
              sourceId: `sub_${channelId}`,
              title: `Subscribed to ${channelTitle}`,
              cleanTitle: `Favorite: ${channelTitle}`,
              artistName: isMusic ? artistName : channelTitle,
              channelTitle,
              channelUrl: `https://www.youtube.com/channel/${channelId}`,
              timestamp: subDate,
              isMusic,
              sourcePlatform: isMusic ? 'youtube_music' : 'youtube',
              estDurationSeconds: 300,
            });
          }
        }
        subsToken = subsData.nextPageToken;
        if (!subsToken) break;
      } else {
        break;
      }
    } catch (err) {
      console.error('Error fetching subscriptions from YouTube API:', err);
      break;
    }
  }

  // 6. For top subscribed music artists, fetch their catalog tracks
  if (subscribedChannelIds.length > 0) {
    try {
      onProgress?.({
        status: 'Populating tracks for your favorite artists...',
        count: activities.length,
      });

      for (const chanId of subscribedChannelIds.slice(0, 6)) {
        const searchRes: Response = await fetch(
          withKey(`https://www.googleapis.com/youtube/v3/search?channelId=${chanId}&part=snippet&order=viewCount&maxResults=5&type=video`),
          { headers }
        );

        if (searchRes.ok) {
          const sData: any = await searchRes.json();
          if (sData.items && Array.isArray(sData.items)) {
            for (const v of sData.items) {
              const videoId = v.id?.videoId;
              if (!videoId || seenIds.has(videoId)) continue;
              seenIds.add(videoId);

              const title = v.snippet?.title || '';
              const channelTitle = v.snippet?.channelTitle || 'Artist';
              const { isMusic, cleanTitle, artistName } = classifyAndExtractMetadata(
                title,
                channelTitle,
                ['YouTube Music'],
                []
              );

              activities.push({
                id: `yt_art_track_${videoId}`,
                sourceId: `art_track_${videoId}`,
                videoId,
                title,
                cleanTitle,
                artistName,
                channelTitle,
                playbackUrl: `https://www.youtube.com/watch?v=${videoId}`,
                timestamp: v.snippet?.publishedAt || new Date().toISOString(),
                isMusic: true,
                sourcePlatform: 'youtube_music',
                estDurationSeconds: 210,
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching artist top tracks:', e);
    }
  }

  if (activities.length === 0) {
    if (lastGoogleApiError) {
      throw new Error(
        `Google API Error: "${lastGoogleApiError}". Please check that you checked the YouTube permissions box during sign-in and that YouTube Data API v3 is enabled in Google Cloud Console.`
      );
    }
    throw new Error(
      'No music, playlists, or subscriptions were found in this Google account. If your account has activity, please verify that YouTube Data API v3 is enabled in Google Cloud Console.'
    );
  }

  onProgress?.({
    status: `Successfully loaded ${activities.length} real YouTube records across your history!`,
    count: activities.length,
  });

  return buildUniverseState(activities, {
    id: `job_gapi_${Date.now()}`,
    source: 'demo',
    status: 'completed',
    totalRecords: activities.length,
    acceptedRecords: activities.length,
    skippedDuplicates: 0,
    rejectedRecords: 0,
    musicRecords: activities.filter((a) => a.isMusic).length,
    videoRecords: activities.filter((a) => !a.isMusic).length,
    completedAt: new Date().toISOString(),
  });
}
