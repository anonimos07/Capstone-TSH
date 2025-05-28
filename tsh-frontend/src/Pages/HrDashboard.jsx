import { useState, useEffect } from "react"
import {
  CalendarDays,
  Clock,
  FileText,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  DollarSign,
  Calendar,
  Activity,
  AlertCircle,
  Plus,
  ClipboardList,
  Briefcase,
  User,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { HrNav } from "../components/dashboard/HrNav"
import { HrUser } from "../components/dashboard/HrUser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import LoadingSpinner from "../components/ui/LoadingSpinner"

function Progress({ value, className }) {
  return (
    <div className={`w-full bg-muted rounded-full h-2 ${className || ""}`}>
      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${value}%` }}></div>
    </div>
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

function AttendanceOverview() {
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:8080/hr/attendance-overview", {
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

    fetchAttendanceData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!attendanceData) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <div className="text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No attendance data available</p>
        </div>
      </div>
    )
  }

  const attendancePercentage =
    attendanceData.totalEmployees > 0
      ? Math.round((attendanceData.totalPresentDays / (attendanceData.totalEmployees * 30)) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">active employees</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Days (30 days)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.totalPresentDays}</div>
            <p className="text-xs text-muted-foreground">days present</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Hours/Day</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.averageHoursPerDay} hrs</div>
            <p className="text-xs text-muted-foreground">daily average</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Overall attendance rate</span>
            <span className="text-sm font-medium">{attendancePercentage}%</span>
          </div>
          <Progress value={attendancePercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Worked Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(attendanceData.totalWorkedMinutes / 60)} hours</div>
          <p className="text-xs text-muted-foreground">across all employees</p>
        </CardContent>
      </Card>

      <AttendanceCalendar />
    </div>
  )
}

function AttendanceCalendar() {
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    employee: "",
    month: new Date().getMonth() + 1,
    year: 2025,
    status: "",
  })
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        const empResponse = await fetch("http://localhost:8080/hr/all-employee", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const empData = await empResponse.json()
        setEmployees(empData)

        const params = new URLSearchParams()
        if (filters.employee) params.append("employeeId", filters.employee)
        if (filters.month) params.append("month", filters.month)
        if (filters.year) params.append("year", filters.year)
        if (filters.status) params.append("status", filters.status)

        const response = await fetch(`http://localhost:8080/hr/attendance-calendar?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error("Failed to fetch attendance data")
        const data = await response.json()
        setAttendanceData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getStatusColor = (status) => {
    return status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const groupedData = attendanceData.reduce((acc, record) => {
    if (!acc[record.employeeId]) {
      acc[record.employeeId] = {
        employee: record.employee,
        records: {},
      }
    }
    acc[record.employeeId].records[record.date] = record.status
    return acc
  }, {})

  const daysInMonth = new Date(filters.year, filters.month, 0).getDate()
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Attendance Calendar
        </CardTitle>
        <CardDescription>View employee attendance by day</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Employee</label>
            <Select value={filters.employee} onValueChange={(value) => handleFilterChange("employee", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.employeeId} value={emp.employeeId}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Month</label>
            <Select value={filters.month.toString()} onValueChange={(value) => handleFilterChange("month", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <Input
              type="number"
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              min="2025"
              max="2030"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Employee</TableHead>
                {daysArray.map((day) => (
                  <TableHead key={day} className="text-center w-8 p-2">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedData).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={daysArray.length + 1} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="h-8 w-8 text-muted-foreground/50" />
                      <p>No attendance records found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(groupedData).map(([employeeId, { employee, records }]) => (
                  <TableRow key={employeeId} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    {daysArray.map((day) => {
                      const dateStr = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(day).padStart(
                        2,
                        "0",
                      )}`
                      const status = records[dateStr] || "ABSENT"
                      return (
                        <TableCell key={day} className="p-1 text-center">
                          <span
                            className={`inline-block w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStatusColor(
                              status,
                            )}`}
                          >
                            {status.charAt(0)}
                          </span>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center">
              P
            </span>
            <span className="text-sm">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center">
              A
            </span>
            <span className="text-sm">Absent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HrDashboard() {
  const [hr, setHr] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [employees, setEmployees] = useState([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [employeesError, setEmployeesError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [hrList, setHrList] = useState([])
  const [activeTab, setActiveTab] = useState("overview")

  const fullName = hr ? `${hr.firstName} ${hr.lastName}` : ""

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    contact: "",
    position: "",
    baseSalary: "",
    role: "",
  })
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
    const username = (employee.user ?? "").toLowerCase()
    const search = searchQuery.toLowerCase()
    return fullName.includes(search) || username.includes(search)
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getEndpoint = () => {
    if (formData.role === "HR") return "http://localhost:8080/hr/create-hr"
    if (formData.role === "EMPLOYEE") return "http://localhost:8080/hr/create-employee"
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")

    const endpoint = getEndpoint()

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          baseSalary: Number.parseFloat(formData.baseSalary || 0),
        }),
      })

      if (!formData.role) {
        setFormError("Please select a role.")
        setFormLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error("Failed to create employee")
      }

      setFormData({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        contact: "",
        position: "",
        baseSalary: "",
        role: "",
      })

      alert("Employee created successfully!")
    } catch (error) {
      setFormError(error.message || "Failed to create employee")
    } finally {
      setFormLoading(false)
    }
    return
  }

  const handleEdit = (employee) => {
    setFormData({
      employeeId: employee.employeeId,
      username: employee.username,
      password: "",
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      contact: employee.contact,
      position: employee.position,
      baseSalary: employee.baseSalary,
      role: employee.role,
    })
    setActiveTab("createEmployee")
  }

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")

      const response = await fetch("http://localhost:8080/hr/create-employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          baseSalary: Number.parseFloat(formData.baseSalary || 0),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete employee")
      }

      setEmployees(employees.filter((emp) => emp.employeeId !== employeeId))
      alert("Employee deleted successfully")
    } catch (error) {
      alert(error.message)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setEmployeesLoading(true)
      setEmployeesError("")
      setIsLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      try {
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
        setHr({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          ...data,
        })
      } catch (fetchError) {
        console.error("API fetch failed:", fetchError)
        setError(fetchError.message || "Failed to load employee data")
      } finally {
        setIsLoading(false)
      }

      const endpoints = {
        EMPLOYEE: "http://localhost:8080/hr/all-employee",
        HR: "http://localhost:8080/hr/all-hr",
      }

      try {
        const employeeResponse = await fetch(endpoints.EMPLOYEE, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!employeeResponse.ok) throw new Error("Failed to fetch employees")
        const employeeData = await employeeResponse.json()

        const hrResponse = await fetch(endpoints.HR, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!hrResponse.ok) throw new Error(`Server responded with status: ${hrResponse.status}`)
        const contentType = hrResponse.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response")
        }

        const hrData = await hrResponse.json()

        const hrList = Array.isArray(hrData) ? hrData : [hrData]
        const combinedData = [...employeeData, ...hrList]

        setEmployees(combinedData)
        setHrList(hrList)
      } catch (error) {
        console.error("Fetch error:", error)

        if (process.env.NODE_ENV === "development") {
          console.warn("Using fallback dev data")
          setEmployees([
            {
              employeeId: "",
              username: "",
              email: "",
              firstName: "",
              lastName: "",
              contact: "",
              position: "",
              baseSalary: "",
              role: "",
            },
          ])
        } else {
          setEmployeesError(error.message)
          setError(error.message)
        }
      } finally {
        setEmployeesLoading(false)
        setIsLoading(false)
      }
    }
    console.log("HR object changed:", hr)

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
              <HrNav userType="hr" />
            </div>
            <HrUser userName="" userEmail="" />
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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <HrNav userType="hr" />
          </div>
          <HrUser userName={fullName} userEmail={hr.email} />
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={() => navigate("/HrLeaveRequests")}>
                <ClipboardList className="mr-2 h-4 w-4" />
                See Leave Requests
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="viewEmployee" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                View Employees
              </TabsTrigger>
              <TabsTrigger value="createEmployee" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Create Employee
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Payroll</p>
                        <h3 className="text-2xl font-bold">Generate Payroll</h3>
                        <p className="text-xs text-muted-foreground">
                          Generates payroll for employees by calculating salaries based on attendance, deductions,
                          bonuses, and applicable taxes.
                        </p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-0">
                    <Button
                      variant="ghost"
                      className="w-full rounded-t-none rounded-b-lg justify-start h-12"
                      onClick={() => (window.location.href = "/PayrollPage")}
                    >
                      <ChevronRight className="h-4 w-4 mr-2" />
                      Go to Payroll
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Logs</p>
                        <h3 className="text-2xl font-bold">View Employee Logs</h3>
                        <p className="text-xs text-muted-foreground">
                          Check the employee's attendance records and time tracking data
                        </p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-0">
                    <Button
                      variant="ghost"
                      className="w-full rounded-t-none rounded-b-lg justify-start h-12"
                      onClick={() => (window.location.href = "/EmployeeTimeLogs")}
                    >
                      <ChevronRight className="h-4 w-4 mr-2" />
                      View Time Logs
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your recent activities and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      <div className="text-center">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Upcoming Holidays
                    </CardTitle>
                    <CardDescription>Philippine holidays and special non-working days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HolidaysCalendar />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-6">
              <AttendanceOverview />
            </TabsContent>

            <TabsContent value="viewEmployee" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Employee List
                  </CardTitle>
                  <CardDescription>View all employees and HR staff</CardDescription>
                  {employeesError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{employeesError}</AlertDescription>
                    </Alert>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {employeesLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No employees found</p>
                      </div>
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      <div className="text-center">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No employees found matching your search</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Username</TableHead>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Contact</TableHead>
                            <TableHead className="font-semibold">Position</TableHead>
                            <TableHead className="font-semibold">Base Salary</TableHead>
                            <TableHead className="font-semibold">Role</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEmployees.map((employee) => (
                            <TableRow key={employee.employeeId} className="hover:bg-muted/50">
                              <TableCell>{employee.username}</TableCell>
                              <TableCell className="font-medium">
                                {employee.firstName} {employee.lastName}
                              </TableCell>
                              <TableCell>{employee.email}</TableCell>
                              <TableCell>{employee.contact}</TableCell>
                              <TableCell>{employee.position}</TableCell>
                              <TableCell>₱{employee.baseSalary?.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`${
                                    employee.role === "HR"
                                      ? "bg-purple-100 text-purple-700 border-purple-200"
                                      : "bg-blue-100 text-blue-700 border-blue-200"
                                  }`}
                                >
                                  {employee.role?.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(employee)}>
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="createEmployee" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Employee/HR
                  </CardTitle>
                  <CardDescription>Enter the details of the new employee/hr</CardDescription>
                  {formError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">First Name</label>
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name</label>
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          placeholder="Last name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <Input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          placeholder="Username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="Password"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Position</label>
                        <Input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          required
                          placeholder="Job position"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact</label>
                        <Input
                          type="text"
                          name="contact"
                          value={formData.contact}
                          onChange={handleChange}
                          required
                          placeholder="Contact number"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Base Salary</label>
                        <Input
                          type="number"
                          name="baseSalary"
                          value={formData.baseSalary}
                          onChange={handleChange}
                          required
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => handleChange({ target: { name: "role", value } })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("overview")}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={formLoading}>
                        {formLoading ? "Creating..." : "Create Employee"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
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
