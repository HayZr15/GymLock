import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Dumbbell, Flame, Footprints, TrendingUp } from "lucide-react";

const weightData = [
  { day: "May 1", weight: 84.2 },
  { day: "May 6", weight: 83.8 },
  { day: "May 11", weight: 83.1 },
  { day: "May 16", weight: 82.7 },
  { day: "May 21", weight: 82.3 },
  { day: "May 26", weight: 81.9 },
  { day: "Jun 1", weight: 81.4 },
  { day: "Jun 6", weight: 80.8 },
  { day: "Jun 11", weight: 80.2 },
];

const stats = [
  { icon: Footprints, label: "Steps", value: "8,240", unit: "today" },
  { icon: Flame, label: "Calories", value: "2,180", unit: "kcal" },
  { icon: Dumbbell, label: "Workouts", value: "3", unit: "this week" },
  { icon: TrendingUp, label: "Weight", value: "80.2", unit: "kg" },
];

export function DashboardScreen() {
  return (
    <div className="flex flex-col gap-4 px-4 py-3 overflow-y-auto">
      {/* Suggested Workout Card */}
      <div
        style={{
          border: "1.5px solid #ccff00",
          backgroundColor: "#000000",
          borderRadius: "10px",
          padding: "16px",
        }}
      >
        <p
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 700,
            fontSize: "10px",
            color: "#ccff00",
            letterSpacing: "0.15em",
            marginBottom: "6px",
          }}
        >
          SUGGESTION OF THE DAY
        </p>
        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "18px",
            color: "#ffffff",
            lineHeight: 1.2,
            marginBottom: "8px",
          }}
        >
          Suggested Workout Program
        </h2>
        <div
          style={{
            backgroundColor: "#111111",
            borderRadius: "6px",
            padding: "10px 12px",
          }}
        >
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "13px", color: "#ffffff", marginBottom: "4px" }}>
            Upper Body Strength
          </p>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "11px", color: "#888888" }}>
            Bench Press · Pull-ups · OHP · Rows — 4×8
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          {["45 min", "Intermediate", "Hypertrophy"].map((tag) => (
            <span
              key={tag}
              style={{
                backgroundColor: "#1a1a1a",
                color: "#ccff00",
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: "9px",
                letterSpacing: "0.08em",
                padding: "3px 8px",
                borderRadius: "3px",
              }}
            >
              {tag.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {stats.map(({ icon: Icon, label, value, unit }) => (
          <div
            key={label}
            style={{
              backgroundColor: "#111111",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid #1a1a1a",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} style={{ color: "#ccff00" }} />
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "10px", color: "#888888", letterSpacing: "0.1em" }}>
                {label.toUpperCase()}
              </span>
            </div>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "22px", color: "#ffffff", lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "10px", color: "#555555", marginTop: "2px" }}>
              {unit}
            </p>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      <div
        style={{
          backgroundColor: "#0d0d0d",
          borderRadius: "10px",
          padding: "16px",
          border: "1px solid #1a1a1a",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 700,
              fontSize: "10px",
              color: "#888888",
              letterSpacing: "0.12em",
            }}
          >
            PROGRESS CHART — WEIGHT TRACKER
          </p>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "10px", color: "#ccff00" }}>
            −4.0 kg
          </span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={weightData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis
              key="xaxis"
              dataKey="day"
              tick={{ fill: "#555555", fontSize: 9, fontFamily: "Barlow, sans-serif" }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              key="yaxis"
              tick={{ fill: "#555555", fontSize: 9, fontFamily: "Barlow, sans-serif" }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
            />
            <Tooltip
              key="tooltip"
              contentStyle={{ backgroundColor: "#111111", border: "1px solid #ccff00", borderRadius: "6px", fontFamily: "Barlow, sans-serif", fontSize: "11px", color: "#ffffff" }}
              labelStyle={{ color: "#888888", marginBottom: "2px" }}
              formatter={(value: number) => [`${value} kg`, "Weight"]}
              cursor={{ stroke: "#ccff00", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Line
              key="line-weight"
              type="monotone"
              dataKey="weight"
              stroke="#ccff00"
              strokeWidth={2}
              dot={{ fill: "#ccff00", r: 3, strokeWidth: 0 }}
              activeDot={{ fill: "#ccff00", r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
