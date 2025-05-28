import { useState, useEffect } from "react"
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  Activity,
  AlertCircle,
} from "lucide-react"
import { MainNav } from "../components/dashboard/MainNav"
import { UserNav } from "../components/dashboard/UserNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format, parseISO } from "date-fns"
import LoadingSpinner from "../components/ui/LoadingSpinner"

const EmployeeAttendance = () => {
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1))

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication token not found")
        }

        const response = await fetch("http://localhost:8080/employee/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to load employee data")
        }

        const data = await response.json()
        setEmployee({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        })
      } catch (err) {
        console.error("Error fetching employee data:", err)
      }
    }

    fetchEmployeeData()
  }, [])

  const fetchAttendanceData = async (year, month) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`http://localhost:8080/employee/attendance?year=${year}&month=${month}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data")
      }

      const data = await response.json()
      setAttendanceData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceData(currentDate.getFullYear(), currentDate.getMonth() + 1)
  }, [currentDate])

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const renderCalendar = () => {
    if (!attendanceData) return null

    const today = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const weeks = []
    let day = 1

    for (let i = 0; i < 6; i++) {
      if (day > daysInMonth) break

      const days = []
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startingDay) || day > daysInMonth) {
          days.push(
            <td key={j} className="p-2 h-24 border border-muted/20">
              <div className="w-full h-full"></div>
            </td>,
          )
        } else {
          const currentDate = new Date(year, month, day)
          const dateStr = format(currentDate, "yyyy-MM-dd")

          const record = attendanceData.attendance[dateStr]

          const isPast = currentDate < today.setHours(0, 0, 0, 0)
          const status = record?.status || (isPast ? "A" : null)

          const rawTimeIn = record?.timeIn
          const rawTimeOut = record?.timeOut

          const timeIn = rawTimeIn ? format(parseISO(rawTimeIn), "hh:mm a") : "-"
          const timeOut = rawTimeOut ? format(parseISO(rawTimeOut), "hh:mm a") : "-"

          const isToday = currentDate.toDateString() === new Date().toDateString()

          days.push(
            <td key={j} className="p-2 h-24 border border-muted/20 hover:bg-muted/30 transition-colors">
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isToday ? "text-primary font-bold" : "text-foreground"}`}>
                    {day}
                  </span>
                  {status && (
                    <Badge
                      variant={status === "P" ? "default" : "destructive"}
                      className={`text-xs px-1.5 py-0.5 ${
                        status === "P"
                          ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
                      }`}
                    >
                      {status === "P" ? "Present" : "Absent"}
                    </Badge>
                  )}
                </div>
                {status === "P" && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">In:</span> {timeIn}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Out:</span> {timeOut}
                    </div>
                  </div>
                )}
                {isToday && <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1"></div>}
              </div>
            </td>,
          )
          day++
        }
      }
      weeks.push(<tr key={i}>{days}</tr>)
    }

    return weeks
  }

  if (loading) {
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

  const presentDays = attendanceData
    ? Object.values(attendanceData.attendance).filter((v) => v.status === "P").length
    : 0
  const absentDays = attendanceData
    ? Object.values(attendanceData.attendance).filter((v) => v.status === "A").length
    : 0
  const totalDays = presentDays + absentDays
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

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
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
                <p className="text-muted-foreground">View your attendance records and calendar</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" onClick={() => (window.location.href = "/TimeTracking")}>
                <Clock className="h-4 w-4 mr-2" />
                Time Tracking
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/TimeLogs")}>
                <Activity className="h-4 w-4 mr-2" />
                Time Logs
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Present Days</CardTitle>
                <CalendarDays className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{presentDays}</div>
                <p className="text-xs text-muted-foreground">days attended</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Absent Days</CardTitle>
                <CalendarDays className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{absentDays}</div>
                <p className="text-xs text-muted-foreground">days missed</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{attendanceRate}%</div>
                <p className="text-xs text-muted-foreground">overall rate</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{format(currentDate, "MMM")}</div>
                <p className="text-xs text-muted-foreground">{format(currentDate, "yyyy")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Card */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Attendance Calendar
                  </CardTitle>
                  <CardDescription>
                    Monthly view of your attendance records for {format(currentDate, "MMMM yyyy")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date(2025, 4, 1))}
                    className="whitespace-nowrap"
                  >
                    Current Month
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Calendar */}
                <div className="rounded-lg border bg-white overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                          <th
                            key={day}
                            className="p-4 text-center text-sm font-semibold text-muted-foreground border-r border-muted/20 last:border-r-0"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>{renderCalendar()}</tbody>
                  </table>
                </div>

                <Separator />

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Present</Badge>
                    <span className="text-sm text-muted-foreground">Attended work</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                      Absent
                    </Badge>
                    <span className="text-sm text-muted-foreground">Did not attend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Today</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Monthly Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Days:</span>
                      <span className="ml-2 font-medium">{totalDays}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Present:</span>
                      <span className="ml-2 font-medium text-green-600">{presentDays}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Absent:</span>
                      <span className="ml-2 font-medium text-red-600">{absentDays}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="ml-2 font-medium text-primary">{attendanceRate}%</span>
                    </div>
                  </div>
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

export default EmployeeAttendance
