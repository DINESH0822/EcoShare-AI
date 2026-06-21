import { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify(res.data)
      );

      alert("Login Successful");

      window.location.href = "/";

    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
        "Login Failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <form
        onSubmit={loginUser}
        className="bg-slate-800 p-8 rounded-xl w-96"
      >
        <h1 className="text-3xl text-white mb-6">
          Login
        </h1>

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

        <button
          type="submit"
          className="bg-green-500 px-5 py-3 rounded text-white hover:bg-green-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;