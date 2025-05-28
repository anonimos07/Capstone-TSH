import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { HrNav } from "../components/dashboard/HrNav"
import { HrUser } from "../components/dashboard/HrUser"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, Briefcase, Edit, Save, Key, AlertCircle, Loader2, Calendar, Shield } from "lucide-react"

const HrProfile = () => {
  const [hr, setHr] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    contact: "",
    position: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const navigate = useNavigate()
  const [profilePicture, setProfilePicture] = useState(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const fileInputRef = useRef(null)

  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  useEffect(() => {
    const fetchHrData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        console.log("Token:", token)

        if (!token) {
          throw new Error("Authentication token not found. Please log in again.")
        }

        const response = await fetch("http://localhost:8080/hr/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const responseClone = response.clone()
          let errorMessage = `Server error: ${response.status}`

          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch (e) {
            try {
              const text = await responseClone.text()
              if (text) errorMessage += ` - ${text}`
            } catch (textError) {
              console.error("Failed to read response body", textError)
            }
          }

          if (response.status === 401) {
            localStorage.removeItem("token")
            navigate("/unauthorized")
            return
          } else if (response.status === 403) {
            navigate("/403")
            return
          }

          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log("API Response:", data)
        setHr({
          username: data.username || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          role: data.role || "",
          contact: data.contact || "",
          position: data.position || "",
        })
      } catch (err) {
        console.error("Unexpected error:", err)
        setError(err.message || "An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHrData()
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setHr((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const fullName = `${hr.firstName} ${hr.lastName}`

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
              <HrNav userType="hr" />
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </header>
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Loading profile...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
              <HrNav userType="hr" />
            </div>
          </div>
        </header>
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <HrNav userType="hr" />
          </div>
          <HrUser userName={fullName} userEmail={hr.email} />
        </div>
      </header>
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your personal information and account settings</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">HR Profile</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" className="inline-flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Change Password
                  </Button>
                  <Button onClick={() => setIsEditMode(!isEditMode)} className="inline-flex items-center gap-2">
                    {isEditMode ? (
                      <>
                        <Save className="h-4 w-4" />
                        Save Profile
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Profile Header */}
              <div className="flex items-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full mr-6 flex items-center justify-center overflow-hidden bg-gray-200 cursor-pointer border-4 border-white shadow-lg hover:shadow-xl transition-shadow"
                    onClick={handleProfilePictureClick}
                  >
                    {profilePicture ? (
                      <img
                        src={profilePicture || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-500" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {hr.firstName} {hr.lastName}
                  </h2>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="inline-flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {hr.position}
                    </Badge>
                    <Badge variant="outline" className="inline-flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {hr.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {hr.email}
                    </div>
                    {hr.contact && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {hr.contact}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                        Username
                      </Label>
                      <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {hr.username}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={hr.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={hr.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={hr.email}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
                        Contact Number
                      </Label>
                      <Input
                        id="contact"
                        name="contact"
                        value={hr.contact}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TechStaffHub. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-500">Developed by TechStaffHub</p>
        </div>
      </footer>
    </div>
  )
}

export default HrProfile
