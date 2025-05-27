import { useEffect } from "react";

export function LogoutHR() {
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    window.location.href = "/hr";
  }, []);

  return null;
}

export default LogoutHR;