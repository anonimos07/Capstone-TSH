// import { Outlet, Navigate } from "react-router-dom";

// const ProtectedRoutes = () => {
//     const user = null;
//     return user ? <Outlet /> : <Navigate to="/unauthorized" />;
// }
// export default ProtectedRoutes;

import { Outlet, Navigate } from "react-router-dom";
import Unauthorized from "../components/layout/Unauthorized"; // Your 401 component

/**
 * Role-based access control (RBAC) for routes
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Roles permitted to access this route (e.g., ["Admin", "HR"])
 */

const ProtectedRoute = ({ allowedRoles }) => {
  // Get user data (replace with your actual auth system)
  const user = JSON.parse(localStorage.getItem("user")) || {
    role: null, // Default: no access
  };

  // If user exists but has no role (edge case)
  if (!user?.role) {
    return <Navigate to="/unauthorized" />;
  }

  // Check if user's role is included in allowedRoles
  const hasAccess = allowedRoles.includes(user.role);

  return hasAccess ? (
    <Outlet /> // Grant access
  ) : (
    <Unauthorized /> // Show 401 page (or <Navigate to="/unauthorized" />)
  );
};

export default ProtectedRoute;