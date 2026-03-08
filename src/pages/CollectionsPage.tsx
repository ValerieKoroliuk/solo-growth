import { useState } from "react";
import { Library, Trash2, ListPlus } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  type CaptureItem,
  type CaptureType,
  type CaptureStatus,
  captureTypeConfig,
  nextStatus,
} from "@/lib/capture-utils";
import { type SoloList, defaultLists, createListItem } from "@/lib/list-utils";
import { toast } from "sonner";

const filterTabs: { label: string; type: CaptureType | "all" }[] = [
  { label: "All", type: "all" },
  { label: "📚 Books", type: "book" },
  { label: "🎬 Movies", type: "movie" },
  { label: "🎯 Habits", type: "habit" },
  { label: "✅ Tasks", type: "task" },
  { label: "📝 Other", type: "note" },
];

const statusColors: Record<CaptureStatus, string> = {
  inbox: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  done: "bg-primary/15 text-primary",
  archived: "bg-muted text-muted-foreground",
};

const typeBadgeClass = (type: CaptureType) => {
  const map: Record<string, string> = {
    book: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    movie: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    habit: "bg-primary/15 text-primary",
    task: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  };
  return map[type] || "bg-muted text-muted-foreground";
};

export default function CollectionsPage() {
  const [captures, setCaptures] = useLocalStorage<CaptureItem[]>("solo-captures", []);
  const [filter, setFilter] = useState<CaptureType | "all">("all");

  const otherTypes: CaptureType[] = ["note", "workout", "learning", "idea", "mood", "quote"];
  const filtered = captures.filter((c) => {
    if (filter === "all") return true;
    if (filter === "note") return otherTypes.includes(c.type);
    return c.type === filter;
  });

  const cycleStatus = (id: string) => {
    setCaptures((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus(c.status) } : c))
    );
  };

  const remove = (id: string) => {
    setCaptures((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-2">
        <Library className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl text-foreground">Collections</h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setFilter(tab.type)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              filter === tab.type
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="solo-card flex flex-col items-center gap-3 py-10 text-center">
          <span className="text-3xl">📸</span>
          <p className="text-sm text-muted-foreground">
            {captures.length === 0
              ? "Capture your first screenshot to start building your collections"
              : "No items in this category"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="solo-card flex items-start gap-3">
              <span className="mt-0.5 text-lg">{captureTypeConfig[item.type]?.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeBadgeClass(item.type)}`}>
                    {captureTypeConfig[item.type]?.label}
                  </span>
                  <button
                    onClick={() => cycleStatus(item.id)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${statusColors[item.status]}`}
                  >
                    {item.status}
                  </button>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                {item.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => remove(item.id)}
                className="mt-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
