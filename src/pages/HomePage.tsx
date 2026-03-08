import { useState, useEffect } from "react";
import { Check, Plus, Sparkles, MessageCircle, Send, Lightbulb, Zap, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAICoach } from "@/hooks/useAICoach";
import { useInsights } from "@/hooks/useInsights";
import { SoloScoreRing } from "@/components/SoloScoreRing";
import {
  getTodayKey,
  emptyDay,
  calculateScore,
  getStreak,
  type SoloData,
  type Habit,
} from "@/lib/solo-utils";
import { type CaptureItem, captureTypeConfig } from "@/lib/capture-utils";

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
  const [captures] = useLocalStorage<CaptureItem[]>("solo-captures", []);
  const [customInput, setCustomInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  const dayData = data[today] || emptyDay();
  const score = calculateScore(dayData, habits.length);
  const streak = getStreak(data, habits);

  const { message: coachMessage, loading: coachLoading, getCoachMessage } = useAICoach();
  const { data: insightsData, fetchInsights } = useInsights();

  // Fetch daily focus and coach message on mount
  useEffect(() => {
    fetchInsights();
    getCoachMessage({
      habits: dayData.habits,
      checkins: dayData.checkins,
      journal: dayData.journal,
      streak,
      score,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput("");
    await getCoachMessage(
      {
        habits: dayData.habits,
        checkins: dayData.checkins,
        journal: dayData.journal,
        streak,
        score,
      },
      msg
    );
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
      </div>

      {/* Daily Focus */}
      {insightsData?.daily_focus && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's Focus</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Lightbulb, text: insightsData.daily_focus.idea, label: "Think" },
              { icon: Zap, text: insightsData.daily_focus.action, label: "Do" },
              { icon: Globe, text: insightsData.daily_focus.insight, label: "Know" },
            ].map(({ icon: Icon, text, label }) => (
              <div key={label} className="solo-card flex flex-col items-center gap-1.5 py-3 text-center">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                <p className="text-[11px] leading-tight text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Coach */}
      <div className="solo-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
            <MessageCircle className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Solo Coach</h3>
        </div>
        {coachLoading && !coachMessage ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-4/5 rounded bg-muted" />
          </div>
        ) : coachMessage ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{coachMessage}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">Your coach is ready when you are.</p>
        )}
        
        {showChat ? (
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Ask your coach..."
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={sendChat}
              disabled={coachLoading}
              className="rounded-xl bg-primary px-3 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowChat(true)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Chat with your coach →
          </button>
        )}
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
