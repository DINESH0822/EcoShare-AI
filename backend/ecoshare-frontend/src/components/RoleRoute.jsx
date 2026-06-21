import { Navigate } from "react-router-dom";

function RoleRoute({ children, allowedRoles }) {
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  if (!userInfo) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default RoleRoute;