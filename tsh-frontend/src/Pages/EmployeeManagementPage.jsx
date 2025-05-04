"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState({
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

  const handleBackToDashboard = () => {
    window.location.href = "/adminDashboard";
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
    fetchEmployees();
  }, []);

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      
      const { token } = getAuthData();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:8080/admin/all-employee", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (response.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status}`);
      }

      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!confirm("Are you sure you want to delete this employee?")) return;
      
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
        throw new Error("Admin privileges required to delete employees");
      }

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      await fetchEmployees();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { token } = getAuthData();
      const url = currentEmployee.employeeId 
        ? `http://localhost:8080/admin/${currentEmployee.employeeId}`
        : "http://localhost:8080/admin/create-employee";

      const method = currentEmployee.employeeId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(currentEmployee),
        credentials: 'include'
      });

      if (response.status === 403) {
        throw new Error("Admin privileges required");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Operation failed: ${response.status}`);
      }

      await fetchEmployees();
      setOpenDialog(false);
      setCurrentEmployee({
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
    setCurrentEmployee(prev => ({
      ...prev,
      [name]: name === "baseSalary" ? parseFloat(value) || 0 : value,
    }));
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p>Admin privileges are required to access this page.</p> 
          <Button 
            className="mt-4"
            onClick={() => window.location.href = "/login"}
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
          <h1 className="text-2xl font-bold">Employee Management</h1>
          <Button
            onClick={() => {
              setCurrentEmployee({
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
            Add Employee
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading employees...</div>
        ) : error ? (
          <Card className="p-4 bg-red-100 text-red-800 mb-4">
            {error}
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={fetchEmployees}
            >
              Retry
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <Card key={employee.employeeId} className="p-4 grid grid-cols-8 gap-4 items-center">
                  <div>
                    <Label>ID</Label>
                    <div>{employee.employeeId}</div>
                  </div>
                  <div>
                    <Label>Username</Label>
                    <div>{employee.username}</div>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <div>
                      {employee.firstName} {employee.lastName}
                    </div>
                  </div>
                  <div>
                    <Label>Position</Label>
                    <div>{employee.position}</div>
                  </div>
                  <div>
                    <Label>Salary</Label>
                    <div>${employee.baseSalary?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div className="col-span-3 flex space-x-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentEmployee({
                          ...employee,
                          password: "" // Clear password when editing
                        });
                        setOpenDialog(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(employee.employeeId)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">No employees found</div>
            )}
          </div>
        )}
      </Card>   

      {/* Add/Edit Employee Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {currentEmployee.employeeId ? "Edit Employee" : "Add Employee"}
            </h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username*</Label>
                <Input
                  id="username"
                  name="username"
                  value={currentEmployee.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {/* Only show password field for new employees */}
              {!currentEmployee.employeeId && (
                <div>
                  <Label htmlFor="password">Password*</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={currentEmployee.password}
                    onChange={handleInputChange}
                    required={!currentEmployee.employeeId}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={currentEmployee.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="firstName">First Name*</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={currentEmployee.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name*</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={currentEmployee.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact*</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={currentEmployee.contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Position*</Label>
                <Input
                  id="position"
                  name="position"
                  value={currentEmployee.position}
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
                  value={currentEmployee.baseSalary}
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
                  {currentEmployee.employeeId ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
} 