import { useState, useRef } from "react";
import { Camera, X, Loader2, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import {
  type CaptureItem,
  type CaptureType,
  captureTypeConfig,
  captureTypeToLogCategory,
} from "@/lib/capture-utils";
import { type LogEntry, type LogCategory, getTodayKey, emptyDay, type SoloData, type Habit } from "@/lib/solo-utils";

type Step = "upload" | "processing" | "review";

interface AIResult {
  type: CaptureType;
  title: string;
  description: string;
  action: string;
  tags: string[];
  raw_text: string;
}

export function ScreenshotCapture() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [captures, setCaptures] = useLocalStorage<CaptureItem[]>("solo-captures", []);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>("solo-logs", []);
  const [data, setData] = useLocalStorage<SoloData>("solo-data", {});
  const [habits, setHabits] = useLocalStorage<Habit[]>("solo-habits", []);

  const reset = () => {
    setStep("upload");
    setPreview(null);
    setResult(null);
  };

  const close = () => {
    setOpen(false);
    setTimeout(reset, 300);
  };

  const processImage = async (base64: string) => {
    setStep("processing");
    try {
      const { data: fnData, error } = await supabase.functions.invoke("parse-screenshot", {
        body: { image_base64: base64 },
      });
      if (error) throw error;
      setResult(fnData as AIResult);
      setStep("review");
    } catch (e: any) {
      toast.error(e?.message || "Failed to analyze image");
      setStep("upload");
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) handleFile(file);
        break;
      }
    }
  };

  const save = () => {
    if (!result) return;
    const now = new Date().toISOString();
    const id = `cap-${Date.now()}`;

    // Save to captures
    const capture: CaptureItem = {
      id,
      type: result.type,
      title: result.title,
      description: result.description,
      action: result.action as any,
      tags: result.tags,
      raw_text: result.raw_text,
      status: "inbox",
      created_at: now,
    };
    setCaptures((prev) => [capture, ...prev]);

    // Create log entry
    const logCat = captureTypeToLogCategory(result.type) as LogCategory;
    const logEntry: LogEntry = {
      id: `log-${Date.now()}`,
      category: logCat,
      text: `[Captured] ${result.title} — ${result.description}`,
      timestamp: now,
    };
    setLogs((prev) => [logEntry, ...prev]);

    // Add habit if applicable
    if (result.type === "habit" && result.action === "add_habit") {
      const newHabit: Habit = {
        id: `hab-${Date.now()}`,
        name: result.title,
        icon: "🎯",
        createdAt: now,
      };
      setHabits((prev) => [...prev, newHabit]);
    }

    // Append to journal
    const today = getTodayKey();
    const dayData = data[today] || emptyDay();
    const journalLine = `📸 Captured: [${captureTypeConfig[result.type].label}] "${result.title}" — ${result.description}`;
    const updatedJournal = dayData.journal ? `${dayData.journal}\n${journalLine}` : journalLine;
    setData({ ...data, [today]: { ...dayData, journal: updatedJournal } });

    toast.success(`${captureTypeConfig[result.type].emoji} ${result.title} captured!`);
    close();
  };

  const typeBadgeClass = (type: CaptureType) => {
    const map: Record<string, string> = {
      book: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      movie: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
      habit: "bg-primary/15 text-primary",
      task: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
      workout: "bg-red-500/15 text-red-600 dark:text-red-400",
      learning: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      idea: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
      mood: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
      quote: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    };
    return map[type] || "bg-muted text-muted-foreground";
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[136px] right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Screenshot Capture"
      >
        <Camera className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={close}
          onPaste={onPaste}
        >
          <div
            className="mx-auto w-full max-w-md animate-scale-in rounded-t-3xl bg-card p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-foreground">📸 Capture</h3>
              <button onClick={close} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {step === "upload" && (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border py-10 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Camera className="h-8 w-8" />
                <span className="text-sm font-medium">Take a photo or upload a screenshot</span>
                <span className="text-xs">or paste from clipboard</span>
              </button>
            )}

            {step === "processing" && (
              <div className="flex flex-col items-center gap-4 py-6">
                {preview && (
                  <img src={preview} alt="Preview" className="h-20 w-20 rounded-xl object-cover" />
                )}
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="animate-pulse text-sm text-muted-foreground">Analyzing...</p>
              </div>
            )}

            {step === "review" && result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {preview && (
                    <img src={preview} alt="Preview" className="h-14 w-14 rounded-xl object-cover" />
                  )}
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeBadgeClass(result.type)}`}>
                    {captureTypeConfig[result.type]?.emoji} {captureTypeConfig[result.type]?.label}
                  </span>
                </div>

                <input
                  value={result.title}
                  onChange={(e) => setResult({ ...result, title: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <textarea
                  value={result.description}
                  onChange={(e) => setResult({ ...result, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                {result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={save}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                  <button
                    onClick={close}
                    className="flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Trash2 className="h-4 w-4" /> Discard
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        </div>
      )}
    </>
  );
}
