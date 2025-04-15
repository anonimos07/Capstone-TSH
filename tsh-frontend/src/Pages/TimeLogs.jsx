import { useState } from "react"
import { Calendar, Clock, Download, Filter, Search } from "lucide-react"
import { MainNav } from "../components/dashboard/MainNav"
import { UserNav } from "../components/dashboard/UserNav"
import { PageHeader } from "../components/dashboard/PageHeader"

function Card({ children, className }) {
  return <div className={`rounded-lg border bg-white shadow-sm ${className || ""}`}>{children}</div>
}

function CardHeader({ children, className }) {
  return <div className={`p-6 pb-3 ${className || ""}`}>{children}</div>
}

function CardTitle({ children, className }) {
  return <h3 className={`text-lg font-semibold ${className || ""}`}>{children}</h3>
}

function CardDescription({ children }) {
  return <p className="text-sm text-gray-500">{children}</p>
}

function CardContent({ children }) {
  return <div className="p-6 pt-0">{children}</div>
}

function Button({ children, variant, size, className, onClick }) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"

  const variantStyles = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-50",
  }

  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
  }

  return (
    <button
      className={`
        ${baseStyles} 
        ${variantStyles[variant || "default"]} 
        ${sizeStyles[size || "default"]} 
        ${className || ""}
      `}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Input({ className, ...props }) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

export default function TimeLogs() {
  const [employee, setEmployee] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@techstaffhub.com",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Sample attendance logs data
  const [logs, setLogs] = useState([
    {
      id: 1,
      date: "2025-04-15",
      timeIn: "2025-04-15T09:00:00",
      timeOut: "2025-04-15T17:00:00",
      totalHours: 8,
    },
    {
      id: 2,
      date: "2025-04-14",
      timeIn: "2025-04-14T08:55:00",
      timeOut: "2025-04-14T17:30:00",
      totalHours: 8.5,
    },
    {
      id: 3,
      date: "2025-04-13",
      timeIn: "2025-04-13T09:10:00",
      timeOut: "2025-04-13T18:00:00",
      totalHours: 8.8,
    },
    {
      id: 4,
      date: "2025-04-12",
      timeIn: "2025-04-12T09:05:00",
      timeOut: "2025-04-12T17:15:00",
      totalHours: 8.2,
    },
    {
      id: 5,
      date: "2025-04-11",
      timeIn: "2025-04-11T08:50:00",
      timeOut: "2025-04-11T16:50:00",
      totalHours: 8,
    },
    {
      id: 6,
      date: "2025-04-10",
      timeIn: "2025-04-10T09:15:00",
      timeOut: "2025-04-10T17:45:00",
      totalHours: 8.5,
    },
    {
      id: 7,
      date: "2025-04-09",
      timeIn: "2025-04-09T09:00:00",
      timeOut: "2025-04-09T17:00:00",
      totalHours: 8,
    },
    {
      id: 8,
      date: "2025-04-08",
      timeIn: "2025-04-08T08:45:00",
      timeOut: "2025-04-08T16:45:00",
      totalHours: 8,
    },
    {
      id: 9,
      date: "2025-04-07",
      timeIn: "2025-04-07T09:30:00",
      timeOut: "2025-04-07T18:30:00",
      totalHours: 9,
    },
    {
      id: 10,
      date: "2025-04-06",
      timeIn: "2025-04-06T09:00:00",
      timeOut: "2025-04-06T17:00:00",
      totalHours: 8,
    },
  ])

  // Filter logs based on search term and date filter
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.date.includes(searchTerm) ||
      formatTime(log.timeIn).includes(searchTerm) ||
      formatTime(log.timeOut).includes(searchTerm) ||
      log.totalHours.toString().includes(searchTerm)

    const matchesDate = dateFilter === "" || log.date === dateFilter

    return matchesSearch && matchesDate
  })

  const formatDate = (dateString) => {
    const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const calculateTotalHours = () => {
    return filteredLogs.reduce((total, log) => total + log.totalHours, 0).toFixed(1)
  }

  const calculateAverageHours = () => {
    if (filteredLogs.length === 0) return "0.0"
    return (filteredLogs.reduce((total, log) => total + log.totalHours, 0) / filteredLogs.length).toFixed(1)
  }

  const fullName = `${employee.firstName} ${employee.lastName}`

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <MainNav userType="employee" />
          </div>
          <UserNav userName={fullName} userEmail={employee.email} />
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <PageHeader heading="Attendance Logs" subheading="View and manage your attendance records">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => (window.location.href = "/TimeTracking")}>
                <Clock className="mr-2 h-4 w-4" />
                Time In/Out
              </Button>
            </div>
          </PageHeader>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>Your complete attendance history</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Search records..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="date"
                        className="pl-8"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setDateFilter("")
                      }}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-gray-500">Total Records</div>
                    <div className="text-2xl font-bold">{filteredLogs.length}</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-gray-500">Total Hours</div>
                    <div className="text-2xl font-bold">{calculateTotalHours()} hrs</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-gray-500">Average Hours/Day</div>
                    <div className="text-2xl font-bold">{calculateAverageHours()} hrs</div>
                  </div>
                </div>

                <div className="rounded-lg border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time In
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time Out
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{formatDate(log.date)}</td>
                            <td className="px-4 py-3 text-sm">{formatTime(log.timeIn)}</td>
                            <td className="px-4 py-3 text-sm">{formatTime(log.timeOut)}</td>
                            <td className="px-4 py-3 text-sm font-medium">{log.totalHours.toFixed(1)} hrs</td>
                          </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                              No records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t py-4">
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
