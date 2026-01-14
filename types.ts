

export enum ExerciseType {
  FILL_BLANK = 'FILL_BLANK',
  WRITE_CODE = 'WRITE_CODE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE'
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  totalXp: number;
  learningContent: string[]; // Array of paragraphs/sections for the learning phase
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  initialCode?: string; // For code editor
  solution: string | string[]; // Expected answer(s)
  options?: string[]; // For multiple choice
  hint?: string; // Static hint fallback
}

export interface UnitConfig {
  id: string;
  title: string;
  description: string;
  color: string;
  lessons: string[];
}

export interface UserProgress {
  xp: number;
  streak: number;
  hearts: number;
  maxHearts: number;
  completedLessons: string[];
  currentLessonId: string | null;
  xpMultiplier?: number;
  xpMultiplierEndTime?: number;
  streakFreeze?: number;
  redeemedSecrets?: string[];
  hiddenUnitUnlocked?: boolean;
  mentorModeUnlocked?: boolean; // New Flag for Mentor Mode
  openedChests?: string[]; // Array of Unit IDs where chest has been opened
  consecutiveFails?: number; // Track failures for burnout detector
  burnoutEndTime?: number; // Timestamp when cooldown ends
  lastFailedLessonId?: string; // Context for AI tips during burnout
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  birthday?: string;
  isAnonymous?: boolean;
}

// --- PAIR PROGRAMMING & BATTLE TYPES ---
export interface SessionUser {
  id: string;
  name: string;
  color: string;
  cursorX: number;
  cursorY: number;
  lastActive: number;
}

export interface PairSession {
  id: string;
  code: string;
  output: string;
  users: Record<string, SessionUser>;
  createdAt: number;
  isRunning?: boolean;
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengerEmail: string;
  challengerName?: string;
  targetEmail: string;
  targetId?: string; // Filled if user found
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  sessionId?: string; // The battle room ID
}

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL?: string;
    xp: number;
    isPublicProfile?: boolean;
}

export enum MascotMood {
  HAPPY = 'HAPPY',
  SAD = 'SAD',
  THINKING = 'THINKING',
  EXCITED = 'EXCITED',
  DEFAULT = 'DEFAULT'
}

export type AppFont = 'sans' | 'serif' | 'mono' | 'dyslexic';
export type AppLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'hi' | 'sr';

export interface AppSettings {
  bionicReading: boolean;
  offlineMode: boolean; // Backpack mode
  darkMode: boolean;
  soundEffects: boolean;
  font: AppFont;
  language: AppLanguage;
  isPublicProfile: boolean;
}

// --- LEVEL LOGIC ---
// 50 Levels total.
// To finish in ~2 months (60 days) with avg 125 XP/day = 7500 Total XP needed.
// 7500 XP / 50 Levels = 150 XP per level.
export const XP_PER_LEVEL = 150;
export const MAX_LEVEL = 50;

export const getLevel = (totalXp: number): number => {
  const lvl = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  return Math.min(lvl, MAX_LEVEL);
};

export const getXpInCurrentLevel = (totalXp: number): number => {
  if (getLevel(totalXp) >= MAX_LEVEL) return XP_PER_LEVEL;
  return totalXp % XP_PER_LEVEL;
};

export const getLevelProgress = (totalXp: number): number => {
  if (getLevel(totalXp) >= MAX_LEVEL) return 100;
  return (getXpInCurrentLevel(totalXp) / XP_PER_LEVEL) * 100;
};