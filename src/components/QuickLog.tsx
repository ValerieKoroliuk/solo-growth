import { useState, useRef, useEffect } from "react";
import { Plus, X, Send } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { logCategories, type LogEntry, type LogCategory } from "@/lib/solo-utils";

export function QuickLog() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>("solo-logs", []);
  const [category, setCategory] = useState<LogCategory>("note");
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, category]);

  const submit = () => {
    if (!text.trim()) return;
    const entry: LogEntry = {
      id: `log-${Date.now()}`,
      category,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [entry, ...prev]);
    setText("");
    setOpen(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Quick Log"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="mx-auto w-full max-w-md animate-scale-in rounded-t-3xl bg-card p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-foreground">Quick Log</h3>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Category picker */}
            <div className="mb-4 flex flex-wrap gap-2">
              {logCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    category === cat.id
                      ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={`Log a ${logCategories.find((c) => c.id === category)?.label.toLowerCase()}...`}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={submit}
                disabled={!text.trim()}
                className="rounded-xl bg-primary px-4 py-2.5 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
