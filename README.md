# Verse Universe 🌌 — 3D YouTube & YouTube Music Listening Universe

**Verse Universe** transforms your historical YouTube and YouTube Music activity into an interactive, navigable 3D universe. Your favorite artists expand into celestial planets, individual songs orbit as glowing stars, and your listening trends come alive across time and space.

---

## 🌟 Key Features

1. **Genuinely Data-Driven 3D Universe**:
   - **Artist Planets**: Sized logarithmically based on your listening activity or estimated duration, featuring glowing atmospheres and planetary rings.
   - **Song Stars**: Individual tracks orbit around their parent artist planet with animated trails and interactive selection.
   - **YouTube Universe Mode**: Explore general video viewing categorized by YouTube channels and video clusters.
   - **Cinematic Orbit & Controls**: Smooth fly-to camera focus, interactive zoom, pan, and center reset.

2. **Google Takeout Ingestion Engine**:
   - Client-side drag-and-drop parser supporting official Google Takeout `watch-history.json` and `watch-history.html`.
   - Automatic deduplication using composite timestamp and video ID hashing.
   - Music vs. General Video classification heuristic (handling `- Topic` channels, `VEVO`, YouTube Music product tags, and track title parsing).
   - Instant sample dataset loader for immediate testing.

3. **Listening Analytics & Data Integrity**:
   - Monthly listening activity volume area charts.
   - Top artists and top songs breakdown.
   - 52-week activity heatmap calendar grid.
   - Consecutive listening streak calculator (current streak, longest streak, peak day).
   - Clear disclosure labels explaining that Takeout logs record playback initiation events.

4. **Privacy by Default**:
   - Zero public profiles, zero leaderboards, zero tracking or sale of telemetry.
   - Complete tenant isolation with PostgreSQL Row Level Security (RLS).
   - Instant **Export Normalized JSON** backup and one-click **"Wipe All Data"** destruction rights.

5. **Accessibility & Performance Modes**:
   - Adjustable Graphics Quality (Ultra, High, Medium, Low).
   - Reduced Motion toggle for accessibility.
   - WebGL error boundary with graceful fallback.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router) + TypeScript (Strict Mode)
- **3D Visualization**: Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`
- **Styling**: Tailwind CSS, custom space glassmorphism, glowing typography
- **State Management**: Zustand with persistent local storage
- **Analytics Charts**: Recharts
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) policies
- **Testing**: Vitest automated test suite

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v22+`
- npm `v9+` or `v11+`

### 2. Installation
```bash
git clone <repository-url>
cd "YT Audio"
npm install --legacy-peer-deps
```

### 3. Environment Setup (Optional for cloud sync)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
*Note: If no Supabase credentials are provided, Verse Universe operates out of the box in Local Storage / Demo mode!*

### 4. Database Setup (Supabase)
Run the SQL migration in `supabase/migrations/20261015000000_init.sql` within your Supabase SQL Editor. It sets up:
- `profiles`, `user_settings`, `import_jobs`, `artists`, `media_items`, `activity_events`, `daily_stats`
- Row Level Security (RLS) policies restricting row access strictly to `auth.uid() = user_id`.

### 5. Running the Application
```bash
# Start local development server
npm run dev

# Run automated tests
npm test

# Build for production
npm run build
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deploying to Vercel

1. **Import to Vercel**:
   - Push your code to GitHub (or use [akshatajmera7/verse-universe](https://github.com/akshatajmera7/verse-universe)).
   - Import the project on [Vercel](https://vercel.com/new).

2. **Add Environment Variables in Vercel**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL (`https://nhkqvywfiblzbzbezodj.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `NEXT_PUBLIC_SITE_URL`: Your Vercel deployment URL (e.g. `https://verse-universe.vercel.app`)
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

3. **Update Supabase Authentication**:
   - Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
   - Set **Site URL** to: `https://your-app.vercel.app`
   - Add to **Redirect URLs**:
     - `https://your-app.vercel.app/**`
     - `https://your-app.vercel.app/app`
     - `https://your-app.vercel.app/auth`

4. **Update Google Cloud Console**:
   - Go to **Google Cloud Console** -> **Credentials** -> Select your Web Client ID.
   - Add your Vercel URL to **Authorized JavaScript origins**: `https://your-app.vercel.app`
   - In **OAuth consent screen**, add `vercel.app` to **Authorized domains**.

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx               # Public landing page with interactive 3D hero
│   │   ├── layout.tsx             # Root layout with SEO and dark space theme
│   │   ├── globals.css            # Space glass, glowing text, and custom utilities
│   │   ├── auth/page.tsx          # Google Sign-In & Demo access
│   │   ├── app/
│   │   │   ├── page.tsx           # Main 3D Universe canvas & HUD
│   │   │   ├── analytics/page.tsx # Analytics dashboard with charts & streaks
│   │   │   ├── import/page.tsx    # Drag-and-drop Takeout ingestion engine
│   │   │   └── settings/page.tsx  # Visual preferences & privacy wipe controls
│   │   ├── privacy/page.tsx       # Comprehensive privacy policy
│   │   └── terms/page.tsx         # Terms of service
│   ├── components/
│   │   ├── universe/
│   │   │   ├── UniverseCanvas.tsx        # R3F Canvas with WebGL error boundary
│   │   │   ├── CelestialBackground.tsx   # Starfield & colored nebula particles
│   │   │   ├── ArtistPlanet.tsx          # 3D planet with atmosphere & rings
│   │   │   ├── SongStar.tsx              # Orbiting song star with trails & tags
│   │   │   ├── YouTubeUniverse.tsx       # YouTube channel galactic stations
│   │   │   ├── UniverseCameraManager.tsx # Smooth camera fly-to & controls
│   │   │   └── UniverseControls.tsx      # Floating bottom HUD controls
│   │   ├── hud/
│   │   │   ├── TopNav.tsx         # Search, time filters, and route links
│   │   │   └── LeftRail.tsx       # Quick metrics & dominant artist navigation
│   │   └── panels/
│   │       └── DetailPanel.tsx    # Contextual artist/song/channel slide-over
│   ├── lib/
│   │   ├── parser/
│   │   │   ├── heuristics.ts      # Classification, duration, title sanitization
│   │   │   └── takeout-parser.ts  # JSON/HTML Takeout parsing & deduplication
│   │   ├── store/
│   │   │   └── useUniverseStore.ts# Zustand global store with local caching
│   │   ├── data/
│   │   │   └── sample-dataset.ts  # Multi-year realistic demo dataset
│   │   └── supabase/
│   │       └── client.ts          # Supabase client with graceful fallback
│   ├── tests/
│   │   └── parser-and-analytics.test.ts # Vitest automated test suite
│   └── types/
│       └── index.ts               # Core TypeScript definitions & Zod schemas
└── supabase/
    └── migrations/
        └── 20261015000000_init.sql # Complete PostgreSQL schema with RLS
```

---

## 🔒 Privacy & Data Policy

- **No Public Profiles**: Your universe cannot be accessed or indexed publicly.
- **Client-Side Parsing**: Takeout files are processed directly on your machine.
- **Wipe at Any Time**: Clear your database and reset your universe in one click from Settings.
