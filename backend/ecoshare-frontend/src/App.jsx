import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddFood from "./pages/AddFood";
import NGOs from "./pages/NGOs";
import History from "./pages/History";
import AddNGO from "./pages/AddNGO";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Add Food - Admin & Donor */}
        <Route
          path="/add-food"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={["Admin", "Donor"]}
              >
                <AddFood />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* NGOs */}
        <Route
          path="/ngos"
          element={
            <ProtectedRoute>
              <NGOs />
            </ProtectedRoute>
          }
        />

        {/* History */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        {/* Add NGO - Admin Only */}
        <Route
          path="/add-ngo"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={["Admin"]}
              >
                <AddNGO />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;