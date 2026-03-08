import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CoachContext {
  habits: string[];
  checkins: string[];
  journal: string;
  streak: number;
  score: number;
}

export function useAICoach() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCoachMessage = useCallback(async (context: CoachContext, userMessage?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-coach", {
        body: { ...context, message: userMessage },
      });
      if (fnError) throw fnError;
      setMessage(data.message);
      return data.message;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to get coaching message";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { message, loading, error, getCoachMessage };
}
