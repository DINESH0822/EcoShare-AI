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

const COLORS = ["#087443", "#1e8e6a", "#6bbf59"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-xl">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
        <p className="text-2xl font-bold" style={{ color: payload[0]?.color }}>
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
    <div className="rounded-2xl border border-[var(--border)] bg-white/85 p-6 shadow-[var(--shadow)] backdrop-blur-sm">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text)]">
            <BarChart3 className="h-4 w-4 text-[var(--primary)]" /> Ecosystem Overview
          </h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Live platform statistics at a glance</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-[var(--primary-soft)] bg-[var(--primary-soft)] px-3 py-1 text-[10px] font-bold tracking-wider text-[var(--primary)]">
          <Leaf className="h-3 w-3" /> ECO IMPACT
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barSize={44} barCategoryGap="40%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 87, 57, 0.12)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--text-secondary)"
            tick={{ fill: "var(--text-secondary)", fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text-secondary)"
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(8, 116, 67, 0.04)", radius: 8 }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 flex justify-center gap-6 border-t border-[var(--border)] pt-5">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{item.name}</span>
            <span className="ml-1 text-[11px] font-bold text-[var(--text)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardChart;