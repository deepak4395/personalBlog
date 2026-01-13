/**
 * Type definitions for Bhagavad Gita Agent
 */

export interface ShlokaReference {
  chapter: number;
  verse: number;
}

export interface ShlokaData {
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
  description: string;
}

export interface GeneratedShlokaPost {
  title: string;
  description: string;
  content: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  tags: string[];
  category: string;
  previousShloka: ShlokaReference | null;
  nextShloka: ShlokaReference | null;
}

export interface ShlokaProgress {
  currentChapter: number;
  currentVerse: number;
  totalShlokas: number;
  completedShlokas: number;
  lastUpdated: string;
}

// Total verses in each chapter of Bhagavad Gita
export const CHAPTER_VERSE_COUNTS: Record<number, number> = {
  1: 47,   // Arjuna Vishada Yoga
  2: 72,   // Sankhya Yoga
  3: 43,   // Karma Yoga
  4: 42,   // Jnana Karma Sanyasa Yoga
  5: 29,   // Karma Sanyasa Yoga
  6: 47,   // Atma Samyama Yoga
  7: 30,   // Jnana Vijnana Yoga
  8: 28,   // Aksara Brahma Yoga
  9: 34,   // Raja Vidya Raja Guhya Yoga
  10: 42,  // Vibhuti Yoga
  11: 55,  // Visvarupa Darsana Yoga
  12: 20,  // Bhakti Yoga
  13: 35,  // Ksetra Ksetrajna Vibhaga Yoga
  14: 27,  // Gunatraya Vibhaga Yoga
  15: 20,  // Purusottama Yoga
  16: 24,  // Daivasura Sampad Vibhaga Yoga
  17: 28,  // Sraddhatraya Vibhaga Yoga
  18: 78,  // Moksa Sanyasa Yoga
};

export const TOTAL_SHLOKAS = Object.values(CHAPTER_VERSE_COUNTS).reduce((a, b) => a + b, 0); // 700

export const CHAPTER_NAMES: Record<number, string> = {
  1: "Arjuna Vishada Yoga",
  2: "Sankhya Yoga",
  3: "Karma Yoga",
  4: "Jnana Karma Sanyasa Yoga",
  5: "Karma Sanyasa Yoga",
  6: "Atma Samyama Yoga",
  7: "Jnana Vijnana Yoga",
  8: "Aksara Brahma Yoga",
  9: "Raja Vidya Raja Guhya Yoga",
  10: "Vibhuti Yoga",
  11: "Visvarupa Darsana Yoga",
  12: "Bhakti Yoga",
  13: "Ksetra Ksetrajna Vibhaga Yoga",
  14: "Gunatraya Vibhaga Yoga",
  15: "Purusottama Yoga",
  16: "Daivasura Sampad Vibhaga Yoga",
  17: "Sraddhatraya Vibhaga Yoga",
  18: "Moksa Sanyasa Yoga",
};
