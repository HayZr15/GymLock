import { useState } from "react";
import { TopHeader } from "./components/TopHeader";
import { BottomNav } from "./components/BottomNav";
import { DashboardScreen } from "./components/DashboardScreen";
import { LogsScreen } from "./components/LogsScreen";
import { HistoryScreen, type LogEntry } from "./components/HistoryScreen";
import { SettingsScreen } from "./components/SettingsScreen";

type Tab = "dashboard" | "logs" | "settings";

const UNIT_MAP: Record<string, string> = {
  Steps: "steps",
  Nutrition: "kcal",
  Weight: "kg",
  Cardio: "min",
};

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

const SEED_LOGS: LogEntry[] = [
  { id: "1", date: "11-06-2026", category: "Steps", value: "8,000", unit: "steps", description: "Morning walk to the gym" },
  { id: "2", date: "11-06-2026", category: "Weight", value: "80.2", unit: "kg", description: "Post-workout weigh-in" },
  { id: "3", date: "10-06-2026", category: "Cardio", value: "35", unit: "min", description: "Treadmill interval run" },
  { id: "4", date: "10-06-2026", category: "Nutrition", value: "2,180", unit: "kcal", description: "High-protein day" },
  { id: "5", date: "09-06-2026", category: "Steps", value: "10,241", unit: "steps", description: "Active recovery day" },
  { id: "6", date: "09-06-2026", category: "Weight", value: "80.5", unit: "kg", description: "Morning weigh-in" },
  { id: "7", date: "08-06-2026", category: "Cardio", value: "20", unit: "min", description: "Bike warm-up" },
  { id: "8", date: "08-06-2026", category: "Nutrition", value: "1,950", unit: "kcal", description: "Cutting phase meal" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [logs, setLogs] = useState<LogEntry[]>(SEED_LOGS);
  const [logsSubTab, setLogsSubTab] = useState<"input" | "history">("input");

  const handleLogAdded = (entry: { category: string; description: string; value: string }) => {
    const newLog: LogEntry = {
      id: String(Date.now()),
      date: formatDate(new Date()),
      category: entry.category,
      value: entry.value,
      unit: UNIT_MAP[entry.category] ?? "",
      description: entry.description,
    };
    setLogs((prev) => [newLog, ...prev]);
    setLogsSubTab("history");
  };

  const handleDelete = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const renderScreen = () => {
    if (activeTab === "dashboard") return <DashboardScreen />;
    if (activeTab === "settings") return <SettingsScreen />;
    if (activeTab === "logs") {
      if (logsSubTab === "input") return <LogsScreen onLogAdded={handleLogAdded} />;
      return <HistoryScreen logs={logs} onDelete={handleDelete} />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      {/* Phone Shell */}
      <div
        style={{
          width: "390px",
          maxWidth: "100%",
          height: "844px",
          maxHeight: "calc(100dvh - 48px)",
          backgroundColor: "#000000",
          borderRadius: "44px",
          border: "8px solid #1a1a1a",
          boxShadow: "0 0 0 1px #2a2a2a, 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(204,255,0,0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "120px",
            height: "34px",
            backgroundColor: "#000000",
            borderRadius: "20px",
            border: "1px solid #1a1a1a",
            zIndex: 20,
          }}
        />

        {/* Status Bar */}
        <div
          style={{
            height: "54px",
            paddingTop: "14px",
            paddingLeft: "20px",
            paddingRight: "20px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "12px", color: "#ffffff" }}>
            9:41
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", paddingBottom: "2px" }}>
            {/* Signal bars */}
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
              <rect x="0" y="7" width="3" height="2" rx="0.5" fill="#ffffff" />
              <rect x="4" y="5" width="3" height="4" rx="0.5" fill="#ffffff" />
              <rect x="8" y="3" width="3" height="6" rx="0.5" fill="#ffffff" />
              <rect x="12" y="1" width="3" height="8" rx="0.5" fill="#444444" />
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <circle cx="8" cy="10" r="1.2" fill="#ffffff"/>
              <path d="M5.2 7.4C6 6.5 6.95 6 8 6s2 .5 2.8 1.4" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <path d="M2.5 4.8C4.1 2.9 5.95 2 8 2s3.9.9 5.5 2.8" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            </svg>
            {/* Battery */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: "22px", height: "11px", border: "1.2px solid #ffffff", borderRadius: "2.5px", padding: "1.5px", display: "flex", alignItems: "center" }}>
                <div style={{ width: "82%", height: "100%", backgroundColor: "#ccff00", borderRadius: "1px" }} />
              </div>
              <div style={{ width: "2px", height: "5px", backgroundColor: "#ffffff", borderRadius: "0 1px 1px 0", marginLeft: "0px" }} />
            </div>
          </div>
        </div>

        {/* Header */}
        <TopHeader />

        {/* Logs Sub-Tab */}
        {activeTab === "logs" && (
          <div
            style={{
              display: "flex",
              margin: "0 16px 8px",
              backgroundColor: "#111111",
              borderRadius: "8px",
              padding: "3px",
              flexShrink: 0,
            }}
          >
            {(["input", "history"] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => setLogsSubTab(sub)}
                style={{
                  flex: 1,
                  padding: "7px",
                  borderRadius: "6px",
                  border: "none",
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  backgroundColor: logsSubTab === sub ? "#ccff00" : "transparent",
                  color: logsSubTab === sub ? "#000000" : "#555555",
                  transition: "background-color 0.15s, color 0.15s",
                }}
              >
                {sub === "input" ? "ADD LOG" : "HISTORY"}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {renderScreen()}
        </div>

        {/* Bottom Nav */}
        <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t)} />
      </div>

      {/* Subtle background glow */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "700px",
          background: "radial-gradient(ellipse at center, rgba(204,255,0,0.025) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </div>
  );
}
