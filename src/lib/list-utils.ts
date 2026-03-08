export interface ListItem {
  id: string;
  text: string;
  note: string;
  checked: boolean;
  source: "manual" | "capture";
  capture_id: string | null;
  goal_id: string | null;
  created_at: string;
}

export interface SoloList {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: ListItem[];
  created_at: string;
}

export interface GoalMilestone {
  id: string;
  text: string;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  source_list_id: string | null;
  source_item_id: string | null;
  target_date: string;
  status: "active" | "completed" | "abandoned";
  progress: number;
  milestones: GoalMilestone[];
  created_at: string;
}

export const defaultLists: SoloList[] = [
  { id: "list-books", name: "Books to Read", icon: "📚", color: "blue", items: [], created_at: new Date().toISOString() },
  { id: "list-movies", name: "Movies to Watch", icon: "🎬", color: "purple", items: [], created_at: new Date().toISOString() },
  { id: "list-shopping", name: "Shopping", icon: "🛒", color: "orange", items: [], created_at: new Date().toISOString() },
  { id: "list-ideas", name: "Ideas", icon: "💡", color: "green", items: [], created_at: new Date().toISOString() },
];

export const listColorMap: Record<string, { border: string; bg: string }> = {
  blue: { border: "border-l-blue-500", bg: "bg-blue-500/10" },
  purple: { border: "border-l-purple-500", bg: "bg-purple-500/10" },
  orange: { border: "border-l-orange-500", bg: "bg-orange-500/10" },
  green: { border: "border-l-green-500", bg: "bg-green-500/10" },
  pink: { border: "border-l-pink-500", bg: "bg-pink-500/10" },
};

export const emojiOptions = ["📚", "🎬", "🛒", "💡", "🏋️", "🎨", "🎵", "✈️", "🍳", "🏠", "💰", "🎓", "📱", "⭐", "🎁"];
export const colorOptions = ["blue", "purple", "orange", "green", "pink"];

export function calculateGoalProgress(milestones: GoalMilestone[]): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.done).length;
  return Math.round((done / milestones.length) * 100);
}

export function daysLeft(targetDate: string): number {
  const diff = new Date(targetDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function createListItem(text: string, source: "manual" | "capture" = "manual", captureId: string | null = null): ListItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    note: "",
    checked: false,
    source,
    capture_id: captureId,
    goal_id: null,
    created_at: new Date().toISOString(),
  };
}
