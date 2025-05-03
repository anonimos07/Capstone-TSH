import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        
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
        setEmployee({
          username: data.username || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          role: data.role || ""
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

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Employee Profile</CardTitle>
              <div className="space-x-2">
                <Button variant="outline">Change Password</Button>
                <Button>Edit Profile</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h2 className="text-xl font-semibold">{employee.firstName} {employee.lastName}</h2>
                  <p className="text-gray-600">Role: {employee.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Username</span> {employee.username}</p>
                    <p><span className="text-gray-500">Email</span> {employee.email}</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">Last updated: {new Date().toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfile;