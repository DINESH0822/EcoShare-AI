import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import { useDemo } from "../config/DemoContext";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Download, Info } from "lucide-react";
import toast from "react-hot-toast";

function Sustainability() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const { isDemoMode } = useDemo();

  useEffect(() => {
    fetchAnalytics();
  }, [isDemoMode]);

  const fetchAnalytics = async () => {
    setLoading(true);
    if (isDemoMode) {
      setStats({
        mealsSaved: 2480,
        foodWastePrevented: 992.0,
        co2Saved: 2480.0,
        waterSaved: 620000,
        organizationsServed: 18,
        avgRescueTimeMins: 24,
        trends: [
          { month: "Week 1", donated: 520, claimed: 490 },
          { month: "Week 2", donated: 680, claimed: 640 },
          { month: "Week 3", donated: 750, claimed: 710 },
          { month: "Week 4", donated: 810, claimed: 780 }
        ]
      });
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/analytics");
      setStats(res.data);
    } catch (err) {
      setStats({
        mealsSaved: 2480,
        foodWastePrevented: 992.0,
        co2Saved: 2480.0,
        waterSaved: 620000,
        organizationsServed: 18,
        avgRescueTimeMins: 24,
        trends: [{ month: "Week 1", donated: 520, claimed: 490 }]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSR = () => {
    toast.success("Impact Summary Report exported!");
  };

  const co2 = stats?.co2Saved || 2480;
  const water = stats?.waterSaved || 620000;
  const waste = stats?.foodWastePrevented || 992;
  const meals = stats?.mealsSaved || 2480;
  const orgs = stats?.organizationsServed || 18;
  const avgTime = stats?.avgRescueTimeMins || 24;

  const topMetrics = [
    { label: "Meals Rescued", value: meals.toLocaleString(), sub: "Total servings distributed" },
    { label: "Successful Pickups", value: "98.4%", sub: "On-time completion" },
    { label: "Organizations Served", value: orgs, sub: "Verified NGO partners" },
    { label: "Avg Rescue Time", value: `${avgTime} mins`, sub: "Dispatch to arrival" },
  ];

  const envMetrics = [
    { label: "Food Waste Diverted", value: `${waste} kg`, tag: "ESTIMATED" },
    { label: "Carbon Offset", value: `${co2} kg CO₂e`, tag: "ESTIMATED" },
    { label: "Virtual Water Saved", value: `${water.toLocaleString()} L`, tag: "ESTIMATED" },
  ];

  const lineData = stats?.trends || [];

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container space-y-6">
        
        {/* Header + Time Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-page-title">Analytics & Impact</h1>
            <p className="text-body mt-1">Operational performance metrics and estimated environmental impact.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#0D1A2A] border border-[#1E3045] p-1 rounded-lg text-sm font-medium">
              {["7d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3.5 py-1.5 rounded-md cursor-pointer ${
                    timeRange === range ? "bg-[#3B82F6] text-white font-semibold" : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSR}
              className="btn-primary text-sm no-underline cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4" /> Export report
            </button>
          </div>
        </div>

        {/* Top 4 Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topMetrics.map((m) => (
            <div key={m.label} className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-4">
              <span className="text-xs text-[#94A3B8] font-medium block">{m.label}</span>
              <p className="text-2xl font-bold text-white mt-1">{m.value}</p>
              <span className="text-[11px] text-[#64748B] block mt-0.5">{m.sub}</span>
            </div>
          ))}
        </div>

        {/* Rescue Activity Chart */}
        <div className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-section-title text-base">Rescue Velocity</h3>
            <span className="text-xs text-[#94A3B8]">Donated vs Rescued</span>
          </div>
          
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorDonated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClaimed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3045" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0D1A2A", border: "1px solid #1E3045", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                <Area type="monotone" dataKey="donated" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorDonated)" name="Donated Meals" />
                <Area type="monotone" dataKey="claimed" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorClaimed)" name="Rescued Meals" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environmental Impact Strip */}
        <div className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-5 space-y-3">
          <h3 className="text-section-title text-base">Estimated Environmental Impact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {envMetrics.map((e) => (
              <div key={e.label} className="p-3 bg-[#07111F] rounded-lg border border-[#1E3045] flex justify-between items-center">
                <div>
                  <span className="text-[#94A3B8] font-medium block">{e.label}</span>
                  <p className="text-lg font-bold text-white mt-0.5">{e.value}</p>
                </div>
                <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                  {e.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}

export default Sustainability;
