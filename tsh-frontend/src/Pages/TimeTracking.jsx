import { useState, useEffect } from "react"
import { Clock, ArrowRight, Play, Square, Calendar, Timer, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react"
import { MainNav } from "../components/dashboard/MainNav"
import { UserNav } from "../components/dashboard/UserNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import LoadingSpinner from "../components/ui/LoadingSpinner"

const API_BASE_URL = "http://localhost:8080/api/time-logs"

const getToken = () => {
  return localStorage.getItem("token")
}

const userData = {
  username: localStorage.getItem("username") || "",
}

const callApi = async (endpoint, method = "GET", body = null) => {
  const token = getToken()

  if (!token) {
    throw new Error("Not authenticated")
  }

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options)

  if (!response.ok) {
    const text = await response.text()
    console.error("API error response:", response.status, text)
    throw new Error(`API request failed: ${response.status}`)
  }

  try {
    const text = await response.text()
    return JSON.parse(text)
  } catch (e) {
    if (endpoint === "/time-in") {
      const status = await getCurrentStatus()
      const logs = await getTodayLogs()
      return { success: true }
    }

    if (endpoint === "/time-out") {
      const status = await getCurrentStatus()
      const logs = await getTodayLogs()
      return { success: true }
    }

    return { success: true }
  }
}

async function getCurrentStatus() {
  return callApi("/status")
}

async function getTodayLogs() {
  return callApi("/today")
}

async function timeIn() {
  return callApi("/time-in", "POST")
}

async function timeOut() {
  return callApi("/time-out", "POST")
}

export default function TimeTracking() {
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [timeStatus, setTimeStatus] = useState({
    isTimedIn: false,
    timeIn: null,
    timeOut: null,
  })

  const [timeRecords, setTimeRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchEmployeeData = async () => {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        const response = await fetch("http://localhost:8080/employee/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to load employee data");
        }

        const data = await response.json();
        setEmployee({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          ...data,
        });
    };

    setIsAuthenticated(true)
    fetchEmployeeData();
  }, [])

  const loadData = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)

      const status = await getCurrentStatus()
      setTimeStatus(status)

      const logs = await getTodayLogs()
      console.log("Today's logs:", logs)
      setTimeRecords(logs)

      setError(null)

      const normalizedLogs = Array.isArray(logs)
        ? logs.map((log) => ({
            id: log.timeLogId,
            timeIn: log.timeIn,
            timeOut: log.timeOut,
          }))
        : []

      console.log("Today's logs (normalized):", normalizedLogs)
      setTimeRecords(normalizedLogs)
    } catch (err) {
      setError("Failed to load data. Please try again.")
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadData()

      const intervalId = setInterval(() => {
        loadData()
      }, 300000)

      return () => clearInterval(intervalId)
    }
  }, [isAuthenticated])

  const handleTimeIn = async () => {
    try {
      setLoading(true)
      await timeIn()

      await loadData()
      setError(null)
    } catch (error) {
      console.error("Time in error:", error)
      setError("Failed to time in. Please try again.")
      try {
        await loadData()
      } catch (e) {}
    } finally {
      setLoading(false)
    }
  }

  const handleTimeOut = async () => {
    try {
      setLoading(true)
      await timeOut()

      await loadData()
      setError(null)
    } catch (error) {
      console.error("Time out error:", error)
      setError("Failed to time out. Please try again.")
      try {
        await loadData()
      } catch (e) {}
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return "---"
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const calculateDuration = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return "---"

    const start = new Date(timeIn)
    const end = new Date(timeOut)
    const diffMs = end - start
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${diffHrs}h ${diffMins}m`
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">Please log in to access time tracking features.</p>
            <Button onClick={() => (window.location.href = "/")} className="w-full">
              Go to Login
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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Timer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
                <p className="text-muted-foreground">Track your working hours and manage attendance</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" onClick={() => (window.location.href = "/TimeLogs")}>
                <Calendar className="mr-2 h-4 w-4" />
                View All Logs
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Time Tracking Card */}
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Clock
                </CardTitle>
                <CardDescription>Record your daily attendance with precision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Date and Time Display */}
                <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {currentTime.toLocaleDateString([], {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-4xl font-mono font-bold text-primary">
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    onClick={handleTimeIn}
                    disabled={timeStatus.isTimedIn || loading}
                    className="h-16 bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Time In
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleTimeOut}
                    disabled={!timeStatus.isTimedIn || loading}
                    className="h-16 bg-red-600 hover:bg-red-700 text-white font-semibold"
                  >
                    <Square className="mr-2 h-5 w-5" />
                    Time Out
                  </Button>
                </div>

                <Separator />

                {/* Current Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          timeStatus.isTimedIn ? "bg-green-500 animate-pulse" : "bg-gray-300"
                        }`}
                      />
                      <span className="font-medium">
                        {timeStatus.isTimedIn ? "Currently Clocked In" : "Currently Clocked Out"}
                      </span>
                    </div>
                    {timeStatus.isTimedIn && (
                      <Badge variant="secondary" className="ml-auto">
                        Active
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Time In</div>
                      <div className="font-mono font-semibold">{formatTime(timeStatus.timeIn)}</div>
                    </div>
                    <div className="text-center flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Time Out</div>
                      <div className="font-mono font-semibold">{formatTime(timeStatus.timeOut)}</div>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Session Duration</div>
                    <div className="text-lg font-bold text-primary">
                      {calculateDuration(timeStatus.timeIn, timeStatus.timeOut)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Records Card */}
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Today's Records
                </CardTitle>
                <CardDescription>Your time entries for {currentTime.toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-40 items-center justify-center">
                    <LoadingSpinner size="8" text="Loading records..." />
                  </div>
                ) : timeRecords.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-muted">
                    <div className="text-center">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No time records for today</p>
                      <p className="text-sm text-muted-foreground">Clock in to start tracking your time</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeRecords.map((record, index) => (
                      <div
                        key={record.id || `record-${index}`}
                        className="p-4 rounded-lg border bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Session {index + 1}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {record.timeOut ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-xs text-green-600 font-medium mb-1">Time In</div>
                            <div className="font-mono text-sm">{formatTime(record.timeIn)}</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded">
                            <div className="text-xs text-red-600 font-medium mb-1">Time Out</div>
                            <div className="font-mono text-sm">{formatTime(record.timeOut)}</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-xs text-blue-600 font-medium mb-1">Duration</div>
                            <div className="font-mono text-sm font-semibold">
                              {calculateDuration(record.timeIn, record.timeOut)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
