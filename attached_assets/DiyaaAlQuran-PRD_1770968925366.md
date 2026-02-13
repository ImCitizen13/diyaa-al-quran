# ضياء القرآن — Diyaa Al-Quran

### Quran Memorization Tracker

**Product Requirements Document**
**Version 1.1** · February 2026
React Native · Expo · Skia · Reanimated

---

## 1. Executive Summary

**ضياء القرآن** (Diyaa Al-Quran — "Light of the Quran") is a **fully offline** mobile application designed to help Muslims track and visualize their Quran memorization (Hifz) progress. The app presents the entire Quran as an interactive grid of glowing orbs, where each orb's luminosity reflects the user's memorization progress. Users can drill down from Juz (Parts) to Surahs (Chapters) to individual Ayahs (Verses), highlight memorized text, and watch their progress illuminate over time.

The core visual metaphor is **light**: an unmemorized Quran starts dim, and as the user memorizes more, the orbs glow brighter, ultimately creating a fully illuminated grid representing complete memorization. This creates a deeply motivating and spiritually meaningful experience.

> **Offline-First Principle:** The app requires zero network connectivity after initial install. All Quran data is bundled, all state is persisted locally in SQLite, and no backend server is needed for MVP. The app UI is in English; all Quran content (Ayah text, Surah names, Bismillah) is rendered exclusively in Arabic with proper RTL text handling.

---

## 2. App Concept & Visual Identity

### 2.1 Core Metaphor

The app centers on the concept of **ضياء (Diyaa — Light/Brilliance)**. Each Ayah, Surah, and Juz is represented as a circle/orb whose glow intensity corresponds to memorization progress. The aggregated glow of all Ayahs within a Surah determines the Surah's glow, and the aggregated glow of all Surahs within a Juz determines the Juz's glow.

### 2.2 Visual Design Direction

- Dark theme background (deep navy/black) to maximize the visual impact of the glow effect
- Orbs rendered using Skia shaders for smooth, GPU-accelerated glow with bloom effects
- Subtle particle effects or shimmer animation on fully memorized orbs
- Arabic typography: use a high-quality Uthmanic script font (e.g., KFGQPC Uthmanic Script HAFS or Amiri)

#### Color Palette

##### Gold / Accent

| Token | Hex | Usage |
|---|---|---|
| Primary Gold | `#d4af37` | Text accents, borders, glow source, orb base color |
| Bright Gold | `#ffd700` | Word-by-word highlight, active selection, fully memorized orb core |

##### Glow Layers (for orbs, cards, and ambient effects)

| Token | RGBA | Hex (with alpha) | Usage |
|---|---|---|---|
| Inner Glow | `rgba(212, 175, 55, 0.5)` | `#d4af3780` | Inner text glow, orb core bloom |
| Mid Glow | `rgba(212, 175, 55, 0.3)` | `#d4af374D` | Mid-range orb bloom layer |
| Outer Glow | `rgba(212, 175, 55, 0.15)` | `#d4af3726` | Outer bloom halo, soft ambient light |
| Card Background Glow | `rgba(212, 175, 55, 0.06)` | `#d4af370F` | Card/surface background tint |

##### Text Colors

| Token | RGBA | Hex (with alpha) | Usage |
|---|---|---|---|
| Active Arabic | `#ffffff` | — | Currently active/selected Arabic text |
| Default Arabic | `rgba(255,255,255,0.65)` | `#ffffffA6` | Standard Arabic Ayah text |
| Surah Label | `rgba(255,255,255,0.3)` | `#ffffff4D` | Surah name labels beneath orbs |
| Status Bar / Muted | `rgba(255,255,255,0.45)` | `#ffffff73` | Status bar text, secondary info |

##### Glow Intensity → Color Mapping (Orbs)

| Intensity Range | Visual Appearance | Color |
|---|---|---|
| 0.0 | Dim, barely visible orb with faint outline | `#3A3A3A` (dark grey) |
| 0.01–0.25 | Subtle warm glow begins, inner glow layer activates | `#d4af37` at 25% opacity |
| 0.26–0.50 | Moderate glow with visible mid bloom | `#d4af37` at 50% opacity |
| 0.51–0.75 | Strong glow with pronounced outer bloom halo | `#d4af37` at 75% opacity |
| 0.76–0.99 | Intense radiant glow, full bloom | `#d4af37` full + `#ffd700` inner |
| 1.0 | Maximum brightness, bright gold core with shimmer | `#ffd700` core + white center |

