import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import DataTable from "../components/DataTable";
import ErrorState from "../components/ErrorState";
import EcoBot from "../components/EcoBot";
import { useDemo } from "../config/DemoContext";
import { Search, Filter, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function Donations() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const { isDemoMode, demoDonations } = useDemo();

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFoods();
  }, [isDemoMode]);

  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    if (isDemoMode) {
      setFoods(demoDonations);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/api/food");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setFoods(data);
    } catch (err) {
      const errorMsg = err.message || "Failed to load live food listings from backend";
      setError(errorMsg);
      toast.error(errorMsg);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const safeFoods = Array.isArray(foods) ? foods : [];

  const filteredFoods = safeFoods.filter((food) => {
    const matchesSearch =
      food.foodName?.toLowerCase().includes(search.toLowerCase()) ||
      food.donorName?.toLowerCase().includes(search.toLowerCase()) ||
      food.address?.toLowerCase().includes(search.toLowerCase()) ||
      food.traceabilityId?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === "all" || food.category === selectedCategory;
    const matchesEmergency = !emergencyOnly || food.isEmergency || food.priority === "emergency";

    return matchesSearch && matchesCategory && matchesEmergency;
  });

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <p className="section-kicker">Food rescue marketplace</p>
            <h1 className="text-page-title">Food Rescue Marketplace</h1>
            <p className="text-body mt-1">Available surplus food waiting for rescue across the active network.</p>
          </div>
          <Link to="/add-food" className="btn-primary no-underline self-start sm:self-auto">
            <Plus className="w-4 h-4" /> New Donation
          </Link>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-4 shadow-[0_10px_18px_rgba(17,52,40,0.02)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search food, donor, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="eco-input pl-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="eco-input text-sm w-auto bg-[var(--surface-soft)]"
            >
              <option value="all">All categories</option>
              <option value="cooked_meals">Cooked meals</option>
              <option value="raw_vegetables">Raw produce</option>
              <option value="bakery">Bakery</option>
              <option value="dairy">Dairy</option>
            </select>

            <button
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer min-h-[44px] ${
                emergencyOnly
                  ? "bg-[rgba(214,69,69,0.08)] text-[var(--danger)] border border-[rgba(214,69,69,0.18)]"
                  : "bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              <Filter className="w-4 h-4" /> Emergency only
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-8 text-center text-xs text-[var(--text-secondary)]">
            Loading food listings...
          </div>
        ) : error ? (
          <ErrorState
            title="Backend Connection Failed"
            message={error}
            onRetry={fetchFoods}
          />
        ) : (
          <DataTable items={filteredFoods} />
        )}
        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}
