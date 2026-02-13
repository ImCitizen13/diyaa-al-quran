import surahIndex from '@/assets/data/surah.json';
import juzIndex from '@/assets/data/juz.json';

export interface SurahMeta {
  index: number;
  title: string;
  titleAr: string;
  place: string;
  type: string;
  count: number;
  juzList: { index: number; startVerse: number; endVerse: number }[];
}

export interface JuzMeta {
  index: number;
  startSurah: number;
  startVerse: number;
  endSurah: number;
  endVerse: number;
}

export interface Ayah {
  surahNumber: number;
  ayahNumber: number;
  text: string;
}

const parsedSurahs: SurahMeta[] = (surahIndex as any[]).map((s) => ({
  index: parseInt(s.index, 10),
  title: s.title,
  titleAr: s.titleAr,
  place: s.place,
  type: s.type,
  count: s.count,
  juzList: (s.juz || []).map((j: any) => ({
    index: parseInt(j.index, 10),
    startVerse: parseInt(j.verse.start.replace('verse_', ''), 10),
    endVerse: parseInt(j.verse.end.replace('verse_', ''), 10),
  })),
}));

const parsedJuz: JuzMeta[] = (juzIndex as any[]).map((j) => ({
  index: parseInt(j.index, 10),
  startSurah: parseInt(j.start.index, 10),
  startVerse: parseInt(j.start.verse.replace('verse_', ''), 10),
  endSurah: parseInt(j.end.index, 10),
  endVerse: parseInt(j.end.verse.replace('verse_', ''), 10),
}));

export function getAllSurahs(): SurahMeta[] {
  return parsedSurahs;
}

export function getAllJuz(): JuzMeta[] {
  return parsedJuz;
}

export function getSurahMeta(surahNumber: number): SurahMeta | undefined {
  return parsedSurahs.find((s) => s.index === surahNumber);
}

export function getJuzMeta(juzNumber: number): JuzMeta | undefined {
  return parsedJuz.find((j) => j.index === juzNumber);
}

export function getSurahsInJuz(juzNumber: number): { surahNumber: number; startVerse: number; endVerse: number }[] {
  const juz = getJuzMeta(juzNumber);
  if (!juz) return [];

  const result: { surahNumber: number; startVerse: number; endVerse: number }[] = [];

  for (const surah of parsedSurahs) {
    for (const j of surah.juzList) {
      if (j.index === juzNumber) {
        result.push({
          surahNumber: surah.index,
          startVerse: j.startVerse,
          endVerse: j.endVerse,
        });
      }
    }
  }

  return result;
}

export function getTotalAyahsInJuz(juzNumber: number): number {
  const surahs = getSurahsInJuz(juzNumber);
  return surahs.reduce((total, s) => total + (s.endVerse - s.startVerse + 1), 0);
}

export function getJuzForAyah(surahNumber: number, ayahNumber: number): number {
  const surah = parsedSurahs.find((s) => s.index === surahNumber);
  if (!surah) return 1;

  for (const j of surah.juzList) {
    if (ayahNumber >= j.startVerse && ayahNumber <= j.endVerse) {
      return j.index;
    }
  }
  return surah.juzList[0]?.index || 1;
}

const surahDataCache: Map<number, Record<string, string>> = new Map();

