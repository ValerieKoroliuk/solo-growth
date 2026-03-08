import { Home, Target, BookOpen, Sparkles, BarChart3 } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/habits", icon: Target, label: "Habits" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/insights", icon: Sparkles, label: "Insights" },
  { to: "/progress", icon: BarChart3, label: "Progress" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
