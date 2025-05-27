import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Users, Briefcase, LogOut } from "lucide-react";

export function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || user?.role !== "ADMIN") {
      navigate("/admin");
    }
  }, [navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.clear();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user?.name && (
              <span className="text-sm font-medium text-gray-700">
                Welcome, {user.name}
              </span>
            )}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <span>View Employees</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage all employee records, view details, and update information.
              </p>
              <Button 
                onClick={() => navigate("/adminEmployees")} 
                className="w-full"
              >
                View Employees
              </Button>
            </CardContent>    
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-green-600" />
                <span>View HR Staff</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Access HR staff information, manage permissions, and track activities.
              </p>
              <Button 
                onClick={() => navigate("/adminHR")} 
                className="w-full"
                variant="outline"
              >
                View HR Staff
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}