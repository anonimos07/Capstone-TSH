import { useState, useEffect } from "react"
import { DollarSign, CreditCard, Banknote, FileText, Download, ArrowLeft, PlusCircle, Calendar, Loader2, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { MainNav } from "../components/dashboard/MainNav"
import { UserNav } from "../components/dashboard/UserNav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const EmployeePayslip = ({ employeeId }) => {
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [activeTab, setActiveTab] = useState("payslips")
  const [payslips, setPayslips] = useState([])
  const [filteredPayslips, setFilteredPayslips] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingPayslips, setIsFetchingPayslips] = useState(false)
  const [error, setError] = useState(null)
  const [payrollId, setPayrollId] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)
  const [generateSuccess, setGenerateSuccess] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)
  // Filter states
  const [yearFilter, setYearFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("all")
  const [dayFilter, setDayFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : ""

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

        if (activeTab === "payslips") {
          await fetchPayslips()
        }
      } catch (error) {
        console.error("Error fetching HR data:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployeeData()
  }, [activeTab])

  useEffect(() => {
    if (payslips.length > 0) {
      applyFilters()
    }
  }, [payslips, yearFilter, monthFilter, dayFilter, sortOrder])

  const applyFilters = () => {
    let result = [...payslips]

    // Filter by year if selected
    if (yearFilter && yearFilter !== "all") {
      result = result.filter(payslip => {
        const date = new Date(payslip.generatedDate)
        return date.getFullYear().toString() === yearFilter
      })
    }

    // Filter by month if selected
    if (monthFilter && monthFilter !== "all") {
      result = result.filter(payslip => {
        const date = new Date(payslip.generatedDate)
        return (date.getMonth() + 1).toString() === monthFilter
      })
    }

    // Filter by day if selected
    if (dayFilter && dayFilter !== "all") {
      result = result.filter(payslip => {
        const date = new Date(payslip.generatedDate)
        return date.getDate().toString() === dayFilter
      })
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.generatedDate)
      const dateB = new Date(b.generatedDate)
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

    setFilteredPayslips(result)
  }

  const fetchPayslips = async () => {
    console.log("[fetchPayslips] Starting fetch operation...")
    setIsFetchingPayslips(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        const errorMsg = "No authentication token found"
        console.error("[fetchPayslips] Error:", errorMsg)
        throw new Error(errorMsg)
      }

      const apiUrl = "http://localhost:8080/api/payslips/my-payslips"

      console.log("[fetchPayslips] Calling API:", apiUrl)

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      console.log("[fetchPayslips] Received response:", {
        status: response.status,
        ok: response.ok,
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login"
          return
        }

        let errorMsg =
          response.status === 403
            ? "You are not authorized to view these payslips. Please ensure you are logged in as the correct employee."
            : "Failed to fetch payslips"

        console.error("[fetchPayslips] API Error:", {
          message: errorMsg,
          status: response.status,
          statusText: response.statusText,
        })

        throw new Error(errorMsg)
      }

      const data = await response.json()
      console.log("[fetchPayslips] Successful response data:", data)
      setPayslips(data)
      setFilteredPayslips(data)
    } catch (err) {
      console.error("[fetchPayslips] Caught error:", {
        error: err,
        message: err.message,
        stack: err.stack,
      })
      setError(err.message)
    } finally {
      console.log("[fetchPayslips] Completing operation")
      setIsFetchingPayslips(false)
    }
  }

  const downloadPayslip = async (payslipId) => {
    try {
      setDownloadingId(payslipId)
      setIsDownloading(true)

      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/payslips/${payslipId}/download`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to download payslip")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const contentDisposition = response.headers.get("content-disposition")
      let filename = `payslip-${payslipId}.pdf`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      }

      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDownloading(false)
      setDownloadingId(null)
    }
  }

  const PayslipsList = () => (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Payslips
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Year Filter */}
            <Select onValueChange={setYearFilter} value={yearFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {Array.from(new Set(payslips.map(p => new Date(p.generatedDate).getFullYear())))
                  .sort((a, b) => b - a) // Sort years descending
                  .map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Month Filter */}
            <Select onValueChange={setMonthFilter} value={monthFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(0, month - 1).toLocaleString('default', {month: 'long'})}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Day Filter */}
            <Select onValueChange={setDayFilter} value={dayFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="inline-flex items-center gap-2"
            >
              {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {sortOrder === "asc" ? "Oldest First" : "Newest First"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchPayslips}
              disabled={isFetchingPayslips}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetchingPayslips ? "animate-spin" : ""}`} />
              {isFetchingPayslips ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isFetchingPayslips && payslips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading payslips...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex flex-col gap-2">
                  <span>{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPayslips}
                    disabled={isFetchingPayslips}
                    className="w-fit"
                  >
                    {isFetchingPayslips ? "Retrying..." : "Retry"}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : filteredPayslips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payslips found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {payslips.length === 0 
                ? "Your payslips will appear here once they are generated"
                : "No payslips match your current filters"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setYearFilter("all")
                setMonthFilter("all")
                setDayFilter("all")
              }}
              className="inline-flex items-center gap-2"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPayslips.map((payslip) => (
              <div key={payslip.payslipId} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Payslip #{payslip.payslipId}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Issued: {payslip.generatedDate ? new Date(payslip.generatedDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">PDF</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPayslip(payslip.payslipId)}
                      disabled={isDownloading && downloadingId === payslip.payslipId}
                      className="inline-flex items-center gap-2"
                    >
                      {isDownloading && downloadingId === payslip.payslipId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
              <MainNav userType="employee" />
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </header>
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gray-50 px-6 py-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Loading your payslip information...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <MainNav userType="employee" />
          </div>
          <UserNav userName={fullName} userEmail={employee.email} />
        </div>
      </header>
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payslips</h1>
              <p className="mt-1 text-sm text-gray-500">View and download your payslips</p>
            </div>
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="payslips" className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payslips
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payslips" className="space-y-6">
              <PayslipsList />
            </TabsContent>
          </Tabs>
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

export default EmployeePayslip