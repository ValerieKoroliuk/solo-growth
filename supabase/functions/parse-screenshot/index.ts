import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image_base64 } = await req.json();
    if (!image_base64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an image analysis assistant. Analyze the uploaded image and extract structured data.

Rules:
- If you see a book or book cover → type: "book", action: "want_to_read"
- If you see a movie poster, TV show, or film → type: "movie", action: "want_to_watch"
- If you see a habit tracker, routine, or daily schedule → type: "habit", action: "add_habit"
- If you see a to-do list or task list → type: "task", action: "add_task"
- If you see a quote or inspirational text → type: "quote", action: "log_entry"
- If you see a workout or fitness content → type: "workout", action: "log_entry"
- If you see educational content or notes → type: "learning", action: "log_entry"
- If you see a mood/emotion content → type: "mood", action: "log_entry"
- If you see an idea, brainstorm, or concept → type: "idea", action: "log_entry"
- Anything else → closest matching type, action: "log_entry"

You MUST respond with this exact JSON structure and nothing else:
{
  "type": "book|movie|habit|task|note|workout|learning|idea|mood|quote",
  "title": "concise title",
  "description": "brief description of what was captured",
  "action": "want_to_read|want_to_watch|add_habit|add_task|log_entry",
  "tags": ["tag1", "tag2"],
  "raw_text": "any text extracted from the image"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image and return structured JSON." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image_base64}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted, please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", status, t);
      throw new Error("AI analysis failed");
    }

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        type: "note",
        title: "Captured Image",
        description: content.slice(0, 200),
        action: "log_entry",
        tags: [],
        raw_text: content,
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-screenshot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
