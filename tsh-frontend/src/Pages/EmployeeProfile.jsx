import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { MainNav } from '../components/dashboard/MainNav';
import { UserNav } from '../components/dashboard/UserNav';
import LoadingSpinner from '../components/ui/LoadingSpinner'; // Import LoadingSpinner

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    contact: '',
    position: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        console.log("Token:", token);
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        const response = await fetch("http://localhost:8080/employee/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const responseClone = response.clone();
          let errorMessage = `Server error: ${response.status}`;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            try {
              const text = await responseClone.text();
              if (text) errorMessage += ` - ${text}`;
            } catch (textError) {
              console.error("Failed to read response body", textError);
            }
          }
          
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/unauthorized");
            return;
          } else if (response.status === 403) {
            navigate("/403");
            return; 
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("API Response:", data);
        setEmployee({
          username: data.username || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          role: data.role || "",
          contact: data.contact || "",
          position: data.position || ""
        });
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [navigate]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch("http://localhost:8080/employee/update-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employee),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile.");
      }
  
      setIsEditMode(false);
    } catch (err) {
      console.error("Profile update error:", err);
      alert(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-gray-700">{error}</p>
        <Button
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <MainNav userType="employee" />
          </div>
          <UserNav userName={fullName} userEmail={employee.email} />
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Employee Profile</CardTitle>
              <div className="space-x-2">
                <Button variant="outline">Change Password</Button>
                <Button
                  onClick={isEditMode ? handleSaveProfile : () => setIsEditMode(true)}
                  disabled={isSaving}
                >
                  {isEditMode ? (isSaving ? "Saving..." : "Save Profile") : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h2 className="text-xl font-semibold">{employee.firstName} {employee.lastName}</h2>
                  <p className="text-gray-600">{employee.position} <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded ml-2">{employee.role}</span></p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Username</label>
                      <p className="mt-1 w-full p-2 text-gray-900">{employee.username}</p>
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-500">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={employee.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1 w-full p-2 border rounded"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-500">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={employee.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1 w-full p-2 border rounded"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <input
                        type="text"
                        name="email"
                        value={employee.email}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1 w-full p-2 border rounded"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-500">Contact</label>
                      <input
                        type="text"
                        name="contact"
                        value={employee.contact}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1 w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">Last updated: {new Date().toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} TechStaffHub. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-500">Developed by TechStaffHub</p>
        </div>
      </footer>
    </div>
  );
};

export default EmployeeProfile;