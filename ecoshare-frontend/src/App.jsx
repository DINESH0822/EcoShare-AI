import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Dashboard from "./pages/Dashboard";
import Donations from "./pages/Donations";
import DonationDetail from "./pages/DonationDetail";
import AddFood from "./pages/AddFood";
import NGOs from "./pages/NGOs";
import NGODetail from "./pages/NGODetail";
import Operations from "./pages/Operations";
import OperationDetail from "./pages/OperationDetail";
import Sustainability from "./pages/Sustainability";
import History from "./pages/History";
import Admin from "./pages/Admin";
import Integrations from "./pages/Integrations";
import RegisterOrganization from "./pages/RegisterOrganization";
import Notifications from "./pages/Notifications";
import AddNGO from "./pages/AddNGO";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { DemoProvider } from "./config/DemoContext";

function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              border: "1px solid #1e293b",
              borderRadius: "14px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.85rem",
              fontWeight: "600",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
            },
          }}
        />

        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donor/login" element={<Login role="Donor" />} />
          <Route path="/ngo/login" element={<Login role="NGO" />} />
          <Route path="/admin/login" element={<Login role="Admin" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/donor/register" element={<Register role="Donor" />} />
          <Route path="/ngo/register" element={<Register role="NGO" />} />
          <Route path="/admin/register" element={<Register role="Admin" />} />
          <Route path="/organizations/register" element={<RegisterOrganization />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Donor"]}>
                  <Dashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["NGO"]}>
                  <Dashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Food Rescue Listings */}
          <Route
            path="/donations"
            element={
              <ProtectedRoute>
                <Donations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donations/:id"
            element={
              <ProtectedRoute>
                <DonationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/donations"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Donor"]}>
                  <Donations />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/donations"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["NGO"]}>
                  <Donations />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/donations/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Donor"]}>
                  <DonationDetail />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/donations/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["NGO"]}>
                  <DonationDetail />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Add Food */}
          <Route
            path="/add-food"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Admin", "Donor"]}>
                  <AddFood />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* NGO Directory */}
          <Route
            path="/organizations"
            element={
              <ProtectedRoute>
                <NGOs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ngos"
            element={
              <ProtectedRoute>
                <NGOs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ngos/:id"
            element={
              <ProtectedRoute>
                <NGODetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizations/:id"
            element={
              <ProtectedRoute>
                <NGODetail />
              </ProtectedRoute>
            }
          />

          {/* Operations & Pickup Pipeline */}
          <Route
            path="/operations"
            element={
              <ProtectedRoute>
                <Operations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/operations/:id"
            element={
              <ProtectedRoute>
                <OperationDetail />
              </ProtectedRoute>
            }
          />

          {/* Sustainability Index */}
          <Route
            path="/sustainability"
            element={
              <ProtectedRoute>
                <Sustainability />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Sustainability />
              </ProtectedRoute>
            }
          />

          <Route
            path="/impact"
            element={
              <ProtectedRoute>
                <Sustainability />
              </ProtectedRoute>
            }
          />

          {/* History Audit Trace */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/history"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Donor"]}>
                  <History />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/history"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["NGO"]}>
                  <History />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Admin Control Center */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Admin"]}>
                  <Admin />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin Integrations Health */}
          <Route
            path="/integrations"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Admin"]}>
                  <Integrations />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Add NGO */}
          <Route
            path="/add-ngo"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Admin"]}>
                  <AddNGO />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </DemoProvider>
  );
}

export default App;