import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { habits, checkins, journal, streak, score, message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Solo Coach — a calm, wise, and encouraging personal growth mentor inside the Solo app. 
Your role is to help users build discipline, reflect on their growth, and stay motivated.

User context for today:
- Completed habits: ${habits?.join(", ") || "none"}
- Check-ins: ${checkins?.join(", ") || "none"}  
- Journal entry: ${journal || "none"}
- Current streak: ${streak} days
- Today's Solo Score: ${score}/100

Guidelines:
- Keep responses concise (2-4 sentences max)
- Be warm but not cheesy
- Reference their actual data when relevant
- Ask one reflective question when appropriate
- Focus on small wins and consistency
- If they haven't done much today, be gently encouraging, not judgmental
- Use a calm, mentor-like tone`;

    const messages = [
      { role: "system", content: systemPrompt },
    ];

    if (message) {
      messages.push({ role: "user", content: message });
    } else {
      messages.push({ role: "user", content: "Give me a brief motivational coaching message for today based on my progress." });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
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
    const content = data.choices?.[0]?.message?.content || "Keep going — every small step counts.";

    return new Response(JSON.stringify({ message: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