> **💡 Suggestion:** Define these as a `theme.ts` constants file early. Example:
> ```ts
> export const colors = {
>   gold: { primary: '#d4af37', bright: '#ffd700' },
>   glow: { inner: '#d4af3780', mid: '#d4af374D', outer: '#d4af3726', card: '#d4af370F' },
>   text: { arabicActive: '#ffffff', arabicDefault: '#ffffffA6', label: '#ffffff4D', muted: '#ffffff73' },
>   bg: { primary: '#0a0a0f', card: '#12121a' },
> } as const;
> ```

> **💡 Suggestion:** Consider supporting a "Minimal Mode" toggle that replaces Skia orbs with simple colored circles + percentage labels for low-end devices. This can be gated behind a performance check at startup.

### 2.3 App Name

**ضياء القرآن** (Diyaa Al-Quran) — meaning "Light of the Quran". Combines the Quranic concept of ضياء (radiant light / brilliance) with القرآن (The Quran). The word ضياء appears in the Quran itself (e.g., Surah Yunus 10:5) and carries connotations of illuminating, guiding light — perfectly aligned with the app's visual metaphor of memorization as growing light.

### 2.4 Language & Content Policy

- **App UI in English** — all navigation labels, buttons, headers, tooltips, settings, and notifications are in English
- **Quran content in Arabic only** — Ayah text, Surah names, Bismillah, and all Quranic content is displayed exclusively in Arabic using Uthmanic script. There is no translated version of the Quran text — the Quran is in Arabic.
- **RTL text handling** — Arabic Quran text must render correctly right-to-left within the English LTR app layout
- **No translation feature** — the app does not include or support Quran translations

---

## 3. Tech Stack

| Technology | Purpose | Version / Notes |
|---|---|---|
| React Native + Expo | Cross-platform mobile framework | Expo SDK 52+, managed workflow |
| expo-router | File-based navigation | Tab + Stack navigation patterns |
| @shopify/react-native-skia | GPU-accelerated 2D graphics | Glow orbs, shaders, bloom effects, Arabic text rendering |
| react-native-reanimated | High-performance animations | Shared values, layout animations, gesture-driven transitions |
| react-native-gesture-handler | Touch & gesture handling | Pinch-to-zoom, tap, long-press, pan gestures |
| zustand | Lightweight global UI state | Selection mode, active filters, view toggles, transient UI state |
| @tanstack/react-query | Async data layer / cache | Caching Quran data reads and SQLite query results, query invalidation |
| expo-notifications | Local push notifications | Daily memorization reminders, streak alerts |
| expo-sqlite | Local relational database | **Single source of truth** for all user progress, settings, memorization state |
| expo-updates | OTA updates | Push bug fixes and content updates without app store release |
| bun | Package manager | Used for all package management operations |

> **💡 Suggestion — Why Zustand + TanStack Query + expo-sqlite (not just one):**
>
> Each layer has a distinct job in the offline architecture:
>
> - **expo-sqlite** = persistence layer (data survives app kills/restarts)
> - **TanStack Query** = async read cache (avoids redundant SQLite reads, provides stale-while-revalidate, auto query invalidation after writes)
> - **Zustand** = synchronous UI state (selection mode, currently selected ayahs before save, view toggle, modal states). Replaces scattered React Context providers and avoids unnecessary re-renders.
> - **Reanimated shared values** = animation-thread state (glow intensities, transition progress). Never touch the JS thread.
>
> **Data flow:** `SQLite (disk)` → `TanStack Query (async cache)` → `Zustand (UI state)` → `Reanimated (animation state)` → `Skia (GPU render)`

> **💡 Suggestion — Consider adding:**
> - **expo-file-system** — for JSON export/import of progress backups
> - **react-native-mmkv** — as a faster alternative to AsyncStorage for simple key-value settings (e.g., theme, last viewed surah). Can replace the `user_settings` SQLite table for non-relational prefs.

---

## 4. Data Source

### 4.1 Repository

All Quran data is sourced from the open-source repository: **github.com/semarketir/quranjson** (MIT license). The data contains 6,236 verses across 114 Surahs and 30 Juz.

