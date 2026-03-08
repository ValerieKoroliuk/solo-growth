import { useState } from "react";
import { Check, Plus, Sparkles } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SoloScoreRing } from "@/components/SoloScoreRing";
import {
  getTodayKey,
  emptyDay,
  calculateScore,
  getQuote,
  type SoloData,
  type Habit,
} from "@/lib/solo-utils";

const defaultCheckins = [
  { id: "study", label: "Studied", emoji: "📚" },
  { id: "exercise", label: "Exercised", emoji: "💪" },
  { id: "read", label: "Read", emoji: "📖" },
  { id: "code", label: "Coded", emoji: "💻" },
  { id: "meditate", label: "Meditated", emoji: "🧘" },
  { id: "journal", label: "Journaled", emoji: "✍️" },
];

export default function HomePage() {
  const today = getTodayKey();
  const [data, setData] = useLocalStorage<SoloData>("solo-data", {});
  const [habits] = useLocalStorage<Habit[]>("solo-habits", []);
  const [customInput, setCustomInput] = useState("");

  const dayData = data[today] || emptyDay();
  const score = calculateScore(dayData, habits.length);

  const toggleCheckin = (id: string) => {
    const current = dayData.checkins.includes(id)
      ? dayData.checkins.filter((c) => c !== id)
      : [...dayData.checkins, id];
    const updated = { ...dayData, checkins: current };
    updated.score = calculateScore(updated, habits.length);
    setData({ ...data, [today]: updated });
  };

  const addCustom = () => {
    if (!customInput.trim()) return;
    const id = `custom-${customInput.trim().toLowerCase().replace(/\s+/g, "-")}`;
    if (!dayData.checkins.includes(id)) {
      const updated = { ...dayData, checkins: [...dayData.checkins, id] };
      updated.score = calculateScore(updated, habits.length);
      setData({ ...data, [today]: updated });
    }
    setCustomInput("");
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Greeting */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h2 className="mt-1 font-display text-2xl text-foreground">Your Solo Time</h2>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center gap-2">
        <SoloScoreRing score={score} />
        <p className="max-w-[260px] text-center text-xs italic text-muted-foreground">
          "{getQuote()}"
        </p>
      </div>

      {/* Daily Check-in */}
      <div>
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          What did you do today?
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {defaultCheckins.map((item) => {
            const active = dayData.checkins.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleCheckin(item.id)}
                className={`solo-card flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all ${
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <span className="text-lg">{item.emoji}</span>
                <span>{item.label}</span>
                {active && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>

        {/* Custom checkin */}
        <div className="mt-3 flex gap-2">
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Add your own..."
            className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={addCustom}
            className="rounded-xl bg-primary px-3 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
