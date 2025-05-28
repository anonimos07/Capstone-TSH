import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseISO, format as formatDate } from "date-fns"
import { HrNav } from "../components/dashboard/HrNav"
import { HrUser } from "../components/dashboard/HrUser"
import { useNavigate } from "react-router-dom"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Edit, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function EmployeeTimeLogs() {
  const [hr, setHr] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [timeLogs, setTimeLogs] = useState([])
  const [selectedLog, setSelectedLog] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editedLog, setEditedLog] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [isLoadingTimeLogs, setIsLoadingTimeLogs] = useState(false)

  useEffect(() => {
    const fetchHrData = async () => {
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
        setError(fetchError.message || "Failed to load HR data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHrData()
    fetchTimeLogs()
  }, [])

  const fullName = hr ? `${hr.firstName} ${hr.lastName}` : ""

  const fetchTimeLogs = async () => {
    setIsLoadingTimeLogs(true)
    try {
      const token = localStorage.getItem("token")
      console.log("Fetching logs with token:", token ? `${token.substring(0, 15)}...` : "No token found")

      const response = await fetch("http://localhost:8080/api/hr/time-logs/assigned-logs", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.status === 403) {
        console.error("Authorization failed when fetching logs (403 Forbidden)")
        setError("Authentication failed - please log in again")
        return
      }

      if (!response.ok) throw new Error(`Failed to fetch time logs: ${response.status}`)

      const data = await response.json()
      console.log("Successfully fetched logs:", data)
      setTimeLogs(data)
    } catch (error) {
      setError(`Failed to load time logs: ${error.message}`)
      console.error("Error fetching time logs:", error)
    } finally {
      setIsLoadingTimeLogs(false)
    }
  }

  const handleEdit = (log) => {
    console.log("Editing log:", log)

    const employeeId = log.employee?.employeeId || log.employeeId
    if (!employeeId) {
      setError("Could not determine employee ID")
      return
    }

    setSelectedLog(log)
    setEditedLog({
      timeLogId: log.timeLogId,
      employeeId: employeeId,
      timeIn: formatDate(new Date(log.timeIn), "yyyy-MM-dd'T'HH:mm"),
      timeOut: formatDate(new Date(log.timeOut), "yyyy-MM-dd'T'HH:mm"),
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError("")

    try {
      const timeInDate = parseISO(editedLog.timeIn)
      const timeOutDate = parseISO(editedLog.timeOut)

      const formattedLog = {
        timeLogId: editedLog.timeLogId,
        employeeId: editedLog.employeeId,
        timeIn: formatDate(timeInDate, "yyyy-MM-dd HH:mm:ss"),
        timeOut: formatDate(timeOutDate, "yyyy-MM-dd HH:mm:ss"),
      }

      console.log("Sending to backend:", formattedLog)

      const token = localStorage.getItem("token")

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      }

      if (csrfToken) {
        headers["X-CSRF-TOKEN"] = csrfToken
      }

      const response = await fetch("http://localhost:8080/api/hr/time-logs/adjust", {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(formattedLog),
        credentials: "include",
      })

      console.log("Response status:", response.status)

      if (response.status === 403) {
        throw new Error("Authentication failed - please log in again")
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response text:", errorText)
        throw new Error(`Failed to update time log: ${response.status}`)
      }

      await fetchTimeLogs()
      setIsModalOpen(false)
      setSelectedLog(null)
      setEditedLog(null)
    } catch (error) {
      setError(`Failed to update time log: ${error.message}`)
      console.error("Error updating time log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedLog((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getEmployeeId = (log) => {
    if (log.employeeId) return log.employeeId
    if (log.employee && log.employee.employeeId) return log.employee.employeeId
    if (log.employee && log.employee.id) return log.employee.id
    return "N/A"
  }

  const getEmployeeName = (log) => {
    if (log.employee?.firstName && log.employee?.lastName) {
      return `${log.employee.firstName} ${log.employee.lastName}`
    }
    return `Employee ${getEmployeeId(log)}`
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
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Employee Time Logs</h1>
              <p className="mt-1 text-sm text-gray-500">View and manage employee time records</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">{formatDate(new Date(), "MMMM d, yyyy")}</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex flex-col gap-2">
                  <span>{error}</span>
                  {error.includes("Authentication") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigate("/login")
                      }}
                    >
                      Login Again
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 px-6 py-4">
              <CardTitle className="text-lg font-medium">Time Log Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium">Employee</TableHead>
                      <TableHead className="font-medium">Time In</TableHead>
                      <TableHead className="font-medium">Time Out</TableHead>
                      <TableHead className="font-medium">Duration</TableHead>
                      <TableHead className="font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTimeLogs ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Loading time logs...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : timeLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No time logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      timeLogs.map((log) => {
                        const timeIn = new Date(log.timeIn)
                        const timeOut = new Date(log.timeOut)
                        const duration = Math.round((timeOut - timeIn) / (1000 * 60))
                        const hours = Math.floor(duration / 60)
                        const minutes = duration % 60

                        return (
                          <TableRow key={log.timeLogId} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{getEmployeeId(log)}</Badge>
                                <span>{getEmployeeName(log)}</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(timeIn, "MMM dd, yyyy HH:mm")}</TableCell>
                            <TableCell>{formatDate(timeOut, "MMM dd, yyyy HH:mm")}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                {`${hours}h ${minutes}m`}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                className="inline-flex items-center gap-1"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(log)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Edit Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Time Log</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employeeId" className="text-right">
                    Employee ID
                  </Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    value={editedLog?.employeeId}
                    onChange={handleInputChange}
                    disabled
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="timeIn" className="text-right">
                    Time In
                  </Label>
                  <Input
                    id="timeIn"
                    name="timeIn"
                    type="datetime-local"
                    value={editedLog?.timeIn}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="timeOut" className="text-right">
                    Time Out
                  </Label>
                  <Input
                    id="timeOut"
                    name="timeOut"
                    type="datetime-local"
                    value={editedLog?.timeOut}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
