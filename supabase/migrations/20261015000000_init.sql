-- Verse Universe: Complete PostgreSQL Database Schema with RLS and Indexes

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    graphics_quality TEXT DEFAULT 'high' CHECK (graphics_quality IN ('ultra', 'high', 'medium', 'low')),
    reduced_motion BOOLEAN DEFAULT FALSE,
    default_mode TEXT DEFAULT 'music' CHECK (default_mode IN ('music', 'youtube')),
    metric_mode TEXT DEFAULT 'plays' CHECK (metric_mode IN ('plays', 'duration')),
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Import Jobs Table
CREATE TABLE IF NOT EXISTS public.import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('takeout_json', 'takeout_html', 'data_portability', 'demo')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_records INTEGER DEFAULT 0 NOT NULL,
    accepted_records INTEGER DEFAULT 0 NOT NULL,
    skipped_duplicates INTEGER DEFAULT 0 NOT NULL,
    rejected_records INTEGER DEFAULT 0 NOT NULL,
    music_records INTEGER DEFAULT 0 NOT NULL,
    video_records INTEGER DEFAULT 0 NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- 4. Artists Table
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    channel_url TEXT,
    color TEXT DEFAULT '#06b6d4',
    total_plays INTEGER DEFAULT 1 NOT NULL,
    est_duration_seconds BIGINT DEFAULT 0 NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_artist_user_name UNIQUE (user_id, normalized_name)
);

-- 5. Media Items Table (Tracks and Videos)
CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    video_id TEXT,
    title TEXT NOT NULL,
    clean_title TEXT NOT NULL,
    is_music BOOLEAN DEFAULT TRUE NOT NULL,
    channel_title TEXT,
    channel_url TEXT,
    playback_url TEXT,
    duration_seconds INTEGER,
    total_plays INTEGER DEFAULT 1 NOT NULL,
    est_duration_seconds BIGINT DEFAULT 0 NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_media_user_videoid_title UNIQUE (user_id, video_id, clean_title)
);

-- 6. Media Artists Mapping Table
CREATE TABLE IF NOT EXISTS public.media_artists (
    media_id UUID NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT TRUE NOT NULL,
    PRIMARY KEY (media_id, artist_id)
);

-- 7. Activity Events Table (Raw Normalized Log)
CREATE TABLE IF NOT EXISTS public.activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    import_batch_id UUID REFERENCES public.import_jobs(id) ON DELETE SET NULL,
    media_id UUID REFERENCES public.media_items(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    source_platform TEXT NOT NULL CHECK (source_platform IN ('youtube_music', 'youtube')),
    source_id TEXT,
    raw_title TEXT,
    raw_subtitles JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_activity_event_user_dedup UNIQUE (user_id, source_id, timestamp)
);

-- 8. Daily Stats Table (Fast Analytics Precomputation)
CREATE TABLE IF NOT EXISTS public.daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    music_plays INTEGER DEFAULT 0 NOT NULL,
    video_plays INTEGER DEFAULT 0 NOT NULL,
    unique_artists INTEGER DEFAULT 0 NOT NULL,
    unique_tracks INTEGER DEFAULT 0 NOT NULL,
    est_duration_seconds BIGINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_daily_stats_user_date UNIQUE (user_id, date)
);

-- Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_artists_user_plays ON public.artists(user_id, total_plays DESC);
CREATE INDEX IF NOT EXISTS idx_media_user_plays ON public.media_items(user_id, total_plays DESC);
CREATE INDEX IF NOT EXISTS idx_media_user_music ON public.media_items(user_id, is_music);
CREATE INDEX IF NOT EXISTS idx_media_artist_id ON public.media_items(artist_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_time ON public.activity_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON public.daily_stats(user_id, date ASC);
CREATE INDEX IF NOT EXISTS idx_import_jobs_user ON public.import_jobs(user_id, created_at DESC);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Tenant Isolation (Users can only access their own records)
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Settings
CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Import Jobs
CREATE POLICY "Users manage own import jobs" ON public.import_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Artists
CREATE POLICY "Users manage own artists" ON public.artists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Media Items
CREATE POLICY "Users manage own media" ON public.media_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Media Artists
CREATE POLICY "Users manage own media artists" ON public.media_artists FOR ALL USING (
    EXISTS (SELECT 1 FROM public.media_items WHERE id = media_artists.media_id AND user_id = auth.uid())
);

-- Activity Events
CREATE POLICY "Users manage own activity events" ON public.activity_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Daily Stats
CREATE POLICY "Users manage own daily stats" ON public.daily_stats FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
