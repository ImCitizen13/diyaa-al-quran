import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllSurahs, getSurahsInJuz, getJuzForAyah, TOTAL_AYAHS, TOTAL_SURAHS, TOTAL_JUZ } from './quran-data';

const STORAGE_KEY = '@diyaa_memorized';
const DAILY_LOG_KEY = '@diyaa_daily_log';
const SETTINGS_KEY = '@diyaa_settings';

export interface MemorizedEntry {
  surahNumber: number;
  ayahNumber: number;
  juzNumber: number;
  memorizedAt: string;
}

export interface DailyLog {
  [date: string]: number;
}

export interface AppSettings {
  dailyGoal: number;
}

interface MemorizationContextValue {
  memorizedAyahs: Map<string, MemorizedEntry>;
  isLoading: boolean;
  memorizeAyahs: (entries: { surahNumber: number; ayahNumber: number }[]) => Promise<void>;
  unmemorizeAyah: (surahNumber: number, ayahNumber: number) => Promise<void>;
  isMemorized: (surahNumber: number, ayahNumber: number) => boolean;
  getSurahProgress: (surahNumber: number) => { memorized: number; total: number; percentage: number };
  getJuzProgress: (juzNumber: number) => { memorized: number; total: number; percentage: number };
  getOverallProgress: () => { memorized: number; total: number; percentage: number; surahsComplete: number; juzComplete: number };
  getStreak: () => number;
  getTodayCount: () => number;
  dailyLog: DailyLog;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  exportData: () => Promise<string>;
  resetAllData: () => Promise<void>;
}

const MemorizationContext = createContext<MemorizationContextValue | null>(null);

function getDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function MemorizationProvider({ children }: { children: ReactNode }) {
  const [memorizedAyahs, setMemorizedAyahs] = useState<Map<string, MemorizedEntry>>(new Map());
  const [dailyLog, setDailyLog] = useState<DailyLog>({});
  const [settings, setSettings] = useState<AppSettings>({ dailyGoal: 5 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [memorizedData, dailyData, settingsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(DAILY_LOG_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);

      if (memorizedData) {
        const entries: MemorizedEntry[] = JSON.parse(memorizedData);
        const map = new Map<string, MemorizedEntry>();
        entries.forEach((e) => map.set(`${e.surahNumber}:${e.ayahNumber}`, e));
        setMemorizedAyahs(map);
      }

      if (dailyData) {
        setDailyLog(JSON.parse(dailyData));
      }

      if (settingsData) {
        setSettings({ ...settings, ...JSON.parse(settingsData) });
      }
    } catch (error) {
      console.error('Failed to load memorization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMemorized = useCallback(async (map: Map<string, MemorizedEntry>) => {
    const entries = Array.from(map.values());
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, []);

  const saveDailyLog = useCallback(async (log: DailyLog) => {
    await AsyncStorage.setItem(DAILY_LOG_KEY, JSON.stringify(log));
  }, []);

  const memorizeAyahs = useCallback(async (entries: { surahNumber: number; ayahNumber: number }[]) => {
    setMemorizedAyahs((prev) => {
      const newMap = new Map(prev);
      const now = new Date().toISOString();
      let newCount = 0;

      entries.forEach(({ surahNumber, ayahNumber }) => {
        const key = `${surahNumber}:${ayahNumber}`;
        if (!newMap.has(key)) {
          newMap.set(key, {
            surahNumber,
            ayahNumber,
            juzNumber: getJuzForAyah(surahNumber, ayahNumber),
            memorizedAt: now,
          });
          newCount++;
        }
      });

      if (newCount > 0) {
        saveMemorized(newMap);
        const dateKey = getDateKey();
        setDailyLog((prevLog) => {
          const newLog = { ...prevLog, [dateKey]: (prevLog[dateKey] || 0) + newCount };
          saveDailyLog(newLog);
          return newLog;
        });
      }

      return newMap;
    });
  }, [saveMemorized, saveDailyLog]);

  const unmemorizeAyah = useCallback(async (surahNumber: number, ayahNumber: number) => {
    setMemorizedAyahs((prev) => {
      const newMap = new Map(prev);
      newMap.delete(`${surahNumber}:${ayahNumber}`);
      saveMemorized(newMap);
      return newMap;
    });
  }, [saveMemorized]);

  const isMemorized = useCallback((surahNumber: number, ayahNumber: number): boolean => {
    return memorizedAyahs.has(`${surahNumber}:${ayahNumber}`);
  }, [memorizedAyahs]);

  const getSurahProgress = useCallback((surahNumber: number) => {
    const surah = getAllSurahs().find((s) => s.index === surahNumber);
    if (!surah) return { memorized: 0, total: 0, percentage: 0 };

    let memorized = 0;
    for (let i = 1; i <= surah.count; i++) {
      if (memorizedAyahs.has(`${surahNumber}:${i}`)) memorized++;
    }

    return {
      memorized,
      total: surah.count,
      percentage: surah.count > 0 ? memorized / surah.count : 0,
    };
  }, [memorizedAyahs]);

  const getJuzProgress = useCallback((juzNumber: number) => {
    const surahsInJuz = getSurahsInJuz(juzNumber);
    let memorized = 0;
    let total = 0;

    surahsInJuz.forEach(({ surahNumber, startVerse, endVerse }) => {
      for (let i = startVerse; i <= endVerse; i++) {
        total++;
        if (memorizedAyahs.has(`${surahNumber}:${i}`)) memorized++;
      }
    });

    return {
      memorized,
      total,
      percentage: total > 0 ? memorized / total : 0,
    };
  }, [memorizedAyahs]);

  const getOverallProgress = useCallback(() => {
    const memorized = memorizedAyahs.size;
    const allSurahs = getAllSurahs();

    let surahsComplete = 0;
    allSurahs.forEach((s) => {
      let complete = true;
      for (let i = 1; i <= s.count; i++) {
        if (!memorizedAyahs.has(`${s.index}:${i}`)) {
          complete = false;
          break;
        }
      }
      if (complete) surahsComplete++;
    });

    let juzComplete = 0;
    for (let j = 1; j <= TOTAL_JUZ; j++) {
      const progress = getJuzProgress(j);
      if (progress.percentage >= 1) juzComplete++;
    }

    return {
      memorized,
      total: TOTAL_AYAHS,
      percentage: TOTAL_AYAHS > 0 ? memorized / TOTAL_AYAHS : 0,
      surahsComplete,
      juzComplete,
    };
  }, [memorizedAyahs, getJuzProgress]);

  const getStreak = useCallback((): number => {
    const today = new Date();
    let streak = 0;
    let date = new Date(today);

    while (true) {
      const key = date.toISOString().split('T')[0];
      if (dailyLog[key] && dailyLog[key] > 0) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [dailyLog]);

  const getTodayCount = useCallback((): number => {
    return dailyLog[getDateKey()] || 0;
  }, [dailyLog]);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const exportData = useCallback(async (): Promise<string> => {
    const data = {
      memorizedAyahs: Array.from(memorizedAyahs.values()),
      dailyLog,
      settings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }, [memorizedAyahs, dailyLog, settings]);

  const resetAllData = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(DAILY_LOG_KEY),
      AsyncStorage.removeItem(SETTINGS_KEY),
    ]);
    setMemorizedAyahs(new Map());
    setDailyLog({});
    setSettings({ dailyGoal: 5 });
  }, []);

  const value = useMemo(() => ({
    memorizedAyahs,
    isLoading,
    memorizeAyahs,
    unmemorizeAyah,
    isMemorized,
    getSurahProgress,
    getJuzProgress,
    getOverallProgress,
    getStreak,
    getTodayCount,
    dailyLog,
    settings,
    updateSettings,
    exportData,
    resetAllData,
  }), [memorizedAyahs, isLoading, memorizeAyahs, unmemorizeAyah, isMemorized, getSurahProgress, getJuzProgress, getOverallProgress, getStreak, getTodayCount, dailyLog, settings, updateSettings, exportData, resetAllData]);

  return (
    <MemorizationContext.Provider value={value}>
      {children}
    </MemorizationContext.Provider>
  );
}

export function useMemorization() {
  const context = useContext(MemorizationContext);
  if (!context) {
    throw new Error('useMemorization must be used within a MemorizationProvider');
  }
  return context;
}
