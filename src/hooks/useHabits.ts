import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

export function useHabits() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["habits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });

  const addHabit = useMutation({
    mutationFn: async ({ name, icon }: { name: string; icon: string }) => {
      const { data, error } = await supabase
        .from("habits")
        .insert({ user_id: user!.id, name, icon })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  const removeHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  return {
    habits: query.data ?? [],
    isLoading: query.isLoading,
    addHabit: addHabit.mutateAsync,
    removeHabit: removeHabit.mutateAsync,
  };
}
