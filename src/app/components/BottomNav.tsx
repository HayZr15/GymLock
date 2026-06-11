import { LayoutDashboard, ClipboardList, Settings } from "lucide-react";

type Tab = "dashboard" | "logs" | "settings";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: { id: Tab; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "logs", label: "Logs", Icon: ClipboardList },
    { id: "settings", label: "Settings", Icon: Settings },
  ];

  return (
    <nav
      style={{ backgroundColor: "#000000", borderTop: "1px solid #1a1a1a" }}
      className="flex items-center justify-around px-2 py-3 pb-6"
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center gap-1 px-4 py-1 transition-opacity"
            style={{ color: isActive ? "#ccff00" : "#ffffff", opacity: isActive ? 1 : 0.55 }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span style={{ fontSize: "10px", fontFamily: "'Barlow', sans-serif", fontWeight: isActive ? 700 : 500, letterSpacing: "0.05em" }}>
              {label.toUpperCase()}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
