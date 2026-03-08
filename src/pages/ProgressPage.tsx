import { BarChart3, Flame, Trophy, TrendingUp } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { useDailyData, useDailyDataRange } from "@/hooks/useDailyData";
import { SoloScoreRing } from "@/components/SoloScoreRing";
import { getTodayKey, getWeekDates, getDayLabel, calculateScore, getStreak, emptyDay } from "@/lib/solo-utils";

export default function ProgressPage() {
  const today = getTodayKey();
  const { habits } = useHabits();
  const { dayData: todayData } = useDailyData(today);
  const { data: rangeData } = useDailyDataRange();

  const allData = rangeData ?? {};
  const weekDates = getWeekDates();
  const streak = getStreak(allData);
  const todayScore = calculateScore(todayData, habits.length);

  const weekScores = weekDates.map((d) => {
    const day = allData[d] || emptyDay();
    return calculateScore(day, habits.length);
  });
  const weekAvg = weekScores.length > 0 ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length) : 0;
  const maxScore = Math.max(...weekScores, 1);

  const weekHabits = weekDates.reduce((acc, d) => acc + (allData[d]?.habits_done.length || 0), 0);
  const weekCheckins = weekDates.reduce((acc, d) => acc + (allData[d]?.checkins.length || 0), 0);

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
        <BarChart3 className="h-5 w-5 text-primary" />
        Progress
      </h2>

      <div className="flex items-center justify-around">
        <SoloScoreRing score={todayScore} size={100} />
        <div className="flex flex-col items-center gap-1">
          <Flame className="h-6 w-6 text-solo-warm" />
          <span className="text-3xl font-bold text-foreground">{streak}</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Trophy, label: "Habits Done", value: weekHabits, sub: "this week" },
          { icon: TrendingUp, label: "Avg Score", value: weekAvg, sub: "this week" },
          { icon: BarChart3, label: "Check-ins", value: weekCheckins, sub: "this week" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="solo-card flex flex-col items-center gap-1 py-3">
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-lg font-bold text-foreground">{value}</span>
            <span className="text-[10px] text-muted-foreground">{sub}</span>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Weekly Scores</h3>
        <div className="flex items-end justify-between gap-1.5" style={{ height: 120 }}>
          {weekDates.map((d, i) => {
            const isToday = d === today;
            const height = maxScore > 0 ? (weekScores[i] / 100) * 100 : 0;
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-muted-foreground">{weekScores[i]}</span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${isToday ? "bg-primary" : "bg-primary/30"}`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className={`text-[10px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {getDayLabel(d)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