### 4.2 Data Structure

| File / Path | Description | Usage |
|---|---|---|
| `source/surah.json` | Index of all 114 Surahs with metadata (name, Arabic name, translation, type, total verses) | Populate Surah grid, metadata display |
| `source/surah/surah_{1-114}.json` | Individual Surah files with all verses (Arabic text, verse number) | Display Ayah text for highlighting/memorizing |
| `source/juz.json` | Juz index mapping (Juz number to start/end Surah and Ayah) | Build Juz grid, map Ayahs to Juz |

### 4.3 Data Bundling Strategy

1. **Bundle** `surah.json` and `juz.json` with the app binary (they are small index files).
2. **Bundle all 114** individual Surah JSON files as local assets. Total size is approximately 3–4 MB for Arabic text, which is acceptable for bundling.
3. Use **TanStack Query** to load and cache individual Surah files on-demand from the asset bundle for memory efficiency.

> **💡 Suggestion:** Pre-process all 114 Surah JSON files into a single optimized SQLite table at build time (or on first launch). This would let you query ayahs by surah/juz with SQL instead of loading/parsing JSON files. Keeps the architecture uniform: everything reads from SQLite.

---

## 5. Database Schema (expo-sqlite)

The local SQLite database stores all user progress. **No backend server is required.** The database should be created on first app launch.

### 5.1 Tables

#### `memorized_ayahs`

The primary table tracking which Ayahs the user has memorized.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| surah_number | INTEGER NOT NULL | Surah number (1–114) |
| ayah_number | INTEGER NOT NULL | Ayah number within the Surah |
| juz_number | INTEGER NOT NULL | Juz this Ayah belongs to (1–30) |
| memorized_at | TEXT NOT NULL | ISO 8601 timestamp of when it was marked memorized |
| confidence | INTEGER DEFAULT 1 | Optional: user's self-rated confidence (1–5) |

**UNIQUE** constraint on `(surah_number, ayah_number)` to prevent duplicates.

#### `review_log`

Tracks review sessions for spaced repetition (future feature).

| Column | Type | Description |
|---|---|---|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| surah_number | INTEGER NOT NULL | Surah number reviewed |
| ayah_start | INTEGER NOT NULL | Starting Ayah of review range |
| ayah_end | INTEGER NOT NULL | Ending Ayah of review range |
| reviewed_at | TEXT NOT NULL | ISO 8601 timestamp |
| quality | INTEGER | Review quality rating (1–5) |

#### `user_settings`

Key-value store for user preferences.

| Column | Type | Description |
|---|---|---|
| key | TEXT PRIMARY KEY | Setting key (e.g., `daily_goal`, `notification_time`, `theme`) |
| value | TEXT NOT NULL | Setting value (JSON-encoded if complex) |

> **💡 Suggestion — Additional tables to consider:**
>
> **`daily_progress`** — Aggregate table for fast streak/chart queries:
> | Column | Type | Description |
> |---|---|---|
> | date | TEXT PRIMARY KEY | ISO date (YYYY-MM-DD) |
> | ayahs_memorized | INTEGER | Count of ayahs memorized that day |
> | ayahs_reviewed | INTEGER | Count of ayahs reviewed that day |
>
> This avoids expensive `GROUP BY DATE(memorized_at)` queries for the progress charts and streak calculation. Insert/update via trigger or in the memorization write path.

> **💡 Suggestion:** Add a `last_modified` column to `memorized_ayahs` to support future cloud sync conflict resolution. Cheap to add now, painful to migrate later.

---

## 6. App Architecture

### 6.1 Directory Structure

The app uses expo-router file-based routing. Below is the recommended directory layout:

| Path | Purpose |
|---|---|
| `app/` | Expo Router pages and layouts |
| `app/(tabs)/` | Tab-based navigation layout |
| `app/(tabs)/index.tsx` | Home screen — Juz/Surah orb grid |
| `app/(tabs)/progress.tsx` | Progress & statistics dashboard |
| `app/(tabs)/settings.tsx` | Settings screen |
| `app/surah/[id].tsx` | Surah detail — Ayah list with highlight interaction |
| `app/juz/[id].tsx` | Juz detail — shows Surahs within that Juz as orbs |
| `src/components/` | Reusable UI components |
| `src/components/GlowOrb.tsx` | Skia-rendered glowing circle component |
| `src/components/OrbGrid.tsx` | Grid layout for orbs (Juz or Surah level) |
| `src/components/AyahText.tsx` | Arabic Ayah text with highlight/selection support |
| `src/components/ProgressRing.tsx` | Circular progress indicator using Skia |
| `src/db/` | Database layer |
| `src/db/schema.ts` | SQLite table creation and migration queries |
| `src/db/queries.ts` | CRUD operations for memorization data |
| `src/stores/` | **Zustand stores** |
| `src/stores/useSelectionStore.ts` | Ayah selection mode & selected ayahs |
| `src/stores/useViewStore.ts` | View mode toggle (Juz/Surah), active filters |
| `src/stores/useAppStore.ts` | General app state (onboarding complete, etc.) |
| `src/hooks/` | Custom React hooks |
| `src/hooks/useMemorization.ts` | Hook wrapping TanStack Query + SQLite for memorization state |
| `src/hooks/useQuranData.ts` | Hook for loading Quran JSON data |
| `src/hooks/useGlow.ts` | Hook to compute glow intensity from memorization progress |
| `src/utils/` | Utility functions |
| `src/utils/glow.ts` | Glow intensity calculation logic |
| `src/utils/quran.ts` | Quran data parsing, Juz–Surah–Ayah mapping |
| `src/constants/` | Theme colors, Quran constants, animation configs |
| `src/shaders/` | Skia shader source files (.glsl or inline SkSL) |
| `assets/data/` | Bundled Quran JSON files |
| `assets/fonts/` | Arabic fonts (Uthmanic script) |

---

## 7. Navigation Structure

### 7.1 Tab Navigator

The app uses a bottom tab navigator with three tabs:

| Tab | Icon | Screen | Description |
|---|---|---|---|
| Home | Grid / Mosque icon | `(tabs)/index.tsx` | Main orb grid showing all 30 Juz or 114 Surahs |
| Progress | Chart / Stats icon | `(tabs)/progress.tsx` | Statistics, streak counter, memorization timeline |
| Settings | Gear icon | `(tabs)/settings.tsx` | Notification preferences, theme, daily goal, data export |

### 7.2 Stack Screens (Nested)

- **Juz Detail (`app/juz/[id].tsx`):** Opened when tapping a Juz orb. Shows the Surahs contained in that Juz as a sub-grid of orbs.
- **Surah Detail (`app/surah/[id].tsx`):** Opened when tapping a Surah orb (from Home or from Juz detail). Displays all Ayahs with Arabic text, highlight interaction, and memorization controls.

### 7.3 View Mode Toggle

The Home screen should offer a toggle to switch between two grid views:

- **Juz View (default):** 30 orbs representing the 30 Juz. Tapping opens Juz detail.
- **Surah View:** 114 orbs representing all 114 Surahs. Tapping opens Surah detail directly.

> **💡 Suggestion:** The view mode toggle state is a great candidate for **Zustand** — it needs to persist across tab switches but doesn't need to survive app restarts (or if it does, Zustand has a `persist` middleware that works with MMKV/AsyncStorage).

---

## 8. Screen Specifications

### 8.1 Home Screen (Orb Grid)

This is the centerpiece of the app. It displays a grid of glowing orbs.

#### Layout

- Grid of circular orbs arranged in rows (5–6 per row for Juz view, 6–8 per row for Surah view)
- Each orb shows the Juz number or Surah number
- Below each orb: label (e.g., "Juz 1" or the Arabic Surah name "الفاتحة")
- View mode toggle at the top (Juz / Surah)
- Overall progress percentage displayed at the top of the screen

#### Glow Rendering (Skia)

Each orb is rendered as a Skia Canvas element using a custom shader or composited drawing:

1. **Base circle:** A solid circle with a fill color based on progress percentage.
2. **Inner glow:** A radial gradient emanating from the center, opacity tied to memorization percentage.
3. **Outer glow (bloom):** A blurred, larger circle behind the main orb using Skia's blur image filter, creating a soft halo. Intensity scales with progress.
4. **Color mapping:** Use a function that maps 0–100% progress to the gold palette (grey → `#d4af37` at increasing opacity → `#ffd700` core).

