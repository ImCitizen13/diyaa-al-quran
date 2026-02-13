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

- **GlowOrb** (`components/GlowOrb.tsx`): Circle representing a Surah or Juz with glow intensity proportional to memorization progress (0-1 scale). Uses `@shopify/react-native-skia` for shader-based radial gradient glow effects on native platforms, with a View-based fallback on web. Skia renders animated blur masks, radial gradients, and layered glow circles.
- **BiometricLock** (`components/BiometricLock.tsx`): App-level lock screen that wraps the entire app. Uses `expo-local-authentication` for Face ID/Fingerprint/Iris authentication. Shows a lock screen on app launch and when returning from background (if enabled). Auto-detects biometric type and labels accordingly. No-op on web.
- **ProgressRing** (`components/ProgressRing.tsx`): SVG-based animated circular progress indicator using `react-native-svg` with Reanimated animated props.

### Notifications & Reminders

- **Notification system** (`lib/notifications.ts`): Daily push notification reminders using `expo-notifications`. Configurable reminder time (5 AM–10 PM). 5 rotating motivational messages. Settings stored in AsyncStorage under `@diyaa_notification_settings`. Notifications disabled on web platform.
- **Biometric auth** (`lib/biometric-auth.ts`): Wrapper around `expo-local-authentication`. Detects hardware availability, enrolled biometrics, and biometric type (Face ID, Fingerprint, Iris). Settings stored in AsyncStorage under `@diyaa_biometric_enabled`.

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

### Onboarding Walkthrough

- **Component:** `components/Walkthrough.tsx` — 5-step onboarding with animated transitions
- **State management:** `lib/walkthrough.ts` — AsyncStorage flag (`@diyaa_walkthrough_completed`), event-based reset system
- **Integration:** Shown in `app/_layout.tsx` before the main app on first launch
- **Replay:** Available in Settings under "Help" section via `resetWalkthrough()`
- **Steps:** Welcome → Browse & Navigate → Mark Your Progress → Watch It Glow → Stay Consistent

### Recent Changes (Feb 2026)

- **Skia GlowOrb**: Rebuilt GlowOrb component with `@shopify/react-native-skia` for native shader-based rendering with radial gradients, blur masks, and layered glow circles. Web fallback uses View-based rendering.
- **Push Notifications**: Added daily reminder system with `expo-notifications`. Configurable time (5 AM–10 PM), toggle on/off in Settings. Initializes on app launch.
- **Biometric Lock**: Added Face ID/Fingerprint lock screen with `expo-local-authentication`. Wraps entire app, prompts on launch and background return. Toggle in Settings.
- **IMPORTANT**: Skia requires a development build (NOT Expo Go compatible). User accepted this trade-off.

### Future Architecture Notes (from FUTURE_ENHANCEMENTS.md)

The codebase is designed for an eventual migration path: AsyncStorage → expo-sqlite, React Context → Zustand. GlowOrb has been migrated to Skia shaders. These remaining items are documented but not yet implemented.

## External Dependencies

### Core Framework
- **Expo SDK 54** — managed React Native workflow
- **React 19.1** / **React Native 0.81.5**
- **Expo Router 6** — file-based navigation

### UI & Animation
- `react-native-reanimated` — performant animations
- `react-native-gesture-handler` — gesture support
- `react-native-svg` — SVG rendering for progress rings
- `@shopify/react-native-skia` — native shader-based GlowOrb rendering (radial gradients, blur masks)
- `expo-linear-gradient` — gradient effects (legacy, still used in some places)
- `expo-blur` / `expo-glass-effect` — blur effects for tab bar
- `expo-haptics` — haptic feedback
- `expo-image` — optimized image loading
- `@expo/vector-icons` / `@expo-google-fonts/amiri` — icons and Arabic typography
- `expo-notifications` — daily push notification reminders
- `expo-local-authentication` — biometric (Face ID/Fingerprint) app lock

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