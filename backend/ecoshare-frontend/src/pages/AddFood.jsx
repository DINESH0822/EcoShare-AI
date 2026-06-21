import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function AddFood() {
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    donorName: "",
    donorType: "",
    location: "",
    expiryTime: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitFood = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://ecoshare-ai.onrender.com/api/food",
        formData
      );

      alert("Food Added Successfully");

      setFormData({
        foodName: "",
        quantity: "",
        donorName: "",
        donorType: "",
        location: "",
        expiryTime: "",
      });
    } catch (err) {
      console.log(err);
      alert("Error Adding Food");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">

      <h1 className="text-4xl font-bold text-green-400 mb-8">
        Add Food Donation
      </h1>

      <form
        onSubmit={submitFood}
        className="max-w-xl bg-slate-800 p-6 rounded-xl space-y-4"
      >

        <input
          type="text"
          name="foodName"
          placeholder="Food Name"
          value={formData.foodName}
          onChange={handleChange}
          className="w-full p-3 bg-slate-700 text-white placeholder-gray-400 rounded"
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full p-3 bg-slate-700 text-white placeholder-gray-400 rounded"
        />

        <input
          type="text"
          name="donorName"
          placeholder="Donor Name"
          value={formData.donorName}
          onChange={handleChange}
          className="w-full p-3 bg-slate-700 text-white placeholder-gray-400 rounded"
        />

        <input
          type="text"
          name="donorType"
          placeholder="Donor Type"
          value={formData.donorType}
          onChange={handleChange}
          className="w-full p-3 bg-slate-700 text-white placeholder-gray-400 rounded"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-3 bg-slate-700 text-white placeholder-gray-400 rounded"
        />

        <input
          type="datetime-local"
          name="expiryTime"
          value={formData.expiryTime}
          onChange={handleChange}
          className="w-full p-3 bg-slate-700 text-white rounded"
        />

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded font-semibold"
        >
          Add Food
        </button>

      </form>

    </div>
  );
}

export default AddFood;