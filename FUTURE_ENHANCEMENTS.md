# Diyaa Al-Quran — Future Enhancements

This document captures features and technical upgrades deferred from the MVP build (Expo Go compatible) for future implementation with a development build.

---

## Technical Upgrades (Require Development Build)

### 1. Skia Rendering (@shopify/react-native-skia)
- Replace gradient/shadow-based GlowOrb with GPU-accelerated Skia shaders
- Custom SkSL shaders for bloom effects, radial gradients, and shimmer animations
- Single Skia Canvas for entire orb grid (reduces native view count)
- Skia-rendered progress rings and charts for visual consistency
- Particle effects on fully memorized orbs (intensity = 1.0)

### 2. expo-sqlite for Persistence
- Replace AsyncStorage with proper SQLite database
- Tables: `memorized_ayahs`, `review_log`, `user_settings`, `daily_progress`
- Indexed queries on `(surah_number, ayah_number)` and `juz_number`
- WAL mode for concurrent reads during writes
- Prepared statements for repeated memorization queries
- `last_modified` column for future cloud sync conflict resolution

### 3. Zustand for State Management
- Replace React Context with Zustand stores:
  - `useSelectionStore` — selection mode, selected ayahs, range start
  - `useViewStore` — Juz/Surah view mode toggle, sort order
  - `useAppStore` — onboarding state, last viewed surah
- Selective re-renders via slice selectors
- `persist` middleware with MMKV for view preferences
- No provider nesting required

### 4. react-native-mmkv
- Faster key-value storage for simple settings (theme, last viewed surah)
- Alternative to AsyncStorage for non-relational preferences

---

## Feature Enhancements

### 5. Local Notifications (expo-notifications)
- Daily memorization reminders at user-set time
- Streak at-risk alerts ("Your 15-day streak is at risk!")
- Milestone celebrations (Surah/Juz completion)
- Permission request during onboarding

### 6. Spaced Repetition System
- Smart review scheduling based on `review_log` table
- Quality ratings (1-5) per review session
- Optimal interval calculations for review reminders
- Review mode in Surah detail screen

### 7. Audio Playback
- Recitation audio for each Ayah (data available in quranjson audio folder)
- Play/pause controls in Surah detail screen
- Auto-advance to next Ayah
- Repeat mode for memorization practice

### 8. Cloud Sync
- Sync progress across devices via backend service (e.g., Supabase)
- Conflict resolution using `last_modified` timestamps
- Account creation and authentication
- Automatic background sync

### 9. Tajweed Highlights
- Color-coded tajweed rules overlay on Arabic text
- Data available in quranjson tajweed folder
- Toggle on/off in settings

### 10. Home Screen Widgets
- iOS/Android widgets showing daily progress and streak
- Quick-access to continue memorization

### 11. Onboarding Flow
- First-launch tutorial explaining the orb metaphor
- Goal-setting wizard (daily target, notification preferences)
- Animated walkthrough of key features

### 12. Search
- Search for Ayahs by Arabic text
- Search by Surah name or number
- Search by Ayah number

### 13. Social / Accountability
- Share progress with friends
- Join memorization groups
- Pair with a memorization partner

### 14. Shared Element Transitions
- Orb scales and morphs into screen header when navigating
- Reanimated shared element transitions between screens

### 15. Confidence Levels
- User self-rated confidence (1-5) per memorized Ayah
- Visual indicator on Ayah cards (different gold shades)
- Filter/sort by confidence level

### 16. "Minimal Mode"
- Toggle replacing Skia orbs with simple colored circles + percentage labels
- For low-end devices, gated behind performance check at startup

---

## Data Architecture (for SQLite migration)

### Schema

```sql
CREATE TABLE memorized_ayahs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  juz_number INTEGER NOT NULL,
  memorized_at TEXT NOT NULL,
  confidence INTEGER DEFAULT 1,
  last_modified TEXT NOT NULL,
  UNIQUE(surah_number, ayah_number)
);

CREATE TABLE review_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  surah_number INTEGER NOT NULL,
  ayah_start INTEGER NOT NULL,
  ayah_end INTEGER NOT NULL,
  reviewed_at TEXT NOT NULL,
  quality INTEGER
);

CREATE TABLE user_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE daily_progress (
  date TEXT PRIMARY KEY,
  ayahs_memorized INTEGER,
  ayahs_reviewed INTEGER
);
```

### TanStack Query Key Structure
- `["surahs"]` — all Surah metadata
- `["surah", surahNumber]` — individual Surah with Ayahs
- `["juz"]` — all Juz metadata
- `["memorized", "all"]` — all memorized Ayahs
- `["memorized", "surah", surahNumber]` — memorized Ayahs for a Surah
- `["memorized", "juz", juzNumber]` — memorized Ayahs for a Juz
- `["progress", "stats"]` — aggregated progress statistics

---

*Last updated: February 2026*
