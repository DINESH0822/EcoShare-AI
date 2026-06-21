import { Link } from "react-router-dom";

function Navbar() {
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const userRole = userInfo?.role;
  const userName = userInfo?.name;

  const logout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  return (
    <nav className="bg-slate-800 p-4 rounded mb-6">
      <div className="flex justify-between items-center">

        <div className="space-x-6">

          <Link
            to="/"
            className="text-green-400"
          >
            Dashboard
          </Link>

          {(userRole === "Admin" ||
            userRole === "Donor") && (
            <Link to="/add-food">
              Add Food
            </Link>
          )}

          {userRole === "Admin" && (
            <Link to="/add-ngo">
              Add NGO
            </Link>
          )}

          <Link to="/ngos">
            NGOs
          </Link>

          <Link to="/history">
            History
          </Link>

        </div>

        <div className="flex items-center gap-4">

          <div className="text-right">
            <p className="text-green-400 font-semibold">
              {userName}
            </p>

            <p className="text-sm text-gray-300">
              {userRole}
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;