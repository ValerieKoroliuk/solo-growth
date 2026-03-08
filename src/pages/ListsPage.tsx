import { useState } from "react";
import { ListTodo, Plus, ArrowLeft, Pencil, Trash2, Target, Check, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Progress } from "@/components/ui/progress";
import { SoloScoreRing } from "@/components/SoloScoreRing";
import { toast } from "sonner";
import {
  type SoloList,
  type Goal,
  type GoalMilestone,
  defaultLists,
  listColorMap,
  emojiOptions,
  colorOptions,
  calculateGoalProgress,
  daysLeft,
  createListItem,
} from "@/lib/list-utils";

type View = "home" | "list-detail" | "goal-detail" | "create-list" | "create-goal";

export default function ListsPage() {
  const [lists, setLists] = useLocalStorage<SoloList[]>("solo-lists", defaultLists);
  const [goals, setGoals] = useLocalStorage<Goal[]>("solo-goals", []);

  const [view, setView] = useState<View>("home");
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [goalSourceItemId, setGoalSourceItemId] = useState<string | null>(null);

  const activeList = lists.find((l) => l.id === activeListId) || null;
  const activeGoal = goals.find((g) => g.id === activeGoalId) || null;

  const openList = (id: string) => { setActiveListId(id); setView("list-detail"); };
  const openGoal = (id: string) => { setActiveGoalId(id); setView("goal-detail"); };
  const goHome = () => { setView("home"); setActiveListId(null); setActiveGoalId(null); };

  const activeGoals = goals.filter((g) => g.status === "active");

  // ===================== HOME VIEW =====================
  if (view === "home") {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl text-foreground">Lists & Goals</h2>
          </div>
          <button onClick={() => setView("create-list")} className="rounded-full bg-primary p-2 text-primary-foreground transition-transform hover:scale-105">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {lists.map((list) => {
            const colors = listColorMap[list.color] || listColorMap.blue;
            const total = list.items.length;
            const checked = list.items.filter((i) => i.checked).length;
            const pct = total > 0 ? (checked / total) * 100 : 0;
            return (
              <button key={list.id} onClick={() => openList(list.id)} className={`solo-card border-l-4 ${colors.border} flex flex-col items-start gap-2 p-4 text-left transition-all hover:scale-[1.02]`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg} text-lg`}>{list.icon}</div>
                <span className="text-sm font-semibold text-foreground">{list.name}</span>
                <span className="text-[10px] text-muted-foreground">{total} item{total !== 1 ? "s" : ""}</span>
                {total > 0 && <div className="h-1.5 w-full rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>}
              </button>
            );
          })}
        </div>

        {activeGoals.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">🎯 Active Goals</h3>
            {activeGoals.map((goal) => (
              <button key={goal.id} onClick={() => openGoal(goal.id)} className="solo-card flex w-full items-center gap-3 text-left">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{goal.title}</p>
                  <p className="text-[10px] text-muted-foreground">Due {new Date(goal.target_date).toLocaleDateString("en", { month: "short", day: "numeric" })} · {daysLeft(goal.target_date)} days left</p>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${goal.progress}%` }} /></div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ===================== CREATE LIST =====================
  if (view === "create-list") {
    return <CreateListView onBack={goHome} onCreate={(list) => { setLists((prev) => [...prev, list]); goHome(); toast.success(`${list.icon} ${list.name} created!`); }} />;
  }

  // ===================== LIST DETAIL =====================
  if (view === "list-detail" && activeList) {
    return (
      <ListDetailView
        list={activeList}
        goals={goals}
        onBack={goHome}
        onUpdate={(updated) => setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))}
        onDelete={() => { setLists((prev) => prev.filter((l) => l.id !== activeListId)); goHome(); toast.success("List deleted"); }}
        onConvertToGoal={(itemId) => { setGoalSourceItemId(itemId); setActiveListId(activeListId); setView("create-goal"); }}
        onOpenGoal={openGoal}
      />
    );
  }

  // ===================== CREATE GOAL =====================
  if (view === "create-goal") {
    const sourceItem = activeList?.items.find((i) => i.id === goalSourceItemId);
    return (
      <CreateGoalView
        initialTitle={sourceItem?.text || ""}
        sourceListId={activeListId}
        sourceItemId={goalSourceItemId}
        onBack={() => { if (activeListId) setView("list-detail"); else goHome(); }}
        onCreate={(goal) => {
          setGoals((prev) => [...prev, goal]);
          if (activeListId && goalSourceItemId) {
            setLists((prev) => prev.map((l) => l.id === activeListId ? { ...l, items: l.items.map((i) => i.id === goalSourceItemId ? { ...i, goal_id: goal.id } : i) } : l));
          }
          setGoalSourceItemId(null);
          if (activeListId) setView("list-detail"); else goHome();
          toast.success("🎯 Goal created!");
        }}
      />
    );
  }

  // ===================== GOAL DETAIL =====================
  if (view === "goal-detail" && activeGoal) {
    const sourceList = activeGoal.source_list_id ? lists.find((l) => l.id === activeGoal.source_list_id) : null;
    return (
      <GoalDetailView
        goal={activeGoal}
        sourceList={sourceList}
        onBack={goHome}
        onUpdate={(updated) => setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))}
        onDelete={() => { setGoals((prev) => prev.filter((g) => g.id !== activeGoalId)); goHome(); toast.success("Goal deleted"); }}
      />
    );
  }

  return null;
}

