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
import { BarChart3, Leaf } from "lucide-react";

const COLORS = ["#2563eb", "#0ea5e9", "#10b981"];
const GLOW_COLORS = [
  "rgba(37,99,235,0.12)",
  "rgba(14,165,233,0.12)",
  "rgba(16,185,129,0.12)",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-slate-900 text-2xl font-bold" style={{ color: payload[0]?.color }}>
          {payload[0]?.value}
        </p>
      </div>
    );
  }
  return null;
};

function DashboardChart({ foodCount, ngoCount, claimedCount }) {
  const data = [
    { name: "Donations", value: foodCount },
    { name: "NGO Partners", value: ngoCount },
    { name: "Claimed Meals", value: claimedCount },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> Ecosystem Overview
          </h2>
          <p className="text-slate-400 text-xs mt-1">Live platform statistics at a glance</p>
        </div>
        <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1.5">
          <Leaf className="w-3 h-3" /> ECO IMPACT
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barSize={44} barCategoryGap="40%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc", radius: 8 }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-6 justify-center mt-6 pt-5 border-t border-slate-100">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
            <span className="text-slate-500 text-[11px] font-semibold">{item.name}</span>
            <span className="text-slate-900 text-[11px] font-bold ml-1">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardChart;