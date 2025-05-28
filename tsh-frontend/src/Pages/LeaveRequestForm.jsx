import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, ArrowLeft, User, Clock, FileText, AlertCircle, Loader2 } from "lucide-react"
import { MainNav } from "../components/dashboard/MainNav"
import { UserNav } from "../components/dashboard/UserNav"

export default function LeaveRequestForm() {
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    leaveType: "ANNUAL",
    reason: "",
    hrId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [hrList, setHrList] = useState([])
  const [loadingHr, setLoadingHr] = useState(true)

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : ""

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          throw new Error("Authentication token not found. Please log in again.")
        }

        const response = await fetch("http://localhost:8080/employee/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to load employee data")
        }

        const data = await response.json()
        setEmployee({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        })
      } catch (error) {
        console.error("Error fetching employee data:", error)
        setError(error.message)
      }
    }

    const fetchHrList = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication token not found")
        }

        const response = await fetch("http://localhost:8080/employee/available-hr", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch HR list")
        }

        const data = await response.json()
        setHrList(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingHr(false)
      }
    }

    fetchEmployeeData()
    fetchHrList()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("http://localhost:8080/employee/leave-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit leave request")
      }

      const result = await response.json()
      alert("Leave request submitted successfully!")
      navigate("/EmployeeDashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const leaveTypeOptions = [
    { value: "ANNUAL", label: "Annual Leave" },
    { value: "SICK", label: "Sick Leave" },
    { value: "MATERNITY", label: "Maternity Leave" },
    { value: "PATERNITY", label: "Paternity Leave" },
    { value: "UNPAID", label: "Unpaid Leave" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <MainNav userType="employee" />
          </div>
          <UserNav userName={fullName} userEmail={employee.email} />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Leave Request</h1>
              <p className="text-muted-foreground">Submit a new leave request for approval</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5" />
              Request Details
            </CardTitle>
            <CardDescription>Please fill out all required fields to submit your leave request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* HR Assignment Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Assignment</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hrId" className="text-sm font-medium">
                    Assign to HR Representative *
                  </Label>
                  {loadingHr ? (
                    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading HR representatives...</span>
                    </div>
                  ) : (
                    <Select value={formData.hrId} onValueChange={(value) => handleSelectChange("hrId", value)} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an HR representative" />
                      </SelectTrigger>
                      <SelectContent>
                        {hrList.map((hr) => (
                          <SelectItem key={hr.hrId} value={hr.hrId}>
                            {hr.firstName} {hr.lastName} ({hr.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <Separator />

              {/* Leave Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Leave Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType" className="text-sm font-medium">
                      Leave Type *
                    </Label>
                    <Select
                      value={formData.leaveType}
                      onValueChange={(value) => handleSelectChange("leaveType", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium">
                      Start Date *
                    </Label>
                    <Input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      End Date *
                    </Label>
                    <Input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      min={formData.startDate || new Date().toISOString().split("T")[0]}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-sm font-medium">
                    Reason for Leave *
                  </Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows={4}
                    required
                    placeholder="Please provide a detailed reason for your leave request..."
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a clear and detailed explanation for your leave request
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/EmployeeDashboard")}
                  disabled={isSubmitting}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    "Submit Leave Request"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
