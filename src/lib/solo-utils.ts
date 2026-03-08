// Score constants
export const CHECKIN_POINTS = 15;
export const MAX_CHECKIN_SCORE = 40;
export const MAX_HABIT_SCORE = 40;
export const JOURNAL_FULL_SCORE = 20;
export const JOURNAL_PARTIAL_SCORE = 10;
export const JOURNAL_FULL_THRESHOLD = 10; // characters

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en", { weekday: "short" });
}

export interface DayData {
  checkins: string[];
  habits_done: string[];
  journal: string;
  score: number;
}

export function emptyDay(): DayData {
  return { checkins: [], habits_done: [], journal: "", score: 0 };
}

export function calculateScore(day: { checkins: string[]; habits_done: string[]; journal: string }, totalHabits: number): number {
  const checkinScore = Math.min(day.checkins.length * CHECKIN_POINTS, MAX_CHECKIN_SCORE);
  const habitScore = totalHabits > 0 ? (day.habits_done.length / totalHabits) * MAX_HABIT_SCORE : 0;
  const journalScore = day.journal.trim().length > JOURNAL_FULL_THRESHOLD
    ? JOURNAL_FULL_SCORE
    : day.journal.trim().length > 0
      ? JOURNAL_PARTIAL_SCORE
      : 0;
  return Math.round(Math.min(checkinScore + habitScore + journalScore, 100));
}

export function getStreak(data: Record<string, DayData>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const day = data[key];
    if (day && (day.checkins.length > 0 || day.habits_done.length > 0 || day.journal.trim())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

const motivationalQuotes = [
  "The only person you need to be better than is who you were yesterday.",
  "Discipline is choosing between what you want now and what you want most.",
  "Small daily improvements are the key to staggering long-term results.",
  "What you do when no one is watching defines who you are.",
  "Solitude is the soul's holiday.",
  "Your future self will thank you for the work you do today.",
  "Growth happens in the quiet moments.",
];

export function getQuote(): string {
  const idx = new Date().getDate() % motivationalQuotes.length;
  return motivationalQuotes[idx];
}

export type LogCategory =
  | "habit"
  | "idea"
  | "note"
  | "task"
  | "mood"
  | "workout"
  | "learning"
  | "progress";

export const logCategories: { id: LogCategory; label: string; emoji: string }[] = [
  { id: "habit", label: "Habit", emoji: "🎯" },
  { id: "learning", label: "Learning", emoji: "📚" },
  { id: "idea", label: "Idea", emoji: "💡" },
  { id: "workout", label: "Workout", emoji: "🏋️" },
  { id: "mood", label: "Mood", emoji: "😊" },
  { id: "note", label: "Note", emoji: "📝" },
  { id: "task", label: "Task", emoji: "✅" },
  { id: "progress", label: "Progress", emoji: "📈" },
];

export function getCategoryMeta(cat: LogCategory) {
  return logCategories.find((c) => c.id === cat) || logCategories[5]; // default note
}
