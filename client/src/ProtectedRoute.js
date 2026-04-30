import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />; // 🔴 login page
  }

  return children; // ✅ allow access
}

export default ProtectedRoute;