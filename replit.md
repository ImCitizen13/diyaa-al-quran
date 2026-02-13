# Diyaa Al-Quran

## Overview

Diyaa Al-Quran (ضياء القرآن — "Light of the Quran") is a mobile application for tracking Quran memorization (Hifz) progress. Built with React Native and Expo, it visualizes memorization as glowing orbs — unmemorized content starts dim, and as users memorize more, orbs glow brighter with gold light. The app supports browsing by Surah (114 chapters) and Juz (30 parts), tracking daily progress, streaks, and daily goals. It is designed as an offline-first experience with all Quran data bundled as JSON files.

The project has a dual architecture: a React Native mobile frontend (Expo Router with file-based routing) and an Express.js backend server. The backend currently has minimal functionality (a basic user schema) and serves as infrastructure for future features. The core app logic — memorization tracking, progress calculation — runs entirely on the client using AsyncStorage and React Context.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Mobile App)

- **Framework:** React Native with Expo SDK 54, using Expo Router v6 for file-based navigation
- **Routing structure:** `app/(tabs)/` for the tab navigator (Home, Progress, Settings), `app/surah/[id].tsx` and `app/juz/[id].tsx` for detail screens
- **State management:** React Context (`MemorizationProvider` in `lib/memorization-context.tsx`) manages all memorization state — which ayahs are memorized, daily logs, settings, streak calculations
- **Local persistence:** `@react-native-async-storage/async-storage` stores memorization data, daily logs, and settings as JSON under keys `@diyaa_memorized`, `@diyaa_daily_log`, `@diyaa_settings`
- **Animations:** `react-native-reanimated` for smooth UI transitions (fade-ins, animated progress rings)
- **Haptic feedback:** `expo-haptics` for tactile responses on selection and toggling
- **Fonts:** Amiri (Arabic script font) loaded via `@expo-google-fonts/amiri`
- **Visual theme:** Dark theme only (`#0a0a0f` background), gold accent color system defined in `constants/colors.ts`

### Key UI Components

- **GlowOrb** (`components/GlowOrb.tsx`): Circle representing a Surah or Juz with glow intensity proportional to memorization progress (0-1 scale). Uses `expo-linear-gradient` for glow effects.
- **ProgressRing** (`components/ProgressRing.tsx`): SVG-based animated circular progress indicator using `react-native-svg` with Reanimated animated props.

### Quran Data Layer

- **Bundled JSON data** in `assets/data/`:
  - `surah.json`: Index of all 114 Surahs with metadata (name, Arabic name, verse count, Juz mappings)
  - `juz.json`: Index of all 30 Juz with start/end Surah and verse references
  - `surah/surah_N.json`: Individual Surah files containing Arabic verse text (Uthmanic script)
- **Data access functions** in `lib/quran-data.ts`: `getAllSurahs()`, `getAllJuz()`, `getSurahMeta()`, `getSurahAyahs()`, `getSurahsInJuz()`, `getJuzForAyah()`, etc.
- **Constants:** `TOTAL_AYAHS` (6236), `TOTAL_SURAHS` (114), `TOTAL_JUZ` (30)

### Backend Server

- **Framework:** Express.js v5 running on Node.js
- **Database config:** Drizzle ORM with PostgreSQL (`drizzle.config.ts` points to `DATABASE_URL`)
- **Schema:** Currently minimal — a `users` table in `shared/schema.ts` (id, username, password)
- **Storage:** `server/storage.ts` has an in-memory implementation (`MemStorage`) of the storage interface
- **Routes:** `server/routes.ts` — currently empty, placeholder for `/api` routes
- **CORS:** Configured for Replit domains and localhost development
- **Static serving:** In production, serves a landing page from `server/templates/landing-page.html`
- **Build:** Server builds with esbuild (`server:build` script), client uses Expo's Metro bundler

### Data Flow

The mobile app operates independently of the backend server for all core functionality. Memorization state flows: User interaction → MemorizationContext → AsyncStorage. The backend exists primarily for the Replit deployment infrastructure and potential future features (user accounts, cloud sync).

### Development & Build

- **Dev mode:** Two processes — `expo:dev` for Metro bundler, `server:dev` for Express server
- **Production:** `server:prod` serves the built app
- **Database:** `db:push` uses Drizzle Kit to push schema to PostgreSQL
- **Path aliases:** `@/*` maps to project root, `@shared/*` maps to `./shared/*`

### Future Architecture Notes (from FUTURE_ENHANCEMENTS.md)

The codebase is designed for an eventual migration path: AsyncStorage → expo-sqlite, React Context → Zustand, gradient-based GlowOrb → Skia shaders. These are documented but not yet implemented. The current MVP is Expo Go compatible.

## External Dependencies

### Core Framework
- **Expo SDK 54** — managed React Native workflow
- **React 19.1** / **React Native 0.81.5**
- **Expo Router 6** — file-based navigation

### UI & Animation
- `react-native-reanimated` — performant animations
- `react-native-gesture-handler` — gesture support
- `react-native-svg` — SVG rendering for progress rings
- `expo-linear-gradient` — gradient effects for orb glow
- `expo-blur` / `expo-glass-effect` — blur effects for tab bar
- `expo-haptics` — haptic feedback
- `expo-image` — optimized image loading
- `@expo/vector-icons` / `@expo-google-fonts/amiri` — icons and Arabic typography

### Data & State
- `@react-native-async-storage/async-storage` — client-side key-value persistence
- `@tanstack/react-query` — data fetching (configured but lightly used currently)
- `drizzle-orm` + `drizzle-zod` — ORM for PostgreSQL schema definition
- `pg` — PostgreSQL client driver

### Server
- `express` v5 — HTTP server
- `http-proxy-middleware` — dev proxy configuration

### Database
- **PostgreSQL** — connected via `DATABASE_URL` environment variable, managed through Drizzle ORM. Currently only has a `users` table. The database is not used by the mobile app's core memorization features.

### Build Tools
- `tsx` — TypeScript execution for dev server
- `esbuild` — server production bundling
- `patch-package` — postinstall patching
- `babel-preset-expo` — Babel transpilation