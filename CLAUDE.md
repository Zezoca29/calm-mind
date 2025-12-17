# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Calm Mind is a Progressive Web App (PWA) for anxiety control and emotional tracking, built in Brazilian Portuguese (pt-BR). It's a standalone web application using vanilla JavaScript with no build system.

## Tech Stack

- **Frontend**: Vanilla HTML/JavaScript with Tailwind CSS (via CDN)
- **UI Components**: React 18 (via CDN) for the Ocean Mind immersive meditation feature
- **Backend**: Supabase for authentication and data sync
- **PWA**: Service Worker (`sw.js`) for offline functionality

## Development

No build system - open `index.html` directly in a browser or use any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

## Architecture

### Core Features (all in `index.html`)

The main application is contained in a single `index.html` file (~240KB) with embedded JavaScript handling:
- Mood tracking (1-5 scale) and anxiety levels (1-10 scale)
- Emotional diary with tags
- Breathing exercises (4-7-8, meditation, grounding 5-4-3-2-1)
- Sleep tracking
- SOS mode for crisis moments

### External JavaScript Modules (`js/`)

- **supabase-sync.js**: Authentication and cloud sync with Supabase. Uses debounced sync (10s delay) with 2-hour intervals. Handles offline-first storage with IndexedDB fallback.
- **smart-recommendations.js**: `SmartRecommendationEngine` class that analyzes user patterns (mood trends, sleep quality, anxiety patterns) to provide personalized recommendations.
- **oceanmind.jsx**: React component for immersive ocean-themed meditation experience. Mounted dynamically via `openOceanMind()` function.
- **smart-ui-components.js**: UI enhancement components for the recommendation system.
- **sync-ui-enhancements.js**: Visual feedback for sync operations.

### Database Schema (`database-schema.sql`)

Supabase PostgreSQL schema with Row Level Security (RLS). Four main tables:
- `mood_entries`: mood (1-5), anxiety (1-10), notes
- `diary_entries`: title, content, tags array
- `breathing_sessions`: exercise type, duration, completion status
- `sleep_entries`: sleep_time, wake_time, duration, quality (1-5)

All tables have `user_id` foreign key with RLS policies ensuring data isolation per user.

### PWA Configuration

- `manifest.json`: App manifest with shortcuts for quick actions (mood, breathing, diary, sleep, SOS)
- `sw.js`: Service worker with cache-first strategy for static assets, network-first for dynamic content

## Data Flow

1. User data is stored locally in localStorage/IndexedDB (offline-first)
2. `supabase-sync.js` syncs data to cloud when online
3. Sync uses `local_id` + `user_id` unique constraint for conflict resolution
4. Authentication redirects unauthenticated users to `landingpage.html`

## Key Patterns

- All UI is rendered inline in `index.html` - search there for UI modifications
- React is only used for Ocean Mind (`js/oceanmind.jsx`), rest is vanilla JS
- Use `scheduleDebouncedSync()` after data changes to trigger cloud sync
- Current user ID via `getCurrentUserId()` from supabase-sync.js
