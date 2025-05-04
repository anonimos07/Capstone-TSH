"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function HRManagementPage() {
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentHR, setCurrentHR] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    contact: "",
    position: "",
    baseSalary: 0,
  });
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Get auth data from localStorage
  const getAuthData = () => {
    const token = localStorage.getItem("token") || "";
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role || "";
    const username = localStorage.getItem("username") || "";
    return { token, role, username };
  };

  // Check admin status on component mount
  useEffect(() => {
    const { role } = getAuthData();
    setIsAdmin(role === "ADMIN");
    if (role !== "ADMIN") {
      setError("Admin privileges required");
      setLoading(false);
      return;
    }
    fetchHRs();
  }, []);

  // Fetch HRs from backend
  const fetchHRs = async () => {
    try {
      setLoading(true);
      setError("");
      
      const { token } = getAuthData();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:8080/admin/all-hr", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (response.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch HRs: ${response.status}`);
      }

      const data = await response.json();
      setHrs(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!confirm("Are you sure you want to delete this HR?")) return;
      
      const { token } = getAuthData();
      const response = await fetch(
        `http://localhost:8080/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          credentials: 'include'
        }
      );

      if (response.status === 403) {
        throw new Error("Admin privileges required to delete HRs");
      }

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      await fetchHRs();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { token } = getAuthData();
      const url = currentHR.hrId 
        ? `http://localhost:8080/admin/${currentHR.hrId}`
        : "http://localhost:8080/admin/create-hr";

      const method = currentHR.hrId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(currentHR),
        credentials: 'include'
      });

      if (response.status === 403) {
        throw new Error("Admin privileges required");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Operation failed: ${response.status}`);
      }

      await fetchHRs();
      setOpenDialog(false);
      setCurrentHR({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        contact: "",
        position: "",
        baseSalary: 0,
      });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentHR(prev => ({
      ...prev,
      [name]: name === "baseSalary" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleBackToDashboard = () => {
    window.location.href = "/adminDashboard";
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p>Admin privileges are required to access this page.</p> 
          <Button 
            className="mt-4"
            onClick={() => window.location.href = "/admin"}
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-4">
      <div className="flex justify-start mb-4">
        <Button variant="outline" onClick={handleBackToDashboard}>
          Back to Dashboard
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">HR Management</h1>
          <Button
            onClick={() => {
              setCurrentHR({
                username: "",
                password: "",
                email: "",
                firstName: "",
                lastName: "",
                contact: "",
                position: "",
                baseSalary: 0,
              });
              setOpenDialog(true);
            }}
          >
            Add HR
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading HRs...</div>
        ) : error ? (
          <Card className="p-4 bg-red-100 text-red-800 mb-4">
            {error}
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={fetchHRs}
            >
              Retry
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {hrs.length > 0 ? (
              hrs.map((hr) => (
                <Card key={hr.hrId} className="p-4 grid grid-cols-8 gap-4 items-center">
                  <div>
                    <Label>ID</Label>
                    <div>{hr.hrId}</div>
                  </div>
                  <div>
                    <Label>Username</Label>
                    <div>{hr.username}</div>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <div>
                      {hr.firstName} {hr.lastName}
                    </div>
                  </div>
                  <div>
                    <Label>Position</Label>
                    <div>{hr.position}</div>
                  </div>
                  <div>
                    <Label>Salary</Label>
                    <div>${hr.baseSalary?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div className="col-span-3 flex space-x-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentHR({
                          ...hr,
                          password: "" // Clear password when editing
                        });
                        setOpenDialog(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(hr.hrId)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">No HRs found</div>
            )}
          </div>
        )}
      </Card>   

      {/* Add/Edit HR Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {currentHR.hrId ? "Edit HR" : "Add HR"}
            </h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username*</Label>
                <Input
                  id="username"
                  name="username"
                  value={currentHR.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {/* Only show password field for new HRs */}
              {!currentHR.hrId && (
                <div>
                  <Label htmlFor="password">Password*</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={currentHR.password}
                    onChange={handleInputChange}
                    required={!currentHR.hrId}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={currentHR.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="firstName">First Name*</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={currentHR.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name*</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={currentHR.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact*</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={currentHR.contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Position*</Label>
                <Input
                  id="position"
                  name="position"
                  value={currentHR.position}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="baseSalary">Base Salary*</Label>
                <Input
                  id="baseSalary"
                  name="baseSalary"
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentHR.baseSalary}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenDialog(false);
                    setError("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {currentHR.hrId ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}