#### Interactions

- **Tap:** Navigate to Juz or Surah detail screen
- **Long press:** Show a tooltip/popover with quick stats (e.g., "42/148 Ayahs memorized")
- **Animated transitions:** Use Reanimated shared element transitions when navigating from orb to detail screen

> **💡 Suggestion:** Consider rendering the entire orb grid in a **single Skia Canvas** rather than one Canvas per orb. This dramatically reduces native view count and improves scroll performance, especially for the 114-surah grid. Use touch coordinates to determine which orb was tapped.

### 8.2 Juz Detail Screen

Shown when a Juz orb is tapped. Displays the Surahs within that Juz as a sub-grid of orbs.

- Header: Juz number and name, overall Juz progress bar
- Sub-grid: Orbs for each Surah in the Juz, with their own glow intensity
- Tapping a Surah orb navigates to the Surah Detail screen
- Animated entry: orbs should animate in with a staggered fade/scale using Reanimated layout animations

### 8.3 Surah Detail Screen (Core Interaction)

This is where the user actually marks Ayahs as memorized. It is the most interaction-heavy screen.

#### Layout

- Header: Surah name (Arabic + transliteration), Surah number, total Ayahs, memorization progress
- Bismillah: Display Bismillah at the top (except for Surah 9 — At-Tawbah)
- Ayah List: Scrollable list of Ayahs displayed in proper Uthmanic Arabic script
- Each Ayah row shows: Ayah number (in Arabic), Arabic text, and a memorized indicator icon

#### Memorization Interaction Flow

1. **Selection Mode:** User taps a "Start Memorizing" button or long-presses an Ayah to enter selection mode.
2. **Highlight:** User taps individual Ayahs to toggle selection, or uses a "select range" gesture (tap first, then tap last to select all in between).
3. **Visual Feedback:** Selected Ayahs get a glowing highlight background (`#ffd700` bright gold tint) using Reanimated.
4. **Confirm:** A floating action button appears: "Mark as Memorized". Tapping it writes the selected Ayahs to SQLite.
5. **Celebration:** A brief confetti or shimmer animation plays on confirmation. The Surah's orb glow updates.
6. **Undo:** A toast/snackbar appears for 5 seconds with an "Undo" action in case of accidental marking.

> **💡 Suggestion — Zustand for selection state:**
> The selection flow (step 1–4) is a perfect Zustand use case:
> ```ts
> // src/stores/useSelectionStore.ts
> interface SelectionStore {
>   isSelecting: boolean;
>   selectedAyahs: Set<string>; // "surah:ayah" keys
>   rangeStart: string | null;
>   enterSelectionMode: () => void;
>   toggleAyah: (key: string) => void;
>   selectRange: (start: string, end: string) => void;
>   clearSelection: () => void;
>   confirmSelection: () => Promise<void>; // writes to SQLite, invalidates queries
> }
> ```
> This keeps selection state accessible across the FAB, the ayah list, and the header without prop drilling.

#### Already Memorized Ayahs

- Memorized Ayahs should display with a subtle gold background tint (`#d4af370F` card glow) and a small checkmark or glow icon
- Tapping a memorized Ayah should prompt: "Remove from memorized?" with a confirmation dialog

### 8.4 Progress Screen

A dashboard showing the user's overall memorization statistics.

#### Key Metrics to Display

- Total Ayahs memorized / 6,236
- Total Surahs completed / 114
- Total Juz completed / 30
- Percentage memorized (overall, per Juz, per Surah)
- Current streak (consecutive days with at least 1 Ayah memorized)
- Daily/weekly memorization chart (line or bar chart rendered via Skia)
- Recent activity log (last 10 memorized Ayah entries with timestamps)

#### Visual Elements

- Large circular progress ring (Skia-rendered) showing overall percentage
- Mini orb row showing Juz completion status at a glance
- Charts rendered with Skia Canvas for a consistent look

> **💡 Suggestion:** The streak calculation can be expensive if done with raw queries on `memorized_ayahs`. The suggested `daily_progress` aggregate table (Section 5) makes streak calculation a simple sequential date scan.

### 8.5 Settings Screen

