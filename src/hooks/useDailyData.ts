import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DayData {
  id?: string;
  date: string;
  checkins: string[];
  habits_done: string[];
  journal: string;
  score: number;
}

export function emptyDay(date: string): DayData {
  return { date, checkins: [], habits_done: [], journal: "", score: 0 };
}

export function useDailyData(date: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["daily_data", user?.id, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_data")
        .select("*")
        .eq("user_id", user!.id)
        .eq("date", date)
        .maybeSingle();
      if (error) throw error;
      if (!data) return emptyDay(date);
      return {
        id: data.id,
        date: data.date,
        checkins: data.checkins ?? [],
        habits_done: data.habits_done ?? [],
        journal: data.journal ?? "",
        score: data.score ?? 0,
      } as DayData;
    },
    enabled: !!user,
  });

  const upsert = useMutation({
    mutationFn: async (day: Partial<DayData>) => {
      const payload = {
        user_id: user!.id,
        date,
        checkins: day.checkins,
        habits_done: day.habits_done,
        journal: day.journal,
        score: day.score,
      };
      const { error } = await supabase
        .from("daily_data")
        .upsert(payload, { onConflict: "user_id,date" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily_data", user?.id, date] });
      qc.invalidateQueries({ queryKey: ["daily_data_range"] });
    },
  });

  return {
    dayData: query.data ?? emptyDay(date),
    isLoading: query.isLoading,
    updateDay: upsert.mutateAsync,
  };
}

/** Fetch a range of daily data (for progress/streak) */
export function useDailyDataRange(days: number = 365) {
  const { user } = useAuth();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().slice(0, 10);

  return useQuery({
    queryKey: ["daily_data_range", user?.id, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_data")
        .select("*")
        .eq("user_id", user!.id)
        .gte("date", startStr)
        .order("date", { ascending: false });
      if (error) throw error;
      const map: Record<string, DayData> = {};
      for (const row of data) {
        map[row.date] = {
          id: row.id,
          date: row.date,
          checkins: row.checkins ?? [],
          habits_done: row.habits_done ?? [],
          journal: row.journal ?? "",
          score: row.score ?? 0,
        };
      }
      return map;
    },
    enabled: !!user,
  });
}
