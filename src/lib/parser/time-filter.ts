import { NormalizedActivity, TimeFilter } from '@/types';
import { buildUniverseState, ParseResult } from './takeout-parser';

export interface TimeFilterOption {
  key: TimeFilter;
  label: string;
  description: string;
}

export const TIME_FILTER_OPTIONS: TimeFilterOption[] = [
  { key: 'all', label: 'All Time', description: 'Complete listening and viewing history' },
  { key: '30d', label: 'Last 30 Days', description: 'Activity in the last month' },
  { key: '3m', label: 'Last 3 Months', description: 'Activity in the last quarter' },
  { key: '6m', label: 'Last 6 Months', description: 'Activity in the last half year' },
  { key: '1y', label: 'Last 1 Year', description: 'Activity in the last 12 months' },
];

/**
 * Filters normalized activities by a relative or absolute time frame.
 */
export function filterActivitiesByTime(
  activities: NormalizedActivity[],
  timeFilter: TimeFilter
): NormalizedActivity[] {
  if (!activities || activities.length === 0) return [];
  if (timeFilter === 'all') return activities;

  // Find latest activity timestamp in the dataset to handle historical imports cleanly
  let latestTime = 0;
  for (const act of activities) {
    const t = new Date(act.timestamp).getTime();
    if (!isNaN(t) && t > latestTime) {
      latestTime = t;
    }
  }

  const now = Date.now();
  // If data is recent (within 90 days of now), anchor to current wall clock.
  // If data is a historical Takeout export, anchor to the dataset's latest recorded activity.
  const isRecentData = latestTime > 0 && (now - latestTime) < 90 * 24 * 60 * 60 * 1000;
  const refTime = isRecentData ? now : (latestTime > 0 ? latestTime : now);

  let minTime = 0;
  let maxTime = Number.MAX_SAFE_INTEGER;

  const MS_DAY = 24 * 60 * 60 * 1000;

  if (timeFilter === '30d') {
    minTime = refTime - 30 * MS_DAY;
  } else if (timeFilter === '3m') {
    minTime = refTime - 90 * MS_DAY;
  } else if (timeFilter === '6m') {
    minTime = refTime - 180 * MS_DAY;
  } else if (timeFilter === '1y') {
    minTime = refTime - 365 * MS_DAY;
  } else if (/^\d{4}$/.test(timeFilter)) {
    // Specific Year like "2024"
    const yr = parseInt(timeFilter, 10);
    minTime = new Date(yr, 0, 1).getTime();
    maxTime = new Date(yr, 11, 31, 23, 59, 59, 999).getTime();
  }

  return activities.filter((act) => {
    const t = new Date(act.timestamp).getTime();
    if (isNaN(t)) return true;
    return t >= minTime && t <= maxTime;
  });
}

/**
 * Re-computes universe entities (artists, songs, channels, stats) dynamically
 * for any given time filter.
 */
export function getUniverseStateForTimeFilter(
  allActivities: NormalizedActivity[],
  timeFilter: TimeFilter,
  fallbackBase?: ParseResult
): ParseResult {
  const filteredActivities = filterActivitiesByTime(allActivities, timeFilter);

  // If timeFilter matches all activities or filtered list is identical
  if (timeFilter === 'all' && fallbackBase) {
    return fallbackBase;
  }

  return buildUniverseState(filteredActivities, {
    id: `time_filter_${timeFilter}_${Date.now()}`,
    source: fallbackBase?.summary.source || 'demo',
    status: 'completed',
    totalRecords: filteredActivities.length,
    acceptedRecords: filteredActivities.length,
    skippedDuplicates: 0,
    rejectedRecords: 0,
    musicRecords: filteredActivities.filter((a) => a.isMusic).length,
    videoRecords: filteredActivities.filter((a) => !a.isMusic).length,
    completedAt: new Date().toISOString(),
  });
}
