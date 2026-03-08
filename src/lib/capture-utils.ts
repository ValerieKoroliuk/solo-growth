export type CaptureType = "book" | "movie" | "habit" | "task" | "note" | "workout" | "learning" | "idea" | "mood" | "quote";
export type CaptureAction = "want_to_read" | "want_to_watch" | "add_habit" | "add_task" | "log_entry";
export type CaptureStatus = "inbox" | "done" | "archived";

export interface CaptureItem {
  id: string;
  type: CaptureType;
  title: string;
  description: string;
  action: CaptureAction;
  tags: string[];
  raw_text: string;
  status: CaptureStatus;
  created_at: string;
}

export const captureTypeConfig: Record<CaptureType, { emoji: string; label: string }> = {
  book: { emoji: "📚", label: "Book" },
  movie: { emoji: "🎬", label: "Movie" },
  habit: { emoji: "🎯", label: "Habit" },
  task: { emoji: "✅", label: "Task" },
  note: { emoji: "📝", label: "Note" },
  workout: { emoji: "🏋️", label: "Workout" },
  learning: { emoji: "📚", label: "Learning" },
  idea: { emoji: "💡", label: "Idea" },
  mood: { emoji: "😊", label: "Mood" },
  quote: { emoji: "💬", label: "Quote" },
};

export function captureTypeToLogCategory(type: CaptureType): string {
  const map: Record<CaptureType, string> = {
    book: "learning",
    movie: "note",
    habit: "habit",
    task: "task",
    note: "note",
    workout: "workout",
    learning: "learning",
    idea: "idea",
    mood: "mood",
    quote: "note",
  };
  return map[type];
}

export function nextStatus(s: CaptureStatus): CaptureStatus {
  const cycle: CaptureStatus[] = ["inbox", "done", "archived"];
  return cycle[(cycle.indexOf(s) + 1) % cycle.length];
}
