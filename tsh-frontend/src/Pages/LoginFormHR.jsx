import { useState } from "react";
import { Building2, Lock, User, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginHR({ className, ...props }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await fetch("http://localhost:8080/hr/login", {
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
      
      window.location.href = "/HrDashboard";
      console.log("Login successful:", data);
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-center bg-background", className)} {...props}>
      <div className="w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl">
        <div className="flex flex-col md:flex-row">
          {/* Left side with illustration */}
          <div className="relative hidden w-full bg-white p-8 md:flex md:w-1/2 md:flex-col md:items-center md:justify-center">
            {/* Decorative elements */}
            <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-[#8b1e3f]/10 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#8b1e3f]/10 translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute right-12 top-12 h-16 w-16 rounded-full bg-[#8b1e3f]/20"></div>
            <div className="absolute bottom-20 left-12 h-12 w-12 rounded-full bg-[#8b1e3f]/15"></div>

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="h-full w-full bg-[linear-gradient(#8b1e3f_1px,transparent_1px),linear-gradient(to_right,#8b1e3f_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#8b1e3f]/10">
                <Building2 className="h-10 w-10 text-[#8b1e3f]" />
              </div>
              <h1 className="text-3xl font-bold text-[#8b1e3f]">TechStaffHub</h1>
              <div className="max-w-xs text-center text-[#8b1e3f]/70">
                <p>Empowering your workforce with streamlined technology solutions</p>
              </div>

              {/* Simplified illustration */}
              <div className="mt-8 flex h-48 w-48 items-center justify-center rounded-lg bg-[#8b1e3f]/5 p-4 shadow-sm">
                <div className="space-y-3 w-full">
                  <div className="h-4 w-3/4 rounded bg-[#8b1e3f]/20"></div>
                  <div className="h-4 w-full rounded bg-[#8b1e3f]/20"></div>
                  <div className="h-4 w-5/6 rounded bg-[#8b1e3f]/20"></div>
                  <div className="h-8 w-1/3 rounded bg-[#8b1e3f]/30 mx-auto mt-6"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side with form */}
          <div className="w-full bg-[#8b1e3f] p-8 md:w-1/2">
            <div className="flex h-full flex-col justify-center space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white">Welcome!</h2>
                <p className="mt-2 text-white/80">HR Portal Login</p>
              </div>

              {error && (
                <Alert variant="destructive" className="border-0 bg-red-500/20 text-white">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#8b1e3f]" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="username.HR"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="border-0 bg-white pl-10 text-[#8b1e3f] placeholder:text-[#8b1e3f]/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#8b1e3f]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="border-0 bg-white pl-10 text-[#8b1e3f]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 text-[#8b1e3f] hover:bg-transparent hover:text-[#8b1e3f]/70"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-white text-[#8b1e3f] hover:bg-white/90" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>

                <div className="text-center">
                  <a href="/ForgotPassword" className="text-sm text-white/80 hover:text-white hover:underline">
                    Forgot your password?
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}