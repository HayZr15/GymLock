import { ChevronRight, Bell, Globe, Shield, Moon, Info, LogOut } from "lucide-react";

const settingsItems = [
  {
    section: "Preferences",
    items: [
      { icon: Globe, label: "Language", value: "English", arrow: true },
      { icon: Moon, label: "Dark Mode", value: "Always On", arrow: false },
      { icon: Bell, label: "Notifications", value: "Enabled", arrow: true },
    ],
  },
  {
    section: "Account",
    items: [
      { icon: Shield, label: "Privacy", value: "", arrow: true },
      { icon: Info, label: "About GymLock", value: "v1.0.0", arrow: true },
      { icon: LogOut, label: "Sign Out", value: "", arrow: true },
    ],
  },
];

export function SettingsScreen() {
  return (
    <div className="flex flex-col px-4 py-3 gap-5">
      {/* Profile Card */}
      <div
        style={{
          backgroundColor: "#111111",
          border: "1px solid #1a1a1a",
          borderRadius: "10px",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: "#000000",
            border: "2px solid #ccff00",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "20px", color: "#ccff00" }}>
            JD
          </span>
        </div>
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "18px", color: "#ffffff", lineHeight: 1.1 }}>
            John Doe
          </p>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "11px", color: "#555555" }}>
            john.doe@gymlock.app
          </p>
          <span
            style={{
              display: "inline-block",
              marginTop: "4px",
              backgroundColor: "#1a1a1a",
              color: "#ccff00",
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 700,
              fontSize: "9px",
              letterSpacing: "0.1em",
              padding: "2px 8px",
              borderRadius: "3px",
            }}
          >
            PRO MEMBER
          </span>
        </div>
      </div>

      {settingsItems.map(({ section, items }) => (
        <div key={section}>
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 700,
              fontSize: "10px",
              color: "#555555",
              letterSpacing: "0.12em",
              marginBottom: "8px",
            }}
          >
            {section.toUpperCase()}
          </p>
          <div
            style={{
              backgroundColor: "#0d0d0d",
              borderRadius: "10px",
              border: "1px solid #1a1a1a",
              overflow: "hidden",
            }}
          >
            {items.map(({ icon: Icon, label, value, arrow }, idx) => (
              <div key={label}>
                <button
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "13px 14px",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#111111")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} style={{ color: label === "Sign Out" ? "#ff3b3b" : "#ccff00" }} />
                    <span
                      style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 500,
                        fontSize: "13px",
                        color: label === "Sign Out" ? "#ff3b3b" : "#ffffff",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {value && (
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "12px", color: "#555555" }}>
                        {value}
                      </span>
                    )}
                    {arrow && <ChevronRight size={14} style={{ color: "#333333" }} />}
                  </div>
                </button>
                {idx < items.length - 1 && (
                  <div style={{ height: "1px", backgroundColor: "#1a1a1a", marginLeft: "42px" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "10px", color: "#333333", textAlign: "center" }}>
        GymLock © 2026 · Built for athletes
      </p>
    </div>
  );
}
