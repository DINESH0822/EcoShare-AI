import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(6,18,38,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px",
        padding: "10px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}>
        <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: "4px", fontWeight: "600" }}>{label}</p>
        <p style={{ color: payload[0]?.color, fontSize: "1.4rem", fontWeight: "800", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          {payload[0]?.value}
        </p>
      </div>
    );
  }
  return null;
};

function DashboardChart({ foodCount, ngoCount, claimedCount }) {
  const data = [
    { name: "Total Donations", value: foodCount },
    { name: "NGOs", value: ngoCount },
    { name: "Claimed", value: claimedCount },
  ];

  return (
    <div style={{
      background: "rgba(13,31,60,0.6)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "16px",
      padding: "28px",
      marginTop: "24px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "1.3rem", fontWeight: "800",
            margin: 0, color: "#f0f9ff",
          }}>📊 Analytics Overview</h2>
          <p style={{ color: "#475569", fontSize: "0.8rem", margin: 0 }}>Platform statistics at a glance</p>
        </div>
        <span style={{
          background: "rgba(139,92,246,0.1)",
          border: "1px solid rgba(139,92,246,0.2)",
          color: "#c4b5fd",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "0.72rem",
          fontWeight: "700",
          letterSpacing: "0.5px",
        }}>🤖 AI INSIGHTS</span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={52}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#475569"
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#475569"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "16px" }}>
        {data.map((item, i) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: COLORS[i] }} />
            <span style={{ color: "#64748b", fontSize: "0.78rem", fontWeight: "600" }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardChart;