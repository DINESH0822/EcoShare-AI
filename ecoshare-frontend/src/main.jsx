import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./config/AuthContext.jsx";
import { SocketProvider } from "./config/SocketContext.jsx";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
);