- **Daily Goal:** Set a daily Ayah memorization target (e.g., 5, 10, 20 Ayahs/day)
- **Notifications:** Enable/disable daily reminder. Set reminder time using a time picker.
- **Theme:** Dark (default) or AMOLED Black mode
- **Data Management:** Export progress as JSON. Reset all progress (with double confirmation).
- **About:** App version, credits, link to Quran data source

> **💡 Suggestion:** Add a **"Backup & Restore"** option that exports/imports the SQLite database file directly (via `expo-file-system` + share sheet). This is the simplest offline backup strategy and covers device migration.

---

## 9. Glow Intensity System

The glow system is the visual heart of the app. It must be precisely defined so that implementation is consistent.

### 9.1 Calculation

For any unit (Ayah, Surah, or Juz), the glow intensity is a float from 0.0 to 1.0:

- **Ayah Level:** Binary — 0.0 (not memorized) or 1.0 (memorized).
- **Surah Level:** `glowIntensity = memorizedAyahsInSurah / totalAyahsInSurah`
- **Juz Level:** `glowIntensity = memorizedAyahsInJuz / totalAyahsInJuz`

### 9.2 Visual Mapping

See the **Glow Intensity → Color Mapping** table in Section 2.2 for the full color progression. The mapping uses the app's gold palette (`#d4af37` / `#ffd700`) with opacity scaling rather than discrete color stops, creating a smooth and unified visual progression from dim grey to radiant gold.

### 9.3 Skia Shader Approach

Each GlowOrb component should use a Skia Canvas with the following layered rendering approach:

1. **Background blur layer:** A Circle with a BlurMaskFilter (sigma proportional to intensity) for the outer bloom.
2. **Base fill layer:** A filled Circle with color interpolated from the intensity color map.
3. **Inner radial gradient:** A RadialGradient shader from white-center to transparent-edge, opacity = intensity.
4. **Optional SkSL shader:** For advanced effects (shimmer on 1.0 intensity orbs), use a custom runtime shader with a time uniform for animation.

> **💡 Suggestion:** Cache computed glow values in Zustand or a derived TanStack Query. When a user memorizes ayahs, invalidate only the affected Surah/Juz glow queries rather than recomputing the entire grid. This keeps the grid update snappy even at high memorization counts.

---

## 10. Animations & Transitions

All animations use react-native-reanimated for 60fps performance on the UI thread.

| Interaction | Animation | Library |
|---|---|---|
| Orb tap → Detail screen | Shared element transition: orb scales and morphs into screen header | Reanimated + expo-router |
| Orb grid load | Staggered fade-in with scale: each orb enters with a 30–50ms delay | Reanimated entering/exiting |
| Glow intensity change | Smooth color and blur interpolation over 500ms when progress updates | Reanimated shared values |
| Ayah selection | Background color fade to gold tint (150ms ease-in-out) | Reanimated |
| Mark as memorized | Confetti burst or golden shimmer particle effect | Skia + Reanimated |
| Long-press tooltip | Scale-in with spring animation from the pressed orb | Reanimated + Gesture Handler |
| View mode toggle | Layout animation: orbs reflow with LayoutAnimation.spring() | Reanimated layout animation |
| Progress ring update | Animated stroke-dashoffset fill over 800ms | Skia + Reanimated |

---

## 11. Notifications (expo-notifications)

### 11.1 Local Notification Types

| Notification | Trigger | Content |
|---|---|---|
| Daily Reminder | Scheduled daily at user-set time | Motivational message reminding user to continue their Hifz journey |
| Streak Alert | If user misses a day | Gentle nudge: "Your 15-day streak is at risk! Memorize just 1 Ayah to keep it alive." |
| Milestone Celebration | On completing a Surah or Juz | Congratulatory message: "You completed Surah Al-Baqarah! ✦" |

### 11.2 Implementation Notes

- Use expo-notifications for scheduling local notifications (no push server needed for MVP)
- Request notification permissions on first app launch with a friendly onboarding prompt
- Store notification preferences in the `user_settings` SQLite table
- Cancel and reschedule notifications when user changes their reminder time

---

## 12. State Management Strategy

The app uses a **layered offline-first state management** approach. Each layer has a specific responsibility:

### 12.1 Layer Overview

