import { BookOpen, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDailyData } from "@/hooks/useDailyData";
import { useHabits } from "@/hooks/useHabits";
import { getTodayKey, calculateScore } from "@/lib/solo-utils";

export default function JournalPage() {
  const today = getTodayKey();
  const [viewDate, setViewDate] = useState(today);
  const { habits } = useHabits();
  const { dayData, updateDay } = useDailyData(viewDate);
  const [localText, setLocalText] = useState(dayData.journal);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync local text when date changes or data loads
  useEffect(() => {
    setLocalText(dayData.journal);
  }, [dayData.journal, viewDate]);

  const saveJournal = useCallback(
    async (text: string) => {
      const newScore = calculateScore({ ...dayData, journal: text }, habits.length);
      await updateDay({ ...dayData, journal: text, score: newScore });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [dayData, habits.length, updateDay]
  );

  const handleChange = (text: string) => {
    setLocalText(text);
    setSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveJournal(text), 500);
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
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          Journal
        </h2>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-medium text-primary animate-fade-in">
            <Check className="h-3 w-3" />
            Saved
          </span>
        )}
      </div>

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
          value={localText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="How was your solo time today? What did you learn about yourself?"
          rows={8}
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {localText.trim().length > 0
          ? `${localText.trim().split(/\s+/).length} words`
          : "Start writing to boost your Solo Score"}
      </p>
    </div>
  );
}
