import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

const categories = ["Steps", "Nutrition", "Weight", "Cardio"];

interface LogsScreenProps {
  onLogAdded: (log: { category: string; description: string; value: string }) => void;
}

export function LogsScreen({ onLogAdded }: LogsScreenProps) {
  const [category, setCategory] = useState("Steps");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    if (!description.trim() || !value.trim()) return;
    onLogAdded({ category, description, value });
    setDescription("");
    setValue("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1800);
  };

  const inputStyle = {
    backgroundColor: "#111111",
    border: "1px solid #1a1a1a",
    borderRadius: "8px",
    color: "#ffffff",
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 400,
    fontSize: "14px",
    padding: "13px 14px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 600,
    fontSize: "11px",
    color: "#888888",
    letterSpacing: "0.12em",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div className="flex flex-col px-4 py-3 gap-5">
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
          Add Activity Log
        </p>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "12px", color: "#555555" }}>
          Track your daily progress
        </p>
      </div>

      {/* Category Dropdown */}
      <div>
        <label style={labelStyle}>CATEGORY</label>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              ...inputStyle,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              border: dropdownOpen ? "1px solid #ccff00" : "1px solid #1a1a1a",
            }}
          >
            <span>{category}</span>
            <ChevronDown
              size={16}
              style={{
                color: "#ccff00",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                backgroundColor: "#111111",
                border: "1px solid #ccff00",
                borderRadius: "8px",
                zIndex: 10,
                overflow: "hidden",
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setDropdownOpen(false); }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "11px 14px",
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: cat === category ? 700 : 400,
                    fontSize: "14px",
                    color: cat === category ? "#ccff00" : "#ffffff",
                    backgroundColor: cat === category ? "#1a1a1a" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "block",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>DESCRIPTION</label>
        <input
          type="text"
          placeholder="e.g. Morning jog in the park"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            ...inputStyle,
            border: description ? "1px solid #333333" : "1px solid #1a1a1a",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #ccff00")}
          onBlur={(e) => (e.target.style.border = description ? "1px solid #333333" : "1px solid #1a1a1a")}
        />
      </div>

      {/* Value */}
      <div>
        <label style={labelStyle}>VALUE</label>
        <input
          type="number"
          placeholder={
            category === "Steps" ? "e.g. 8000"
            : category === "Weight" ? "e.g. 80.2"
            : category === "Cardio" ? "e.g. 30 (minutes)"
            : "e.g. 2200 (kcal)"
          }
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            ...inputStyle,
            border: value ? "1px solid #333333" : "1px solid #1a1a1a",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #ccff00")}
          onBlur={(e) => (e.target.style.border = value ? "1px solid #333333" : "1px solid #1a1a1a")}
        />
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "10px", color: "#555555", marginTop: "5px" }}>
          {category === "Steps" ? "steps" : category === "Weight" ? "kg" : category === "Cardio" ? "minutes" : "kcal"}
        </p>
      </div>

      {/* Add Log Button */}
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: success ? "#a8d900" : "#ccff00",
          color: "#000000",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: "16px",
          letterSpacing: "0.1em",
          padding: "15px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "background-color 0.15s, transform 0.1s",
          marginTop: "4px",
        }}
        onMouseDown={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)")}
        onMouseUp={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)")}
      >
        {success ? (
          "LOG ADDED ✓"
        ) : (
          <>
            <Plus size={18} strokeWidth={3} />
            ADD LOG
          </>
        )}
      </button>

      {/* Unit hints */}
      <div
        style={{
          backgroundColor: "#0d0d0d",
          border: "1px solid #1a1a1a",
          borderRadius: "8px",
          padding: "12px 14px",
        }}
      >
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "10px", color: "#555555", letterSpacing: "0.12em", marginBottom: "6px" }}>
          QUICK GUIDE
        </p>
        {[
          { cat: "Steps", hint: "Count daily steps" },
          { cat: "Nutrition", hint: "Total calories consumed" },
          { cat: "Weight", hint: "Body weight in kg" },
          { cat: "Cardio", hint: "Session duration in minutes" },
        ].map(({ cat, hint }) => (
          <div key={cat} className="flex items-center justify-between" style={{ paddingTop: "4px" }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "11px", color: cat === category ? "#ccff00" : "#444444" }}>
              {cat}
            </span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "11px", color: "#444444" }}>
              {hint}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
