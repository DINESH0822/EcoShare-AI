import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get("https://ecoshare-ai.onrender.com/api/history")
      .then((res) => setHistory(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold text-yellow-400 mb-8">
        Claimed Food History
      </h1>

      <table className="w-full bg-slate-800 rounded-xl">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-3">Food</th>
            <th className="p-3">Claimed By</th>
            <th className="p-3">Location</th>
          </tr>
        </thead>

        <tbody>
          {history.map((food) => (
            <tr key={food._id}>
              <td className="p-3">{food.foodName}</td>
              <td className="p-3">{food.claimedBy}</td>
              <td className="p-3">{food.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;