const surahFiles: Record<number, any> = {
  1: require('@/assets/data/surah/surah_1.json'),
  2: require('@/assets/data/surah/surah_2.json'),
  3: require('@/assets/data/surah/surah_3.json'),
  4: require('@/assets/data/surah/surah_4.json'),
  5: require('@/assets/data/surah/surah_5.json'),
  6: require('@/assets/data/surah/surah_6.json'),
  7: require('@/assets/data/surah/surah_7.json'),
  8: require('@/assets/data/surah/surah_8.json'),
  9: require('@/assets/data/surah/surah_9.json'),
  10: require('@/assets/data/surah/surah_10.json'),
  11: require('@/assets/data/surah/surah_11.json'),
  12: require('@/assets/data/surah/surah_12.json'),
  13: require('@/assets/data/surah/surah_13.json'),
  14: require('@/assets/data/surah/surah_14.json'),
  15: require('@/assets/data/surah/surah_15.json'),
  16: require('@/assets/data/surah/surah_16.json'),
  17: require('@/assets/data/surah/surah_17.json'),
  18: require('@/assets/data/surah/surah_18.json'),
  19: require('@/assets/data/surah/surah_19.json'),
  20: require('@/assets/data/surah/surah_20.json'),
  21: require('@/assets/data/surah/surah_21.json'),
  22: require('@/assets/data/surah/surah_22.json'),
  23: require('@/assets/data/surah/surah_23.json'),
  24: require('@/assets/data/surah/surah_24.json'),
  25: require('@/assets/data/surah/surah_25.json'),
  26: require('@/assets/data/surah/surah_26.json'),
  27: require('@/assets/data/surah/surah_27.json'),
  28: require('@/assets/data/surah/surah_28.json'),
  29: require('@/assets/data/surah/surah_29.json'),
  30: require('@/assets/data/surah/surah_30.json'),
  31: require('@/assets/data/surah/surah_31.json'),
  32: require('@/assets/data/surah/surah_32.json'),
  33: require('@/assets/data/surah/surah_33.json'),
  34: require('@/assets/data/surah/surah_34.json'),
  35: require('@/assets/data/surah/surah_35.json'),
  36: require('@/assets/data/surah/surah_36.json'),
  37: require('@/assets/data/surah/surah_37.json'),
  38: require('@/assets/data/surah/surah_38.json'),
  39: require('@/assets/data/surah/surah_39.json'),
  40: require('@/assets/data/surah/surah_40.json'),
  41: require('@/assets/data/surah/surah_41.json'),
  42: require('@/assets/data/surah/surah_42.json'),
  43: require('@/assets/data/surah/surah_43.json'),
  44: require('@/assets/data/surah/surah_44.json'),
  45: require('@/assets/data/surah/surah_45.json'),
  46: require('@/assets/data/surah/surah_46.json'),
  47: require('@/assets/data/surah/surah_47.json'),
  48: require('@/assets/data/surah/surah_48.json'),
  49: require('@/assets/data/surah/surah_49.json'),
  50: require('@/assets/data/surah/surah_50.json'),
  51: require('@/assets/data/surah/surah_51.json'),
  52: require('@/assets/data/surah/surah_52.json'),
  53: require('@/assets/data/surah/surah_53.json'),
  54: require('@/assets/data/surah/surah_54.json'),
  55: require('@/assets/data/surah/surah_55.json'),
  56: require('@/assets/data/surah/surah_56.json'),
  57: require('@/assets/data/surah/surah_57.json'),
  58: require('@/assets/data/surah/surah_58.json'),
  59: require('@/assets/data/surah/surah_59.json'),
  60: require('@/assets/data/surah/surah_60.json'),
  61: require('@/assets/data/surah/surah_61.json'),
  62: require('@/assets/data/surah/surah_62.json'),
  63: require('@/assets/data/surah/surah_63.json'),
  64: require('@/assets/data/surah/surah_64.json'),
  65: require('@/assets/data/surah/surah_65.json'),
  66: require('@/assets/data/surah/surah_66.json'),
  67: require('@/assets/data/surah/surah_67.json'),
  68: require('@/assets/data/surah/surah_68.json'),
  69: require('@/assets/data/surah/surah_69.json'),
  70: require('@/assets/data/surah/surah_70.json'),
  71: require('@/assets/data/surah/surah_71.json'),
  72: require('@/assets/data/surah/surah_72.json'),
  73: require('@/assets/data/surah/surah_73.json'),
  74: require('@/assets/data/surah/surah_74.json'),
  75: require('@/assets/data/surah/surah_75.json'),
  76: require('@/assets/data/surah/surah_76.json'),
  77: require('@/assets/data/surah/surah_77.json'),
  78: require('@/assets/data/surah/surah_78.json'),
  79: require('@/assets/data/surah/surah_79.json'),
  80: require('@/assets/data/surah/surah_80.json'),
  81: require('@/assets/data/surah/surah_81.json'),
  82: require('@/assets/data/surah/surah_82.json'),
  83: require('@/assets/data/surah/surah_83.json'),
  84: require('@/assets/data/surah/surah_84.json'),
  85: require('@/assets/data/surah/surah_85.json'),
  86: require('@/assets/data/surah/surah_86.json'),
  87: require('@/assets/data/surah/surah_87.json'),
  88: require('@/assets/data/surah/surah_88.json'),
  89: require('@/assets/data/surah/surah_89.json'),
  90: require('@/assets/data/surah/surah_90.json'),
  91: require('@/assets/data/surah/surah_91.json'),
  92: require('@/assets/data/surah/surah_92.json'),
  93: require('@/assets/data/surah/surah_93.json'),
  94: require('@/assets/data/surah/surah_94.json'),
  95: require('@/assets/data/surah/surah_95.json'),
  96: require('@/assets/data/surah/surah_96.json'),
  97: require('@/assets/data/surah/surah_97.json'),
  98: require('@/assets/data/surah/surah_98.json'),
  99: require('@/assets/data/surah/surah_99.json'),
  100: require('@/assets/data/surah/surah_100.json'),
  101: require('@/assets/data/surah/surah_101.json'),
  102: require('@/assets/data/surah/surah_102.json'),
  103: require('@/assets/data/surah/surah_103.json'),
  104: require('@/assets/data/surah/surah_104.json'),
  105: require('@/assets/data/surah/surah_105.json'),
  106: require('@/assets/data/surah/surah_106.json'),
  107: require('@/assets/data/surah/surah_107.json'),
  108: require('@/assets/data/surah/surah_108.json'),
  109: require('@/assets/data/surah/surah_109.json'),
  110: require('@/assets/data/surah/surah_110.json'),
  111: require('@/assets/data/surah/surah_111.json'),
  112: require('@/assets/data/surah/surah_112.json'),
  113: require('@/assets/data/surah/surah_113.json'),
  114: require('@/assets/data/surah/surah_114.json'),
};

export function getSurahAyahs(surahNumber: number): Ayah[] {
  if (surahDataCache.has(surahNumber)) {
    const verses = surahDataCache.get(surahNumber)!;
    return Object.entries(verses).map(([key, text]) => ({
      surahNumber,
      ayahNumber: parseInt(key.replace('verse_', ''), 10),
      text,
    })).sort((a, b) => a.ayahNumber - b.ayahNumber);
  }

  const data = surahFiles[surahNumber];
  if (!data) return [];

  const verses: Record<string, string> = data.verse || {};
  surahDataCache.set(surahNumber, verses);

  return Object.entries(verses).map(([key, text]) => ({
    surahNumber,
    ayahNumber: parseInt(key.replace('verse_', ''), 10),
    text,
  })).sort((a, b) => a.ayahNumber - b.ayahNumber);
}

export const TOTAL_AYAHS = 6236;
export const TOTAL_SURAHS = 114;
export const TOTAL_JUZ = 30;
export const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
