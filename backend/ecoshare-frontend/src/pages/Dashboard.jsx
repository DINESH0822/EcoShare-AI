import { useEffect, useState } from "react";
import axios from "axios";
import FoodTable from "../components/FoodTable";
import Navbar from "../components/Navbar";
import DashboardChart from "../components/DashboardChart";

function Dashboard() {
  const [foodCount, setFoodCount] = useState(0);
  const [ngoCount, setNgoCount] = useState(0);
  const [claimedCount, setClaimedCount] = useState(0);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/food")
      .then((res) => {
        setFoodCount(res.data.length);

        const claimed = res.data.filter(
          (food) => food.status === "Claimed"
        );

        setClaimedCount(claimed.length);
      })
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:5000/api/ngo")
      .then((res) => {
        setNgoCount(res.data.length);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">

      <Navbar />

      <h1 className="text-5xl font-bold text-center text-green-400 mb-10">
        EcoShare AI
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold">
            Food Donations
          </h2>

          <p className="text-3xl text-green-400 mt-3">
            {foodCount}
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold">
            NGOs
          </h2>

          <p className="text-3xl text-blue-400 mt-3">
            {ngoCount}
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold">
            Claimed Foods
          </h2>

          <p className="text-3xl text-yellow-400 mt-3">
            {claimedCount}
          </p>
        </div>

      </div>

      <FoodTable />

      <DashboardChart
        foodCount={foodCount}
        ngoCount={ngoCount}
        claimedCount={claimedCount}
      />

    </div>
  );
}

export default Dashboard;