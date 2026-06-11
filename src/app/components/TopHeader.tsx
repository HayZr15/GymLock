export function TopHeader() {
  return (
    <header
      className="flex items-center justify-between px-5 py-4"
      style={{ backgroundColor: "#000000" }}
    >
      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: "22px",
          color: "#ffffff",
          letterSpacing: "0.08em",
        }}
      >
        GymLock
      </span>
      <button
        style={{
          border: "1.5px solid #ccff00",
          color: "#ffffff",
          backgroundColor: "transparent",
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 700,
          fontSize: "11px",
          letterSpacing: "0.1em",
          padding: "3px 10px",
          borderRadius: "4px",
        }}
      >
        EN
      </button>
    </header>
  );
}
