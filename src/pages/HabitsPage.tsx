import { useState } from "react";
import { Plus, Check, Trash2, Target } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { useDailyData } from "@/hooks/useDailyData";
import { getTodayKey, calculateScore } from "@/lib/solo-utils";

const iconOptions = ["🎯", "📚", "💪", "🧘", "🏃", "🎨", "🎵", "💤", "🥗", "💧", "✏️", "🧹"];

export default function HabitsPage() {
  const today = getTodayKey();
  const { habits, addHabit, removeHabit } = useHabits();
  const { dayData, updateDay } = useDailyData(today);
  const [newName, setNewName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🎯");
  const [showAdd, setShowAdd] = useState(false);

  const toggleHabit = async (id: string) => {
    const current = dayData.habits_done.includes(id)
      ? dayData.habits_done.filter((h) => h !== id)
      : [...dayData.habits_done, id];
    const newScore = calculateScore({ ...dayData, habits_done: current }, habits.length);
    await updateDay({ ...dayData, habits_done: current, score: newScore });
  };

  const handleAddHabit = async () => {
    if (!newName.trim()) return;
    await addHabit({ name: newName.trim(), icon: selectedIcon });
    setNewName("");
    setShowAdd(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
          <Target className="h-5 w-5 text-primary" />
          Habits
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {showAdd && (
        <div className="solo-card animate-scale-in space-y-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
            placeholder="Habit name..."
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex flex-wrap gap-2">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`rounded-lg p-2 text-lg transition-all ${
                  selectedIcon === icon ? "bg-primary/15 ring-2 ring-primary/40" : "hover:bg-muted"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <button
            onClick={handleAddHabit}
            disabled={!newName.trim()}
            className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Add Habit
          </button>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No habits yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => {
            const done = dayData.habits_done.includes(habit.id);
            return (
              <div
                key={habit.id}
                className={`solo-card flex items-center gap-3 transition-all ${
                  done ? "border-primary/30 bg-primary/5" : ""
                }`}
              >
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {done && <Check className="h-4 w-4" />}
                </button>
                <span className="text-lg">{habit.icon}</span>
                <span className={`flex-1 text-sm font-medium ${done ? "text-primary" : "text-foreground"}`}>
                  {habit.name}
                </span>
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {dayData.habits_done.length}/{habits.length} completed today
      </p>
    </div>
  );
}
