import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { QuickLog } from "./QuickLog";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";

export function AppShell({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <h1 className="font-display text-xl text-foreground">Solo</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={signOut}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <button
              onClick={toggle}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-4">{children}</main>
      <QuickLog />
      <BottomNav />
    </div>
  );
}
