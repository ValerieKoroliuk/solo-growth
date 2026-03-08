import { useState, useEffect, useCallback } from "react";
import { Clock, Sparkles, Loader2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getCategoryMeta, getTodayKey, type LogEntry } from "@/lib/solo-utils";
import { supabase } from "@/integrations/supabase/client";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
}

function groupByDate(logs: LogEntry[]): Record<string, LogEntry[]> {
  const groups: Record<string, LogEntry[]> = {};
  for (const log of logs) {
    const dateKey = log.timestamp.slice(0, 10);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(log);
  }
  return groups;
}

function formatDateHeader(dateKey: string) {
  const today = getTodayKey();
  if (dateKey === today) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateKey === yesterday.toISOString().slice(0, 10)) return "Yesterday";
  return new Date(dateKey + "T12:00:00").toLocaleDateString("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function TimelinePage() {
  const [logs] = useLocalStorage<LogEntry[]>("solo-logs", []);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const grouped = groupByDate(logs);
  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const today = getTodayKey();
  const todayLogs = grouped[today] || [];

  const getDaySummary = useCallback(async () => {
    if (todayLogs.length === 0) return;
    setSummaryLoading(true);
    try {
      const logText = todayLogs
        .map((l) => `[${getCategoryMeta(l.category).label}] ${l.text}`)
        .join("\n");
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          habits: [],
          checkins: [],
          journal: "",
          streak: 0,
          score: 0,
          message: `Here are all the things I logged today. Give me a brief end-of-day summary highlighting patterns and wins:\n\n${logText}`,
        },
      });
      if (error) throw error;
      setSummary(data.message);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [todayLogs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
        <Clock className="h-5 w-5 text-primary" />
        Timeline
      </h2>

      {/* AI Day Summary */}
      {todayLogs.length >= 2 && (
        <div className="solo-card space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Smart Summary</h3>
            </div>
            <button
              onClick={getDaySummary}
              disabled={summaryLoading}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              {summaryLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Generate"}
            </button>
          </div>
          {summary && (
            <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
          )}
          {!summary && !summaryLoading && (
            <p className="text-xs italic text-muted-foreground">
              Tap "Generate" for an AI summary of your day.
            </p>
          )}
        </div>
      )}

      {/* Timeline feed */}
      {logs.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No logs yet. Use the + button to start logging.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dateKeys.map((dateKey) => {
            const entries = grouped[dateKey];
            return (
              <div key={dateKey} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {formatDateHeader(dateKey)}
                </h3>
                <div className="relative space-y-0">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
                  
                  {entries.map((entry) => {
                    const meta = getCategoryMeta(entry.category);
                    return (
                      <div key={entry.id} className="relative flex items-start gap-3 py-2">
                        {/* Dot */}
                        <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-card text-sm ring-2 ring-border">
                          {meta.emoji}
                        </div>
                        {/* Content */}
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm text-foreground">{entry.text}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-[10px] font-medium text-primary">{meta.label}</span>
                            <span className="text-[10px] text-muted-foreground">{formatTime(entry.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
