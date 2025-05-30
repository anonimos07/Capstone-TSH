import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
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

export function LoginAdmin({ className, ...props }) { 
  const navigate = useNavigate();
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
      const response = await fetch("http://localhost:8080/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      let data;
      
      try {
        data = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError);
        throw new Error("Wrong credentials");
      }

      if (!response.ok) {
        throw new Error(data.message || "Wrong credentials");
      }

      
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("user", JSON.stringify({ 
        role: data.role  
      }));
      
     navigate("/adminDashboard");
      
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
                  placeholder="username.ADMIN"
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