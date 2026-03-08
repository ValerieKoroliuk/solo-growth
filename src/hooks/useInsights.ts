import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DailyFocus {
  idea: string;
  action: string;
  insight: string;
}

export interface Insight {
  title: string;
  summary: string;
  category: string;
  emoji: string;
}

interface InsightsData {
  date: string;
  daily_focus: DailyFocus;
  insights: Insight[];
}

export function useInsights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    // Check cache
    const cached = localStorage.getItem("solo-insights-cache");
    const today = new Date().toISOString().slice(0, 10);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === today) {
          setData(parsed);
          return parsed;
        }
      } catch {}
    }

    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("daily-insights", {
        body: {},
      });
      if (fnError) throw fnError;
      if (result.error) throw new Error(result.error);
      setData(result);
      localStorage.setItem("solo-insights-cache", JSON.stringify(result));
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load insights";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchInsights };
}
