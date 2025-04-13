import { useEffect } from "react";

export function LogoutHR() {
  useEffect(() => {
    // Clear user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Redirect to HR login page using window.location.href
    window.location.href = "/hr";
  }, []);

  return null;
}

export default LogoutHR;