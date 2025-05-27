import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Building2, Lock, User, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import employeebg from "@/assets/employeebg.jpg"

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b1e3f]"></div>
    </div>
  );
}

export function Login({ className, ...props }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [backgroundPosition, setBackgroundPosition] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundPosition((prev) => (prev + 0.5) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8080/employee/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const text = await response.text()
      let data

      try {
        data = text ? JSON.parse(text) : {}
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError)
        throw new Error("Wrong credentials")
      }

      if (!response.ok) {
        throw new Error(data.message || "Wrong credentials")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("username", data.username)
      localStorage.setItem("employeeId", data.employeeId)
      localStorage.setItem("user", JSON.stringify({ role: data.role }))

      navigate("/EmployeeDashboard")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Wrong credentials")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleHRLogin = (e) => {
    e.preventDefault()
    setIsTransitioning(true)

    setTimeout(() => {
      navigate("/hr")
    }, 500)
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    setIsForgotPasswordLoading(true)
    setTimeout(() => {
      navigate("/ForgotPassword")
      setIsForgotPasswordLoading(false)
    }, 1000)
  }

  if (isForgotPasswordLoading) {
    return <LoadingSpinner />
  }

  return (
    <div
      className={cn("flex min-h-screen items-center justify-center w-full", className)}
      style={{
        backgroundImage: `url(${employeebg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      {...props}
    >
      <div
        className={cn(
          "relative w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl bg-white/90 backdrop-blur-sm z-10",
          isTransitioning ? "opacity-0 translate-y-10" : "opacity-100",
        )}
        style={{ transition: "opacity 500ms ease, transform 500ms ease" }}
      >
        <div className="relative z-10 flex flex-col md:flex-row">
          <div className="hidden w-full items-center justify-center p-12 md:flex md:w-1/2">
            <div className="max-w-md space-y-6 text-gray-800">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-800/10 backdrop-blur-sm">
                  <Building2 className="h-8 w-8 text-gray-800" />
                </div>
                <h1 className="text-4xl font-bold">TechStaffHub</h1>
              </div>
              <h2 className="text-2xl font-semibold">Streamlined Workforce Management</h2>
              <p className="text-gray-700">
                Our employee portal provides secure access to all your work tools, schedules, and resources in one
                convenient location.
              </p>
              <div className="pt-4"><div className="h-1 w-24 bg-gray-800/30"></div></div>
            </div>
          </div>

          <div className="w-full bg-white p-8 md:w-1/2 md:p-0">
            <div className="mx-auto max-w-md h-full flex flex-col justify-center p-8 md:p-12">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#8b1e3f]">Employee Login</h2>
                <div className="h-1 w-16 bg-[#8b1e3f] mt-2 mb-4"></div>
                <p className="text-gray-600">Enter your credentials to access your account</p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6 border-l-4 border-red-600 bg-red-50 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 w-10 h-full flex items-center justify-center border-r border-gray-200 bg-gray-50 rounded-l-md">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="username"
                      type="text"
                      placeholder="username.EMPLOYEE"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-12 h-11 border-gray-200 focus:border-[#8b1e3f] focus:ring-[#8b1e3f]/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 w-10 h-full flex items-center justify-center border-r border-gray-200 bg-gray-50 rounded-l-md">
                      <Lock className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-12 h-11 border-gray-200 focus:border-[#8b1e3f] focus:ring-[#8b1e3f]/10 transition-all"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-[#8b1e3f]"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <div className="relative inline-flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#8b1e3f] focus:ring-[#8b1e3f]/20"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                  </div>

                  <div className="text-sm">
                    <a 
                      href="/ForgotPassword" 
                      onClick={handleForgotPassword} 
                      className="font-medium text-[#8b1e3f] hover:text-[#8b1e3f]/80 transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 mt-4 bg-[#8b1e3f] hover:bg-[#8b1e3f]/90 transition-colors shadow-md cursor-pointer hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm">
                <p>
                  HR Personnel?{" "}
                  <a href="/hr" onClick={handleHRLogin} className="font-medium text-[#8b1e3f] hover:text-[#8b1e3f]/80 transition-colors">
                    Login as HR
                  </a>
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">© {new Date().getFullYear()} TechStaffHub. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}