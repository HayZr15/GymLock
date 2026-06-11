import { Trash2 } from "lucide-react";

export interface LogEntry {
  id: string;
  date: string;
  category: string;
  value: string;
  unit: string;
  description: string;
}

interface HistoryScreenProps {
  logs: LogEntry[];
  onDelete: (id: string) => void;
}

const categoryColor: Record<string, string> = {
  Steps: "#ccff00",
  Nutrition: "#ff9f40",
  Weight: "#5bc4f5",
  Cardio: "#ff6b6b",
};

export function HistoryScreen({ logs, onDelete }: HistoryScreenProps) {
  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      <div>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "22px",
            color: "#ffffff",
            marginBottom: "2px",
          }}
        >
          Activity History
        </p>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "12px", color: "#555555" }}>
          {logs.length} log{logs.length !== 1 ? "s" : ""} recorded
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#0d0d0d",
          borderRadius: "10px",
          border: "1px solid #1a1a1a",
          overflow: "hidden",
        }}
      >
        {logs.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center" }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "13px", color: "#333333" }}>
              No logs yet. Add your first entry in Logs.
            </p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={log.id}>
              <div
                className="flex items-center justify-between"
                style={{ padding: "13px 14px" }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    style={{
                      width: "3px",
                      height: "36px",
                      backgroundColor: categoryColor[log.category] ?? "#ccff00",
                      borderRadius: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 700,
                          fontSize: "10px",
                          color: categoryColor[log.category] ?? "#ccff00",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {log.category.toUpperCase()}
                      </span>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "10px", color: "#444444" }}>
                        {log.date}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#ffffff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "180px",
                      }}
                    >
                      {log.description}
                    </p>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "14px", color: "#cccccc", lineHeight: 1.1 }}>
                      {log.value} {log.unit}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(log.id)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "6px",
                    flexShrink: 0,
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1a1a")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
                >
                  <Trash2 size={16} style={{ color: "#ccff00" }} />
                </button>
              </div>
              {idx < logs.length - 1 && (
                <div style={{ height: "1px", backgroundColor: "#1a1a1a", marginLeft: "30px" }} />
              )}
            </div>
          ))
        )}
      </div>

      {logs.length > 0 && (
        <div
          style={{
            backgroundColor: "#0d0d0d",
            border: "1px solid #1a1a1a",
            borderRadius: "8px",
            padding: "12px 14px",
          }}
        >
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "10px", color: "#555555", letterSpacing: "0.12em", marginBottom: "8px" }}>
            SUMMARY
          </p>
          {["Steps", "Nutrition", "Weight", "Cardio"].map((cat) => {
            const catLogs = logs.filter((l) => l.category === cat);
            if (catLogs.length === 0) return null;
            const latest = catLogs[0];
            return (
              <div key={cat} className="flex items-center justify-between" style={{ paddingTop: "4px" }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "11px", color: categoryColor[cat] }}>
                  {cat}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "13px", color: "#ffffff" }}>
                  {latest.value} {latest.unit}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
