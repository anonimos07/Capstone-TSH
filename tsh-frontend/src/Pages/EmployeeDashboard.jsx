import { useState, useEffect } from "react"
import {
  DollarSign,
  CalendarDays,
  FileText,
  PieChart,
  UserCheck,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  Activity,
  Calendar,
  Timer,
  Users,
  AlertCircle,
} from "lucide-react"
import { MainNav } from "../components/dashboard/MainNav"
import { UserNav } from "../components/dashboard/UserNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import LoadingSpinner from "../components/ui/LoadingSpinner"

// Utility functions
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const getDaysBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const StatusBadge = ({ status }) => {
  const variants = {
    APPROVED: "bg-green-100 text-green-800 border-green-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  }

  return (
    <Badge variant="outline" className={`${variants[status]} font-medium`}>
      {status}
    </Badge>
  )
}

const LeaveRequestCard = ({ request, onClick }) => (
  <Card
    key={request.id}
    className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-foreground">{request.leaveType} Leave</h4>
            <StatusBadge status={request.status} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                <span className="ml-2 font-medium">
                  ({getDaysBetweenDates(request.startDate, request.endDate)} days)
                </span>
              </span>
            </div>
            <div className="text-sm text-left">
              <span className="font-medium text-muted-foreground">Reason:</span>
              <span className="ml-2 text-foreground">{request.reason}</span>
            </div>
            {request.assignedHR && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>
                  Assigned to: {request.assignedHR.firstName} {request.assignedHR.lastName}
                </span>
              </div>
            )}
          </div>
        </div>
        {request.status === "PENDING" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
)

function OverviewCard({ title, value, description, icon: Icon, className, onClick }) {
  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer group ${className || ""}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{value}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {Icon && (
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getPhilippineHolidays(year) {
  const fixedHolidays = [
    { date: new Date(year, 0, 1), name: "New Year's Day" },
    { date: new Date(year, 3, 9), name: "Araw ng Kagitingan" },
    { date: new Date(year, 4, 1), name: "Labor Day" },
    { date: new Date(year, 5, 12), name: "Independence Day" },
    { date: new Date(year, 7, 21), name: "Ninoy Aquino Day" },
    { date: new Date(year, 7, 26), name: "National Heroes Day" },
    { date: new Date(year, 10, 30), name: "Bonifacio Day" },
    { date: new Date(year, 11, 25), name: "Christmas Day" },
    { date: new Date(year, 11, 30), name: "Rizal Day" },
  ]

  const easter = calculateEaster(year)
  const goodFriday = new Date(easter)
  goodFriday.setDate(easter.getDate() - 2)

  const movableHolidays = [
    { date: goodFriday, name: "Good Friday" },
    { date: new Date(year, 11, 8), name: "Feast of the Immaculate Conception" },
    { date: new Date(year, 11, 31), name: "New Year's Eve" },
  ]

  const specialDays = [
    { date: new Date(year, 0, 2), name: "Special Non-Working Day" },
    { date: new Date(year, 3, 10), name: "Eid'l Fitr" },
    { date: new Date(year, 5, 28), name: "Eid'l Adha" },
    { date: new Date(year, 10, 1), name: "All Saints' Day" },
    { date: new Date(year, 11, 24), name: "Christmas Eve" },
  ]

  return [...fixedHolidays, ...movableHolidays, ...specialDays].sort((a, b) => a.date - b.date)
}

function calculateEaster(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1

  return new Date(year, month, day)
}

function HolidaysCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [holidays, setHolidays] = useState([])

  useEffect(() => {
    const phHolidays = getPhilippineHolidays(currentYear)
    setHolidays(phHolidays)
  }, [currentYear])

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day)
      const holiday = holidays.find(
        (h) => h.date.getDate() === day && h.date.getMonth() === currentMonth && h.date.getFullYear() === currentYear,
      )

      const isToday =
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() &&
        currentYear === new Date().getFullYear()

      days.push(
        <div
          key={`day-${day}`}
          className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm relative transition-colors
            ${holiday ? "bg-red-100 text-red-700 font-medium hover:bg-red-200" : "hover:bg-muted"}
            ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}
          `}
          title={holiday ? holiday.name : ""}
        >
          {day}
          {holiday && <div className="absolute -bottom-1 w-1 h-1 bg-red-500 rounded-full"></div>}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-lg">
          {months[currentMonth]} {currentYear}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Upcoming Holidays
        </h4>
        <div className="space-y-2">
          {holidays
            .filter((h) => h.date >= new Date())
            .slice(0, 3)
            .map((holiday) => (
              <div key={holiday.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {holiday.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div className="text-xs text-muted-foreground">{holiday.name}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveRequestsLoading, setLeaveRequestsLoading] = useState(false)
  const [leaveRequestsError, setLeaveRequestsError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [sortField, setSortField] = useState("startDate")
  const [sortDirection, setSortDirection] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true)
        setError(null)

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
          ...data,
        })

        await fetchLeaveRequests()
      } catch (err) {
        setError(err.message || "An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployeeData()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      setLeaveRequestsLoading(true)
      setLeaveRequestsError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("http://localhost:8080/employee/leave-requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch leave requests")
      }

      const data = await response.json()
      setLeaveRequests(data)
    } catch (err) {
      setLeaveRequestsError(err.message)
    } finally {
      setLeaveRequestsLoading(false)
    }
  }

  const filteredRequests = leaveRequests.filter((request) => filterStatus === "ALL" || request.status === filterStatus)

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const fieldA = a[sortField]
    const fieldB = b[sortField]

    if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
    if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedRequests.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
              <MainNav userType="employee" />
            </div>
            <UserNav userName="" userEmail="" />
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
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fullName = `${employee.firstName} ${employee.lastName}`

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
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Employee Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={() => (window.location.href = "/LeaveRequest")}>
                <Plus className="mr-2 h-4 w-4" />
                Request Leave
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <OverviewCard
                  title="Time Tracking"
                  value="Clock In/Out"
                  description="Log your daily check-in and check-out times"
                  icon={Timer}
                  onClick={() => (window.location.href = "/TimeTracking")}
                />
                <OverviewCard
                  title="Time Logs"
                  value="View History"
                  description="Browse through your time tracking records"
                  icon={FileText}
                  onClick={() => (window.location.href = "/TimeLogs")}
                />
                <OverviewCard
                  title="Attendance"
                  value="View Records"
                  description="Check your attendance records"
                  icon={UserCheck}
                  onClick={() => (window.location.href = "/EmployeeAttendance")}
                />
                <OverviewCard
                  title="Payslips"
                  value="Export Payslips"
                  description="View and export your payslips"
                  icon={DollarSign}
                  onClick={() => (window.location.href = "/EmployeePayslip")}
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid gap-6 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="lg:col-span-4 bg-white/80 backdrop-blur border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your recent activities and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <div className="text-center">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Holidays Calendar */}
                <Card className="lg:col-span-3 bg-white/80 backdrop-blur border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Holidays Calendar
                    </CardTitle>
                    <CardDescription>Philippine holidays and special non-working days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HolidaysCalendar />
                  </CardContent>
                </Card>

                {/* Leave Requests */}
                <Card className="lg:col-span-7 bg-white/80 backdrop-blur border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          My Leave Requests
                        </CardTitle>
                        <CardDescription>Your recent and upcoming leave requests</CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                          <Filter className="h-4 w-4 mr-2" />
                          Filters
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchLeaveRequests}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                        <Button size="sm" onClick={() => (window.location.href = "/LeaveRequest")}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Request
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {showFilters && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Status</label>
                              <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ALL">All Statuses</SelectItem>
                                  <SelectItem value="PENDING">Pending</SelectItem>
                                  <SelectItem value="APPROVED">Approved</SelectItem>
                                  <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Sort By</label>
                              <Select value={sortField} onValueChange={setSortField}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="startDate">Start Date</SelectItem>
                                  <SelectItem value="endDate">End Date</SelectItem>
                                  <SelectItem value="leaveType">Leave Type</SelectItem>
                                  <SelectItem value="status">Status</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Order</label>
                              <Select value={sortDirection} onValueChange={setSortDirection}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="desc">Newest First</SelectItem>
                                  <SelectItem value="asc">Oldest First</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {leaveRequestsLoading ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="8" text="Loading leave requests..." />
                      </div>
                    ) : leaveRequestsError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Error: {leaveRequestsError}
                          <Button variant="outline" size="sm" className="ml-2" onClick={fetchLeaveRequests}>
                            Retry
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : sortedRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No leave requests found</h3>
                        <p className="text-muted-foreground mb-4">Get started by creating your first leave request</p>
                        <Button onClick={() => (window.location.href = "/LeaveRequest")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Request
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentItems.map((request) => (
                          <LeaveRequestCard key={request.id} request={request} onClick={() => {}} />
                        ))}

                        {totalPages > 1 && (
                          <div className="flex justify-between items-center pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(currentPage - 1)}
                            >
                              <ChevronLeft className="h-4 w-4 mr-2" />
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(currentPage + 1)}
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
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
