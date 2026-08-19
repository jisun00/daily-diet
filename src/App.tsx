import { useState } from "react";
import { ProfileTab } from "./components/ProfileTab";
import { BodyTrendTab } from "./components/BodyTrendTab";
import { GoalTab } from "./components/GoalTab";
import { MealLogTab } from "./components/MealLogTab";
import { SummaryTab } from "./components/SummaryTab";

type TabKey = "profile" | "body" | "goal" | "meals" | "summary";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "profile", label: "기본정보", icon: "👤" },
  { key: "body", label: "체성분", icon: "📈" },
  { key: "goal", label: "목표", icon: "🎯" },
  { key: "meals", label: "식단기록", icon: "🍚" },
  { key: "summary", label: "통계", icon: "📊" },
];

function App() {
  const [tab, setTab] = useState<TabKey>("profile");

  return (
    <div
      className="mx-auto flex min-h-svh w-full max-w-2xl flex-col"
      style={{ background: "var(--bg)" }}
    >
      <header className="sticky top-0 z-10 border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
        <h1 className="text-lg font-bold">식단 관리</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {tab === "profile" && <ProfileTab />}
        {tab === "body" && <BodyTrendTab />}
        {tab === "goal" && <GoalTab />}
        {tab === "meals" && <MealLogTab />}
        {tab === "summary" && <SummaryTab />}
      </main>

      <nav
        className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-2xl -translate-x-1/2 border-t"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs"
            style={{ color: tab === t.key ? "var(--accent)" : "var(--text-muted)" }}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
