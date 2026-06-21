import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function AddNGO() {
  const [formData, setFormData] = useState({
    ngoName: "",
    contactPerson: "",
    phone: "",
    email: "",
    location: "",
    capacity: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const submitNGO = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/ngo",
        formData
      );

      alert("NGO Registered Successfully");

      setFormData({
        ngoName: "",
        contactPerson: "",
        phone: "",
        email: "",
        location: "",
        capacity: ""
      });

    } catch (err) {
      console.log(err);
      alert("Error Registering NGO");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">

      <h1 className="text-4xl font-bold text-blue-400 mb-8">
        Register NGO
      </h1>

      <form
        onSubmit={submitNGO}
        className="max-w-xl bg-slate-800 p-6 rounded-xl"
      >

        <input
          type="text"
          name="ngoName"
          placeholder="NGO Name"
          value={formData.ngoName}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-slate-700 text-white rounded"
        />

        <input
          type="text"
          name="contactPerson"
          placeholder="Contact Person"
          value={formData.contactPerson}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-slate-700 text-white rounded"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-slate-700 text-white rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-slate-700 text-white rounded"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-slate-700 text-white rounded"
        />

        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={formData.capacity}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-slate-700 text-white rounded"
        />

        <button
          type="submit"
          className="bg-blue-500 px-5 py-3 rounded"
        >
          Register NGO
        </button>

      </form>

    </div>
  );
}

export default AddNGO;