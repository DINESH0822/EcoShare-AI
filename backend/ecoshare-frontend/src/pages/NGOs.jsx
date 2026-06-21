import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function NGOs() {
  const [ngos, setNgos] = useState([]);

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const userRole = userInfo?.role;

  useEffect(() => {
    axios
      .get("https://ecoshare-ai.onrender.com/api/ngo")
      .then((res) => setNgos(res.data))
      .catch((err) => console.log(err));
  }, []);

  const deleteNGO = async (ngoId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this NGO?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://ecoshare-ai.onrender.com/api/ngo/${ngoId}`
      );

      alert("NGO Deleted Successfully");

      window.location.reload();

    } catch (err) {
      console.log(err);
      alert("Delete Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">

      <Navbar />

      <h1 className="text-4xl font-bold text-blue-400 mb-8">
        Registered NGOs
      </h1>

      <div className="grid gap-4">

        {ngos.map((ngo) => (
          <div
            key={ngo._id}
            className="bg-slate-800 p-4 rounded-xl"
          >
            <h2 className="text-2xl font-bold">
              {ngo.ngoName}
            </h2>

            <p>
              Contact: {ngo.contactPerson}
            </p>

            <p>
              Phone: {ngo.phone}
            </p>

            <p>
              Email: {ngo.email}
            </p>

            <p>
              Location: {ngo.location}
            </p>

            <p>
              Capacity: {ngo.capacity}
            </p>

            {userRole === "Admin" && (
              <button
                onClick={() =>
                  deleteNGO(ngo._id)
                }
                className="mt-4 bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                Delete NGO
              </button>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}

export default NGOs;