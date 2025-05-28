import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { HrNav } from "../components/dashboard/HrNav"
import { HrUser } from "../components/dashboard/HrUser"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft, FileText } from "lucide-react"

export default function HrLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [hr, setHr] = useState({
    firstName: "",
    lastName: "",
    email: "",
    hrId: null,
  })
  const navigate = useNavigate()

  const fullName = hr ? `${hr.firstName} ${hr.lastName}` : ""

  useEffect(() => {
    const fetchHrProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication token not found")
        }

        const profileResponse = await fetch("http://localhost:8080/hr/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch HR profile")
        }

        const profileData = await profileResponse.json()
        setHr({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || "",
          hrId: profileData.hrId,
        })

        const leaveResponse = await fetch(`http://localhost:8080/hr/pending-leave-requests/${profileData.hrId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!leaveResponse.ok) {
          throw new Error("Failed to fetch leave requests")
        }

        const leaveData = await leaveResponse.json()
        setLeaveRequests(leaveData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHrProfile()
  }, [])

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/hr/approve-leave/${requestId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to approve leave request")
      }

      setLeaveRequests(leaveRequests.filter((request) => request.id !== requestId))
      alert("Leave request approved successfully")
    } catch (err) {
      alert(err.message)
    }
  }

  const handleReject = async (requestId) => {
    if (!rejectionReason) {
      alert("Please provide a rejection reason")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/hr/reject-leave/${requestId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject leave request")
      }

      setLeaveRequests(leaveRequests.filter((request) => request.id !== requestId))
      setRejectionReason("")
      alert("Leave request rejected successfully")
    } catch (err) {
      alert(err.message)
    }
  }

  const getLeaveTypeBadge = (leaveType) => {
    const variants = {
      "Sick Leave": "destructive",
      "Annual Leave": "default",
      "Personal Leave": "secondary",
      "Emergency Leave": "destructive",
      "Maternity Leave": "default",
      "Paternity Leave": "default",
    }
    return variants[leaveType] || "outline"
  }

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
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
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leave Requests</h1>
              <p className="mt-1 text-sm text-gray-500">Review and manage employee leave requests</p>
            </div>
            <div className="flex items-center gap-4">
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
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Pending Leave Requests</CardTitle>
                  <CardDescription>All pending leave requests from employees</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">
                    {loading ? "Loading..." : `${leaveRequests.length} requests`}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Loading leave requests...</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-sm text-gray-500">All leave requests have been processed</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-medium">Employee</TableHead>
                        <TableHead className="font-medium">Leave Type</TableHead>
                        <TableHead className="font-medium">Duration</TableHead>
                        <TableHead className="font-medium">Start Date</TableHead>
                        <TableHead className="font-medium">End Date</TableHead>
                        <TableHead className="font-medium">Reason</TableHead>
                        <TableHead className="font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                {request.employee?.firstName} {request.employee?.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getLeaveTypeBadge(request.leaveType)}>{request.leaveType}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {calculateDuration(request.startDate, request.endDate)} days
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate" title={request.reason}>
                              {request.reason}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Approve
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder="Rejection reason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  className="text-xs h-8 w-32"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(request.id)}
                                  className="inline-flex items-center gap-1"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
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
