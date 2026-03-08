import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date().toISOString().slice(0, 10);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a curator for Solo, a personal growth app. Generate daily insights that are inspiring, thought-provoking, and relevant to self-improvement.`,
          },
          {
            role: "user",
            content: `Generate exactly 5 curated insights for ${today}. Return JSON only using this exact tool call.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_insights",
              description: "Return the daily curated insights",
              parameters: {
                type: "object",
                properties: {
                  daily_focus: {
                    type: "object",
                    properties: {
                      idea: { type: "string", description: "One idea to think about today (1 sentence)" },
                      action: { type: "string", description: "One small action to improve yourself today (1 sentence)" },
                      insight: { type: "string", description: "One insight from the world (1 sentence)" },
                    },
                    required: ["idea", "action", "insight"],
                  },
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short headline (5-8 words)" },
                        summary: { type: "string", description: "Concise insight (2-3 sentences)" },
                        category: { type: "string", enum: ["tech", "mindset", "productivity", "ideas", "innovation"] },
                        emoji: { type: "string", description: "Single relevant emoji" },
                      },
                      required: ["title", "summary", "category", "emoji"],
                    },
                  },
                },
                required: ["daily_focus", "insights"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ date: today, ...parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Failed to parse insights");
  } catch (e) {
    console.error("daily-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
