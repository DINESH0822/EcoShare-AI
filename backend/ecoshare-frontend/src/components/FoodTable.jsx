import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function FoodTable() {
  const [foods, setFoods] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const userRole = userInfo?.role;

  useEffect(() => {
    axios
      .get("https://ecoshare-ai.onrender.com/api/food")
      .then((res) => {
        setFoods(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });

    axios
      .get("https://ecoshare-ai.onrender.com/api/ngo")
      .then((res) => setNgos(res.data))
      .catch((err) => console.log(err));
  }, []);

  const claimFood = async (foodId) => {
    try {
      await axios.post(
        "https://ecoshare-ai.onrender.com/api/claim",
        {
          foodId,
          ngoName: "Helping Hands",
        }
      );

      toast.success(
        "Food Claimed Successfully"
      );

      window.location.reload();

    } catch (err) {
      console.log(err);
      toast.error("Claim Failed");
    }
  };

  const deleteFood = async (foodId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this food donation?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://ecoshare-ai.onrender.com/api/food/${foodId}`
      );

      toast.success(
        "Food Deleted Successfully"
      );

      window.location.reload();

    } catch (err) {
      console.log(err);
      toast.error("Delete Failed");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-white text-xl mt-10">
        Loading Foods...
      </div>
    );
  }

  const filteredFoods = foods
    .filter((food) =>
      food.location
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((food) => {
      const isExpired =
        new Date(food.expiryTime) < new Date();

      if (filter === "All") return true;

      if (filter === "Claimed")
        return food.status === "Claimed";

      if (filter === "Expired")
        return isExpired;

      if (filter === "Available")
        return (
          food.status === "Available" &&
          !isExpired
        );

      return true;
    });

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">
        Food Donations
      </h2>

      <input
        type="text"
        placeholder="Search by Location..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full p-3 mb-4 bg-slate-700 text-white rounded"
      />

      <select
        value={filter}
        onChange={(e) =>
          setFilter(e.target.value)
        }
        className="w-full p-3 mb-4 bg-slate-700 text-white rounded"
      >
        <option>All</option>
        <option>Available</option>
        <option>Claimed</option>
        <option>Expired</option>
      </select>

      <table className="w-full bg-slate-800 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-3">Food</th>
            <th className="p-3">Quantity</th>
            <th className="p-3">Location</th>
            <th className="p-3">Status</th>
            <th className="p-3">Claim</th>
            <th className="p-3">Delete</th>
          </tr>
        </thead>

        <tbody>
          {filteredFoods.map((food) => {
            const isExpired =
              new Date(food.expiryTime) <
              new Date();

            const recommendedNGO = ngos.find(
              (ngo) =>
                ngo.location.toLowerCase() ===
                food.location.toLowerCase()
            );

            return (
              <tr key={food._id}>
                <td className="p-3">
                  {food.foodName}
                </td>

                <td className="p-3">
                  {food.quantity}
                </td>

                <td className="p-3">
                  <p>{food.location}</p>

                  {recommendedNGO && (
                    <p className="text-blue-400 text-sm mt-1">
                      AI Suggestion:{" "}
                      {recommendedNGO.ngoName}
                    </p>
                  )}
                </td>

                <td className="p-3">
                  {food.status === "Claimed" ? (
                    <span className="text-yellow-400">
                      Claimed
                    </span>
                  ) : isExpired ? (
                    <span className="text-red-500 font-bold">
                      Expired
                    </span>
                  ) : (
                    <span className="text-green-400">
                      Available
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {food.status === "Claimed" ? (
                    <button
                      disabled
                      className="bg-gray-500 px-3 py-1 rounded"
                    >
                      Claimed
                    </button>
                  ) : isExpired ? (
                    <button
                      disabled
                      className="bg-red-500 px-3 py-1 rounded"
                    >
                      Expired
                    </button>
                  ) : userRole === "Admin" ||
                    userRole === "NGO" ? (
                    <button
                      onClick={() =>
                        claimFood(food._id)
                      }
                      className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                    >
                      Claim
                    </button>
                  ) : (
                    <span className="text-gray-400">
                      No Access
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {userRole === "Admin" ? (
                    <button
                      onClick={() =>
                        deleteFood(food._id)
                      }
                      className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  ) : (
                    <span className="text-gray-400">
                      No Access
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FoodTable;