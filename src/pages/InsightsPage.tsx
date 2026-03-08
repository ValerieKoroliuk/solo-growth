import { useEffect } from "react";
import { Lightbulb, Sparkles, Zap, Brain, Rocket, Cpu, RefreshCw } from "lucide-react";
import { useInsights } from "@/hooks/useInsights";

const categoryIcons: Record<string, typeof Lightbulb> = {
  tech: Cpu,
  mindset: Brain,
  productivity: Zap,
  ideas: Lightbulb,
  innovation: Rocket,
};

const categoryColors: Record<string, string> = {
  tech: "text-primary",
  mindset: "text-accent",
  productivity: "text-solo-warm",
  ideas: "text-solo-streak",
  innovation: "text-solo-glow",
};

export default function InsightsPage() {
  const { data, loading, error, fetchInsights } = useInsights();

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          What Matters Today
        </h2>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Daily Focus */}
      {data?.daily_focus && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily Focus</h3>
          <div className="space-y-2">
            {[
              { icon: "💡", label: "Think About", text: data.daily_focus.idea },
              { icon: "⚡", label: "Do This", text: data.daily_focus.action },
              { icon: "🌍", label: "World Insight", text: data.daily_focus.insight },
            ].map((item) => (
              <div key={item.label} className="solo-card flex gap-3">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-sm text-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight Feed */}
      {data?.insights && data.insights.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Insight Feed</h3>
          <div className="space-y-2">
            {data.insights.map((item, i) => {
              const Icon = categoryIcons[item.category] || Lightbulb;
              const colorClass = categoryColors[item.category] || "text-primary";
              return (
                <div key={i} className="solo-card space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <h4 className="flex-1 text-sm font-semibold text-foreground">{item.title}</h4>
                    <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
                  <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                    {item.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && !data && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="solo-card animate-pulse space-y-2">
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !data && (
        <div className="solo-card text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchInsights}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
