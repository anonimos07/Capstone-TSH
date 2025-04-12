import { Outlet, Navigate } from "react-router-dom";
import Unauthorized from "../components/layout/Unauthorized";

/**
 * @param {Object} props - Component props
 * @param {string[]} props.allowedRoles - Roles permitted to access this route (e.g., ["ADMIN", "HR", "EMPLOYEE"])
 */
const ProtectedRoute = ({ allowedRoles }) => {
  // Safely get user data from localStorage
  const userData = localStorage.getItem("user"); // Changed from "username" to "user" as it likely stores user object
  let user = { role: null };

  try {
    user = userData ? JSON.parse(userData) : { role: null };
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  if (!user?.role) {
    return <Navigate to="/unauthorized" replace />;
  }

  const hasAccess = allowedRoles.includes(user.role);

  return hasAccess ? <Outlet /> : <Unauthorized />;
};

export default ProtectedRoute;