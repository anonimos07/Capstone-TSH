"use client"

import { useState, useEffect } from "react"
import { Clock, ArrowRight } from "lucide-react"
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

function Button({ children, variant, size, className, onClick, disabled }) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"

  const variantStyles = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-50",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }

  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-lg",
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
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default function TimeTracking() {
  const [employee, setEmployee] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@techstaffhub.com",
  })

  const [timeStatus, setTimeStatus] = useState({
    isTimedIn: false,
    timeIn: null,
    timeOut: null,
  })

  const [timeRecords, setTimeRecords] = useState([])

  useEffect(() => {
    // In a real app, you would fetch the current time status from an API
    // For demo purposes, we'll check localStorage
    const savedTimeStatus = localStorage.getItem("timeStatus")
    if (savedTimeStatus) {
      setTimeStatus(JSON.parse(savedTimeStatus))
    }

    // Load today's time records
    const savedTimeRecords = localStorage.getItem("todayTimeRecords")
    if (savedTimeRecords) {
      setTimeRecords(JSON.parse(savedTimeRecords))
    }
  }, [])

  const handleTimeIn = () => {
    const now = new Date()
    const newTimeStatus = {
      isTimedIn: true,
      timeIn: now.toISOString(),
      timeOut: null,
    }

    setTimeStatus(newTimeStatus)
    localStorage.setItem("timeStatus", JSON.stringify(newTimeStatus))

    // Add to records
    const newRecord = {
      id: Date.now(),
      timeIn: now.toISOString(),
      timeOut: null,
    }

    const updatedRecords = [...timeRecords, newRecord]
    setTimeRecords(updatedRecords)
    localStorage.setItem("todayTimeRecords", JSON.stringify(updatedRecords))
  }

  const handleTimeOut = () => {
    const now = new Date()
    const newTimeStatus = {
      isTimedIn: false,
      timeIn: timeStatus.timeIn,
      timeOut: now.toISOString(),
    }

    setTimeStatus(newTimeStatus)
    localStorage.setItem("timeStatus", JSON.stringify(newTimeStatus))

    // Update the latest record
    const updatedRecords = [...timeRecords]
    const latestRecord = updatedRecords[updatedRecords.length - 1]

    if (latestRecord && !latestRecord.timeOut) {
      latestRecord.timeOut = now.toISOString()
      setTimeRecords(updatedRecords)
      localStorage.setItem("todayTimeRecords", JSON.stringify(updatedRecords))
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
          <PageHeader heading="Time In/Out" subheading="Track your working hours">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => (window.location.href = "/TimeLogs")}>
                View Logs
              </Button>
            </div>
          </PageHeader>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time Tracking</CardTitle>
                <CardDescription>Record your daily attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800">
                      {new Date().toLocaleDateString([], {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="mt-2 text-2xl text-gray-600">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="flex w-full gap-4">
                    <Button
                      variant="success"
                      size="lg"
                      className="flex-1"
                      onClick={handleTimeIn}
                      disabled={timeStatus.isTimedIn}
                    >
                      <Clock className="mr-2 h-5 w-5" />
                      Time In
                    </Button>
                    <Button
                      variant="danger"
                      size="lg"
                      className="flex-1"
                      onClick={handleTimeOut}
                      disabled={!timeStatus.isTimedIn}
                    >
                      <Clock className="mr-2 h-5 w-5" />
                      Time Out
                    </Button>
                  </div>

                  <div className="w-full rounded-lg border p-4 bg-gray-50">
                    <div className="text-center text-sm font-medium text-gray-500 mb-2">Current Status</div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Time In</div>
                        <div className="font-bold">{formatTime(timeStatus.timeIn)}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Time Out</div>
                        <div className="font-bold">{formatTime(timeStatus.timeOut)}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="font-bold">{calculateDuration(timeStatus.timeIn, timeStatus.timeOut)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Records</CardTitle>
                <CardDescription>Your time records for today</CardDescription>
              </CardHeader>
              <CardContent>
                {timeRecords.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-center text-gray-500">No time records for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeRecords.map((record, index) => (
                      <div key={record.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Session {index + 1}</div>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          <div>
                            <div className="text-xs text-gray-500">Time In</div>
                            <div>{formatTime(record.timeIn)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Time Out</div>
                            <div>{formatTime(record.timeOut)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Duration</div>
                            <div>{calculateDuration(record.timeIn, record.timeOut)}</div>
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