// ==================== SUB-COMPONENTS ====================

function CreateListView({ onBack, onCreate }: { onBack: () => void; onCreate: (list: SoloList) => void }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState("blue");

  const submit = () => {
    if (!name.trim()) return;
    const list: SoloList = { id: `list-${Date.now()}`, name: name.trim(), icon, color, items: [], created_at: new Date().toISOString() };
    onCreate(list);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="font-display text-xl text-foreground">New List</h2>
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="List name..." className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Icon</p>
        <div className="flex flex-wrap gap-2">
          {emojiOptions.map((e) => (
            <button key={e} onClick={() => setIcon(e)} className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${icon === e ? "bg-primary/15 ring-2 ring-primary/40" : "bg-muted hover:bg-muted/80"}`}>{e}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Color</p>
        <div className="flex gap-3">
          {colorOptions.map((c) => {
            const bgMap: Record<string, string> = { blue: "bg-blue-500", purple: "bg-purple-500", orange: "bg-orange-500", green: "bg-green-500", pink: "bg-pink-500" };
            return <button key={c} onClick={() => setColor(c)} className={`h-8 w-8 rounded-full ${bgMap[c]} transition-all ${color === c ? "ring-2 ring-offset-2 ring-offset-background ring-primary" : "opacity-60 hover:opacity-100"}`} />;
          })}
        </div>
      </div>
      <button onClick={submit} disabled={!name.trim()} className="w-full rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">Create List</button>
    </div>
  );
}

function ListDetailView({ list, goals, onBack, onUpdate, onDelete, onConvertToGoal, onOpenGoal }: {
  list: SoloList; goals: Goal[]; onBack: () => void; onUpdate: (l: SoloList) => void; onDelete: () => void; onConvertToGoal: (itemId: string) => void; onOpenGoal: (id: string) => void;
}) {
  const [newItem, setNewItem] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);
  const colors = listColorMap[list.color] || listColorMap.blue;

  const addItem = () => {
    if (!newItem.trim()) return;
    const item = createListItem(newItem.trim());
    onUpdate({ ...list, items: [...list.items, item] });
    setNewItem("");
  };

  const toggleItem = (id: string) => {
    onUpdate({ ...list, items: list.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) });
  };

  const deleteItem = (id: string) => {
    onUpdate({ ...list, items: list.items.filter((i) => i.id !== id) });
  };

  const saveName = () => {
    if (editName.trim()) onUpdate({ ...list, name: editName.trim() });
    setEditing(false);
  };

  const unchecked = list.items.filter((i) => !i.checked);
  const checked = list.items.filter((i) => i.checked);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg} text-lg`}>{list.icon}</div>
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveName()} className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus />
            <button onClick={saveName} className="text-primary"><Check className="h-4 w-4" /></button>
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2">
            <h2 className="font-display text-xl text-foreground">{list.name}</h2>
            <button onClick={() => { setEditing(true); setEditName(list.name); }} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {unchecked.map((item) => {
          const itemGoal = item.goal_id ? goals.find((g) => g.id === item.goal_id) : null;
          return (
            <div key={item.id} className="solo-card flex items-center gap-3 py-3">
              <button onClick={() => toggleItem(item.id)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 transition-colors hover:border-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{item.text}</p>
                {item.note && <p className="text-[10px] text-muted-foreground truncate">{item.note}</p>}
                {itemGoal && (
                  <button onClick={() => onOpenGoal(itemGoal.id)} className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    🎯 Goal
                  </button>
                )}
              </div>
              {!item.goal_id && (
                <button onClick={() => onConvertToGoal(item.id)} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" title="Convert to goal">
                  <Target className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => deleteItem(item.id)} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        {checked.map((item) => (
          <div key={item.id} className="solo-card flex items-center gap-3 py-3 opacity-50">
            <button onClick={() => toggleItem(item.id)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground">
              <Check className="h-3 w-3" />
            </button>
            <p className="flex-1 text-sm text-muted-foreground line-through truncate">{item.text}</p>
            <button onClick={() => deleteItem(item.id)} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add item */}
      <div className="flex gap-2">
        <input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} placeholder="Add item..." className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <button onClick={addItem} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Add</button>
      </div>

      <button onClick={onDelete} className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
        <Trash2 className="h-4 w-4" /> Delete List
      </button>
    </div>
  );
}

function CreateGoalView({ initialTitle, sourceListId, sourceItemId, onBack, onCreate }: {
  initialTitle: string; sourceListId: string | null; sourceItemId: string | null; onBack: () => void; onCreate: (goal: Goal) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState("");
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [newMilestone, setNewMilestone] = useState("");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1); d.setDate(0);
    return d.toISOString().slice(0, 10);
  });

  const setQuickDate = (months: number) => {
    const d = new Date(); d.setMonth(d.getMonth() + months); d.setDate(0);
    setTargetDate(d.toISOString().slice(0, 10));
  };

  const addMilestone = () => {
    if (!newMilestone.trim() || milestones.length >= 5) return;
    setMilestones([...milestones, { id: `ms-${Date.now()}`, text: newMilestone.trim(), done: false }]);
    setNewMilestone("");
  };

  const removeMilestone = (id: string) => setMilestones(milestones.filter((m) => m.id !== id));

  const submit = () => {
    if (!title.trim()) return;
    const goal: Goal = {
      id: `goal-${Date.now()}`, title: title.trim(), description: desc.trim(),
      source_list_id: sourceListId, source_item_id: sourceItemId,
      target_date: targetDate, status: "active", progress: 0,
      milestones, created_at: new Date().toISOString(),
    };
    onCreate(goal);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="font-display text-xl text-foreground">New Goal</h2>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title..." className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)..." rows={2} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Target Date</p>
        <div className="flex gap-2 mb-2">
          {[{ label: "This month", m: 0 }, { label: "Next month", m: 1 }, { label: "In 3 months", m: 3 }].map(({ label, m }) => (
            <button key={label} onClick={() => setQuickDate(m || 1)} className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">{label}</button>
          ))}
        </div>
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Milestones ({milestones.length}/5)</p>
        <div className="space-y-1.5 mb-2">
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
              <span className="flex-1 text-sm text-foreground">{m.text}</span>
              <button onClick={() => removeMilestone(m.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
        {milestones.length < 5 && (
          <div className="flex gap-2">
            <input value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMilestone()} placeholder="Add milestone..." className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={addMilestone} className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Add</button>
          </div>
        )}
      </div>

      <button onClick={submit} disabled={!title.trim()} className="w-full rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">Create Goal</button>
    </div>
  );
}

function GoalDetailView({ goal, sourceList, onBack, onUpdate, onDelete }: {
  goal: Goal; sourceList: SoloList | null | undefined; onBack: () => void; onUpdate: (g: Goal) => void; onDelete: () => void;
}) {
  const toggleMilestone = (id: string) => {
    const updated = goal.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m));
    const progress = calculateGoalProgress(updated);
    onUpdate({ ...goal, milestones: updated, progress });
  };

  const statusColors: Record<string, string> = {
    active: "bg-primary/15 text-primary",
    completed: "bg-green-500/15 text-green-600",
    abandoned: "bg-muted text-muted-foreground",
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="font-display text-xl text-foreground flex-1 truncate">{goal.title}</h2>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColors[goal.status]}`}>{goal.status}</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <SoloScoreRing score={goal.progress} size={100} />
        <p className="text-xs text-muted-foreground">{daysLeft(goal.target_date)} days left · Due {new Date(goal.target_date).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
      </div>

      {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}

      {sourceList && (
        <p className="text-xs text-muted-foreground">From: {sourceList.icon} {sourceList.name}</p>
      )}

      {goal.milestones.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Milestones</p>
          {goal.milestones.map((m) => (
            <button key={m.id} onClick={() => toggleMilestone(m.id)} className="solo-card flex w-full items-center gap-3 py-3 text-left">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${m.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                {m.done && <Check className="h-3 w-3" />}
              </div>
              <span className={`text-sm ${m.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{m.text}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {goal.status === "active" && (
          <>
            <button onClick={() => onUpdate({ ...goal, status: "completed", progress: 100 })} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground">Mark Complete</button>
            <button onClick={() => onUpdate({ ...goal, status: "abandoned" })} className="rounded-xl bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground">Abandon</button>
          </>
        )}
        {goal.status !== "active" && (
          <button onClick={() => onUpdate({ ...goal, status: "active" })} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground">Reactivate</button>
        )}
      </div>
      <button onClick={onDelete} className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/20">
        <Trash2 className="h-4 w-4" /> Delete Goal
      </button>
    </div>
  );
}