| Layer | Tool | Responsibility | Thread |
|---|---|---|---|
| **Persistence** | expo-sqlite | Source of truth for all user data. Survives app kills, restarts, updates. | JS |
| **Async Cache** | TanStack Query | Caches SQLite reads and Quran JSON loads. Provides stale-while-revalidate, background refetch, and query invalidation. | JS |
| **UI State** | Zustand | Synchronous, non-persisted UI state: selection mode, selected ayahs, view toggles, modal states. Replaces React Context. | JS |
| **Animation State** | Reanimated Shared Values | Glow intensities, transition progress, gesture values. Runs on UI thread — never touches JS bridge. | UI |

### 12.2 Why Zustand over React Context

- **No provider nesting** — Zustand stores are plain hooks, no `<Provider>` wrappers needed
- **Selective re-renders** — components subscribe to specific slices, not the entire store
- **Middleware** — `persist` middleware can auto-save view preferences to MMKV
- **Tiny** — ~1KB gzipped, negligible bundle impact
- **Devtools** — works with React Native Debugger

### 12.3 Zustand Store Design

```
useSelectionStore  — isSelecting, selectedAyahs, rangeStart, actions
useViewStore       — viewMode (juz|surah), sortOrder, actions
useAppStore        — hasOnboarded, lastViewedSurah, actions
```

### 12.4 TanStack Query Key Structure

Suggested TanStack Query keys for consistent caching:

- `["surahs"]` — all Surah metadata
- `["surah", surahNumber]` — individual Surah with Ayahs
- `["juz"]` — all Juz metadata
- `["memorized", "all"]` — all memorized Ayahs from SQLite
- `["memorized", "surah", surahNumber]` — memorized Ayahs for a specific Surah
- `["memorized", "juz", juzNumber]` — memorized Ayahs for a specific Juz
- `["progress", "stats"]` — aggregated progress statistics

### 12.5 Write Flow (Memorization)

```
User confirms selection
  → Zustand: read selectedAyahs
  → SQLite: INSERT into memorized_ayahs
  → TanStack Query: invalidateQueries(["memorized", "surah", X])
  → TanStack Query: invalidateQueries(["progress"])
  → Zustand: clearSelection()
  → Reanimated: animate glow intensity change
```

---

## 13. Quran Data Mapping Logic

The data source provides Surah and Juz data separately. The app needs a mapping layer to connect them.

### 13.1 Juz-to-Surah-to-Ayah Mapping

The `juz.json` file provides start and end positions for each Juz (Surah number + Ayah number). The app needs a utility that, given a Juz number, returns the list of Surahs and Ayah ranges within it. This is critical for calculating Juz-level glow intensity and rendering the Juz detail screen.

**Implementation recommendation:** Build a static lookup table at app startup that maps each Ayah `(surah, ayah)` to its Juz number. Store this in memory. This allows O(1) lookup for any Ayah's Juz, and efficient aggregation for glow calculations.

### 13.2 Key Utility Functions Needed

- **`getAyahsForJuz(juzNumber)`** — Returns array of `{surahNumber, ayahNumber}` for all Ayahs in a Juz
- **`getJuzForAyah(surahNumber, ayahNumber)`** — Returns the Juz number for a given Ayah
- **`getSurahsInJuz(juzNumber)`** — Returns array of Surah numbers (and partial ranges) present in a Juz
- **`getGlowIntensity(type, id)`** — Computes glow for a Juz or Surah by querying `memorized_ayahs`
- **`getTotalAyahsInJuz(juzNumber)`** — Returns total count of Ayahs in a Juz

---

## 14. Performance Considerations

- **Skia rendering:** Render orbs in a single Skia Canvas where possible instead of individual Canvas per orb. This reduces the number of native views and improves scroll/grid performance.
- **Virtualized lists:** Use FlashList or FlatList for the Ayah list in Surah detail to handle long Surahs (e.g., Al-Baqarah with 286 Ayahs) efficiently.
- **Worklet-based glow:** Compute glow color/blur values in Reanimated worklets to avoid bridge overhead.
- **Memoization:** Use `React.memo` and `useMemo` for orb components to prevent unnecessary re-renders when only one orb's glow changes.
- **SQLite queries:** Index `memorized_ayahs` on `(surah_number, ayah_number)` and `juz_number` for fast lookups.
- **Lazy Surah loading:** Only load the full Ayah text for a Surah when the user navigates to it. Keep the Surah grid operating on metadata only.

