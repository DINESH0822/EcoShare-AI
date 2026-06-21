import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function DashboardChart({
  foodCount,
  ngoCount,
  claimedCount,
}) {
  const data = [
    {
      name: "Foods",
      value: foodCount,
    },
    {
      name: "NGOs",
      value: ngoCount,
    },
    {
      name: "Claimed",
      value: claimedCount,
    },
  ];

  return (
    <div className="bg-slate-800 p-6 rounded-xl mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Analytics
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#ffffff"
          />

          <YAxis
            stroke="#ffffff"
          />

          <Tooltip />

          <Bar
            dataKey="value"
            fill="#22c55e"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardChart;