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
// Import useToast if you're using it
// import { useToast } from "@/components/ui/use-toast";

export function Login({ className, ...props }) { // Function declaration is now complete
  // State hooks should be inside the component function
  const [formData, setFormData] = useState({
    user: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // const { toast } = useToast?.() || { toast: () => {} }; // Uncomment if you're using toast

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

      // Handle successful login
      /* toast({
        title: "Login successful",
        description: `Welcome, ${data.user}`,
      }); */
      
      // Store user data in localStorage or state management
      localStorage.setItem("user", JSON.stringify({
        employeeId: data.employeeId,
        username: data.user,
        role: data.role
      }));
      
      // Redirect based on role (implement your routing logic)
      // Example: navigate to dashboard
      // window.location.href = "/dashboard";
      
      console.log("Login successful:", data);
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
      /* toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      }); */
    } finally {
      setIsLoading(false);
    }
  };

  // Removed extra { that was here
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
                <Label htmlFor="user">Username</Label>
                <Input
                  id="user"
                  type="text" // Changed from "user" to "text"
                  placeholder="user.EMPLOYEE"
                  required
                  value={formData.user}
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}