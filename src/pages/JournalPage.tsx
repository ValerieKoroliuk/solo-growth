import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getTodayKey, emptyDay, calculateScore, type SoloData, type Habit } from "@/lib/solo-utils";

export default function JournalPage() {
  const today = getTodayKey();
  const [data, setData] = useLocalStorage<SoloData>("solo-data", {});
  const [habits] = useLocalStorage<Habit[]>("solo-habits", []);
  const [viewDate, setViewDate] = useState(today);

  const dayData = data[viewDate] || emptyDay();

  const updateJournal = (text: string) => {
    const updated = { ...dayData, journal: text };
    updated.score = calculateScore(updated, habits.length);
    setData({ ...data, [viewDate]: updated });
  };

  const shiftDate = (days: number) => {
    const d = new Date(viewDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    const key = d.toISOString().slice(0, 10);
    if (key <= today) setViewDate(key);
  };

  const isToday = viewDate === today;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
        <BookOpen className="h-5 w-5 text-primary" />
        Journal
      </h2>

      {/* Date nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => shiftDate(-1)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-foreground">
          {isToday
            ? "Today"
            : new Date(viewDate + "T12:00:00").toLocaleDateString("en", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
        </span>
        <button
          onClick={() => shiftDate(1)}
          disabled={isToday}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="solo-card">
        <textarea
          value={dayData.journal}
          onChange={(e) => updateJournal(e.target.value)}
          placeholder="How was your solo time today? What did you learn about yourself?"
          rows={8}
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {dayData.journal.trim().length > 0
          ? `${dayData.journal.trim().split(/\s+/).length} words`
          : "Start writing to boost your Solo Score"}
      </p>
    </div>
  );
}
