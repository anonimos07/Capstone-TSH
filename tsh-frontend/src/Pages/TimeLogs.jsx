import { useState, useEffect } from "react"
import { Calendar, Clock, Download, User, TrendingUp, BarChart3, FileText, AlertCircle } from "lucide-react"
import { MainNav } from "../components/dashboard/MainNav"
import { UserNav } from "../components/dashboard/UserNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

function AssignHrButton({ log, onAssign }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedHr, setSelectedHr] = useState(null)
  const [hrList, setHrList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHrList = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8080/employee/available-hr", {
        headers: {
          Authorization: `Bearer ${token}`,
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
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `http://localhost:8080/api/time-logs/assign-hr/${log.timeLogId}?hrId=${selectedHr}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to assign HR")
      }

      // Show success notification
      const assignedHr = hrList.find((hr) => hr.hrId === selectedHr)
      const hrName = assignedHr ? `${assignedHr.firstName} ${assignedHr.lastName}` : "HR"

      // Create and show success popup
      const successDialog = document.createElement("div")
      successDialog.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      successDialog.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg">HR Assigned</h3>
              <p class="text-sm text-gray-600">${hrName} has been assigned successfully</p>
            </div>
          </div>
          <button class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors" onclick="this.parentElement.parentElement.remove()">
            OK
          </button>
        </div>
      `
      document.body.appendChild(successDialog)

      // Auto-remove after 3 seconds
      setTimeout(() => {
        if (document.body.contains(successDialog)) {
          document.body.removeChild(successDialog)
        }
      }, 3000)

      onAssign()
      setIsOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          fetchHrList()
          setIsOpen(true)
        }}
        variant="ghost"
        size="sm"
        disabled={loading}
        className="text-primary hover:text-primary/80"
      >
        {loading ? "Loading..." : "Assign HR"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Assign HR to Time Log
            </DialogTitle>
          </DialogHeader>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid gap-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="hrSelect">HR Representative</Label>
                <Select value={selectedHr || ""} onValueChange={setSelectedHr} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an HR representative" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrList.map((hr) => (
                      <SelectItem key={hr.hrId} value={hr.hrId}>
                        {hr.firstName} {hr.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedHr || loading}>
              {loading ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function TimeLogs() {
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getAuthToken = () => {
    return localStorage.getItem("token")
  }

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Fetch user profile
      const profileResponse = await fetch("http://localhost:8080/employee/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch profile")
      }

      const profileData = await profileResponse.json()
      setEmployee({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      })

      const logsResponse = await fetch("http://localhost:8080/api/time-logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!logsResponse.ok) {
        throw new Error("Failed to fetch time logs")
      }

      const logsData = await logsResponse.json()
      setLogs(logsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const filteredLogs = logs.filter((log) => {
    // Convert search term to lowercase for case-insensitive search
    const searchTermLower = searchTerm.toLowerCase()

    // Check if any field matches the search term
    const matchesSearch =
      searchTerm === "" ||
      (log.date && log.date.toLowerCase().includes(searchTermLower)) ||
      (log.timeIn && formatTime(log.timeIn).toLowerCase().includes(searchTermLower)) ||
      (log.timeOut && formatTime(log.timeOut).toLowerCase().includes(searchTermLower)) ||
      (log.durationMinutes && (log.durationMinutes / 60).toFixed(1).includes(searchTerm))

    // Check if date matches the date filter
    const matchesDate = dateFilter === "" || (log.date && log.date.includes(dateFilter))

    return matchesSearch && matchesDate
  })

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (isoString) => {
    if (!isoString) return ""
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const calculateTotalHours = () => {
    return (filteredLogs.reduce((total, log) => total + (log.durationMinutes || 0), 0) / 60).toFixed(1)
  }

  const calculateAverageHours = () => {
    if (filteredLogs.length === 0) return "0.0"
    return (
      filteredLogs.reduce((total, log) => total + (log.durationMinutes || 0), 0) /
      filteredLogs.length /
      60
    ).toFixed(1)
  }

  const exportToCSV = () => {
    let csvContent = "Date,Time In,Time Out,Total Hours\n"

    filteredLogs.forEach((log) => {
      const date = `"${formatDate(log.date)}"`
      const timeIn = `"${formatTime(log.timeIn)}"`
      const timeOut = `"${formatTime(log.timeOut)}"`
      const totalHours = `"${(log.durationMinutes / 60).toFixed(1)} hrs"`

      csvContent += `${date},${timeIn},${timeOut},${totalHours}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "attendance_logs.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAssignHr = async () => {
    try {
      setIsRefreshing(true)
      await fetchUserData()
    } catch (err) {
      setError(err.message)
    }
  }

  const fullName = `${employee.firstName} ${employee.lastName}`

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
              <MainNav userType="employee" />
            </div>
            <UserNav userName={fullName} userEmail={employee.email} />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => (window.location.href = "/login")} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <MainNav userType="employee" />
          </div>
          <UserNav userName={fullName} userEmail={employee.email} />
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Attendance Logs</h1>
                <p className="text-muted-foreground">View and manage your attendance records</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" onClick={() => (window.location.href = "/TimeTracking")}>
                <Clock className="mr-2 h-4 w-4" />
                Time In/Out
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredLogs.length}</div>
                <p className="text-xs text-muted-foreground">attendance entries</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateTotalHours()}</div>
                <p className="text-xs text-muted-foreground">hours worked</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Hours/Day</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateAverageHours()}</div>
                <p className="text-xs text-muted-foreground">daily average</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Card */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Attendance Records
                  </CardTitle>
                  <CardDescription>Your complete attendance history and time tracking data</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-8 w-full sm:w-auto"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      placeholder="Filter by date"
                    />
                  </div>
                  {dateFilter && (
                    <Button variant="outline" size="sm" onClick={() => setDateFilter("")} className="whitespace-nowrap">
                      Clear Filter
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Table */}
                <div className="rounded-lg border bg-white">
                  {isRefreshing ? (
                    <LoadingSpinner />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Time In</TableHead>
                          <TableHead className="font-semibold">Time Out</TableHead>
                          <TableHead className="font-semibold">Total Hours</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <Clock className="h-8 w-8 text-muted-foreground/50" />
                                <p>No attendance records found</p>
                                {dateFilter && <p className="text-sm">Try adjusting your date filter</p>}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLogs.map((log) => (
                            <TableRow key={log.timeLogId} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium">{formatDate(log.date)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  {formatTime(log.timeIn)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  {formatTime(log.timeOut)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="font-semibold">
                                  {((log.durationMinutes || 0) / 60).toFixed(1)} hrs
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <AssignHrButton log={log} onAssign={handleAssignHr} />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <Separator />

                {/* Export Section */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredLogs.length} of {logs.length} records
                  </p>
                  <Button
                    variant="outline"
                    onClick={exportToCSV}
                    disabled={filteredLogs.length === 0 || isRefreshing}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isRefreshing ? "Processing..." : "Export CSV"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TechStaffHub. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">Developed by TechStaffHub</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
