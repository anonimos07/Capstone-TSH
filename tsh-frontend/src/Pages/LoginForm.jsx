import { useState } from "react"; // Missing import
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export function Login({ className, ...props }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/employee/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // para local storage ma store token dili ang username og password
    //   const token = data.token;
    //   localStorage.setItem("token", token);
    //   localStorage.setItem("user", JSON.stringify({ 
    //     role: response.data.role  // "EMPLOYEE"
    // }));

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({ 
      role: data.role  // Directly use data.role (not response.data.role)
    }));


      
      // Store user data in localStorage or state management
      // localStorage.setItem("username", JSON.stringify({
      //   employeeId: data.employeeId,
      //   username: data.username,
      //   role: data.role
      // }));
      
     
      
      window.location.href = "/EmployeeDashboard";
      console.log("Login successful:", data);
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
      
    } finally {
      setIsLoading(false);
    }
  };

 
  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-start pt-20", className)} {...props}>
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">TechStaffHub</CardTitle>
          {error && <CardDescription className="text-red-500">{error}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text" 
                  placeholder="username.EMPLOYEE"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div>
              <p className="text-sm text-gray-500 mt-4">
                <a href="/ForgotPassword" className="text-blue-500 hover:underline">
                  forgot password?
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}