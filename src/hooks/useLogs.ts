import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { LogCategory } from "@/lib/solo-utils";

export interface LogEntry {
  id: string;
  category: LogCategory;
  text: string;
  created_at: string;
}

export function useLogs() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["logs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LogEntry[];
    },
    enabled: !!user,
  });

  const addLog = useMutation({
    mutationFn: async ({ category, text }: { category: LogCategory; text: string }) => {
      const { data, error } = await supabase
        .from("logs")
        .insert({ user_id: user!.id, category, text })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["logs"] }),
  });

  const deleteLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["logs"] }),
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
    addLog: addLog.mutateAsync,
    deleteLog: deleteLog.mutateAsync,
  };
}
