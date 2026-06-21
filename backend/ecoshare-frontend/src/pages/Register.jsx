import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Donor");

  const navigate = useNavigate();

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://ecoshare-ai.onrender.com/api/users/register",
        {
          name,
          email,
          password,
          role,
        }
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify(res.data)
      );

      alert("Registration Successful");

      navigate("/login");

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Registration Failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={registerUser}
        className="bg-slate-800 p-8 rounded-xl w-96"
      >
        <h2 className="text-4xl text-white mb-6">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
          required
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
        >
          <option value="Donor">
            Donor
          </option>
          <option value="NGO">
            NGO
          </option>
          <option value="Admin">
            Admin
          </option>
        </select>

        <button
          type="submit"
          className="bg-green-500 px-6 py-3 rounded text-white hover:bg-green-600"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;