> **💡 Suggestion — Additional performance considerations:**
> - **SQLite WAL mode:** Enable Write-Ahead Logging for concurrent reads during writes: `PRAGMA journal_mode=WAL;`
> - **Prepared statements:** Use expo-sqlite's prepared statement API for repeated queries (memorization checks)
> - **Zustand selectors:** Use shallow equality selectors to prevent re-renders: `const isSelecting = useSelectionStore(s => s.isSelecting)`

---

## 15. Future Features (Post-MVP)

These features are not required for the initial release but should be considered in the architecture:

- **Spaced Repetition:** Smart review scheduling based on the `review_log` table, reminding users to review memorized sections at optimal intervals.
- **Audio Playback:** Play recitation audio for Ayahs (data available in the quranjson audio folder). Useful for memorization practice.
- **Cloud Sync:** Sync progress across devices using a backend service or a service like Supabase.
- **Social / Accountability:** Share progress with friends, join memorization groups, or pair with a memorization partner.
- **Tajweed Highlights:** Color-coded tajweed rules overlay on Arabic text (data available in quranjson tajweed folder).
- **Widgets:** iOS/Android home screen widgets showing daily progress and streak.
- **Onboarding Flow:** First-launch tutorial explaining the orb metaphor and how to use the app.
- **Search:** Search for Ayahs by text or by Surah/Ayah number.

> **💡 Suggestion — Architecture-now, build-later:**
> - Design the `review_log` table schema now even if spaced repetition is post-MVP (it's already in the schema — good).
> - Add the `last_modified` column to `memorized_ayahs` now for future cloud sync.
> - Structure Zustand stores to be serializable so they can feed into a future sync engine.

---

## 16. Development Guidelines

### 16.1 Code Standards

- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- All components should be functional components with hooks
- Use absolute imports with `@` path alias (e.g., `@/components/GlowOrb`)
- Follow Expo's recommended project structure conventions

### 16.2 Testing

- Unit tests for utility functions (glow calculation, Quran data mapping) with Jest
- Component tests for key interactions (Ayah selection, memorization flow)
- SQLite query tests using an in-memory database

> **💡 Suggestion:** Zustand stores are trivially testable — they're plain functions. Test selection logic (range selection, toggle, clear) independently of React components.

### 16.3 Getting Started Commands

Using bun as the package manager:

| Command | Description |
|---|---|
| `bunx create-expo-app diyaa-alquran --template default` | Initialize the Expo project |
| `bun install` | Install all dependencies |
| `bun run start` | Start the Expo development server |
| `bun run ios` | Run on iOS simulator |
| `bun run android` | Run on Android emulator |
| `bunx expo install <package>` | Add Expo-compatible packages |

---

## 17. MVP Acceptance Criteria

The minimum viable product is considered complete when the following criteria are met:

1. The app displays a grid of 30 Juz orbs and 114 Surah orbs with view toggle
2. Each orb's glow intensity accurately reflects the number of memorized Ayahs within it
3. Tapping a Juz orb opens a detail view showing the Surahs within that Juz
4. Tapping a Surah orb opens a detail view showing all Ayahs in proper Arabic script
5. Users can select one or more Ayahs and mark them as memorized
6. Memorization state persists across app restarts (SQLite)
7. Users can remove Ayahs from their memorized list
8. The Progress screen shows accurate statistics (total memorized, Surah/Juz completion, streak)
9. Daily reminder notification can be scheduled
10. The app performs smoothly with no dropped frames during orb grid scrolling and glow animations
11. **The app works fully offline with zero network dependency**

---

## Appendix: State Management Decision Matrix

| State Type | Example | Tool | Persisted? |
|---|---|---|---|
| User progress data | Memorized ayahs, review logs | expo-sqlite | ✅ Disk |
| Quran content | Surah text, Juz mappings | TanStack Query (from bundled JSON) | ✅ Memory cache |
| User preferences | Theme, daily goal, notification time | expo-sqlite (`user_settings`) or MMKV | ✅ Disk |
| Selection state | Which ayahs are currently selected | Zustand | ❌ Ephemeral |
| View state | Juz vs Surah toggle, scroll position | Zustand (optionally persisted) | ⚡ Optional |
| Animation values | Glow intensity, transition progress | Reanimated shared values | ❌ UI thread only |
