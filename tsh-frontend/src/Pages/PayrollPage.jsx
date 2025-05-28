import { useState, useEffect } from "react"
import axios from "axios"
import {
  FiCalendar,
  FiDollarSign,
  FiPrinter,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiFilter,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiSearch,
} from "react-icons/fi"
import { HrNav } from "../components/dashboard/HrNav"
import { HrUser } from "../components/dashboard/HrUser"

const API_URL = "http://localhost:8080/api/payrolls"

const PayrollPage = () => {
  const [hr, setHr] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [currentPayroll, setCurrentPayroll] = useState(null)

  const fullName = hr ? `${hr.firstName} ${hr.lastName}` : ""

  const generatePayslip = async (payrollId) => {
    try {
      setLoading(true)
      const url = `http://localhost:8080/api/payslips/generate/${payrollId}`

      // Get token from localStorage
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }

      // Make the API call
      await axios.post(url, null, config)

      // Find the employee name for the success message
      const payroll = payrolls.find((p) => p.payrollId === payrollId)
      const employeeName = payroll?.employee ? `${payroll.employee.firstName} ${payroll.employee.lastName}` : "Employee"

      setSuccessMessage(`Payslip generated successfully for ${employeeName}!`)
    } catch (error) {
      console.error("Error generating payslip:", error)

      if (error.response) {
        if (error.response.status === 403) {
          setError("Access denied. Your session may have expired. Please log in again.")
          localStorage.removeItem("token")
        } else if (error.response.status === 404) {
          setError("Payslip endpoint not found (404). Please check the URL.")
        } else {
          setError(`Server error: ${error.response.status} - ${error.response.data?.message || "Unknown error"}`)
        }
      } else if (error.request) {
        setError("No response from server. Check your network connection.")
      } else {
        setError(`Request error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchHrData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:8080/hr/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch HR data")
        }

        const data = await response.json()
        setHr({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          ...data,
        })
      } catch (error) {
        console.error("Error fetching HR data:", error)
      }
    }

    fetchHrData()
    fetchEmployees()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      const response = await axios.post("http://localhost:8080/auth/refresh-token", {
        refreshToken: refreshToken,
      })

      localStorage.setItem("token", response.data.token)
      return response.data.token
    } catch (error) {
      console.error("Failed to refresh token:", error)
      window.location.href = "/login"
      throw error
    }
  }

  const apiRequest = async (method, url, data = null) => {
    try {
      const config = getAuthHeaders()
      let response

      if (method.toLowerCase() === "get") {
        response = await axios.get(url, config)
      } else if (method.toLowerCase() === "post") {
        response = await axios.post(url, data, config)
      } else if (method.toLowerCase() === "put") {
        response = await axios.put(url, data, config)
      } else if (method.toLowerCase() === "delete") {
        response = await axios.delete(url, config)
      }

      return response.data
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          await refreshToken()
          const newConfig = getAuthHeaders()

          if (method.toLowerCase() === "get") {
            return await axios.get(url, newConfig)
          } else if (method.toLowerCase() === "post") {
            return await axios.post(url, data, newConfig)
          } else if (method.toLowerCase() === "put") {
            return await axios.put(url, data, newConfig)
          } else if (method.toLowerCase() === "delete") {
            return await axios.delete(url, newConfig)
          }
        } catch (refreshError) {
          throw refreshError
        }
      }
      throw error
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const response = await fetch("http://localhost:8080/hr/all-employee", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const raw = await response.text()

      const data = JSON.parse(raw)
      console.log("Parsed employees data:", data)

      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Fetch employees error:", error)
      setError("Failed to load employee data. Please check the API response format.")
    } finally {
      setLoading(false)
    }
  }

  const fetchPayrollsByEmployee = async (employeeId) => {
    try {
      const response = await apiRequest("get", `${API_URL}/employee/${employeeId}`)
      return response
    } catch (error) {
      console.error(`Fetch payrolls for employee ${employeeId} error:`, error)
      throw error
    }
  }

  const fetchPayrollsByDateRange = async (start, end) => {
    try {
      const response = await apiRequest("get", `${API_URL}/dateRange?startDate=${start}&endDate=${end}`)
      return response
    } catch (error) {
      console.error("Fetch payrolls by date range error:", error)
      throw error
    }
  }

  const fetchPayrollsByEmployeeAndDateRange = async (employeeId, start, end) => {
    try {
      const response = await apiRequest(
        "get",
        `${API_URL}/employee/${employeeId}/dateRange?startDate=${start}&endDate=${end}`,
      )
      return response
    } catch (error) {
      console.error("Fetch payrolls by employee and date range error:", error)
      throw error
    }
  }

  const handleEmployeeSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setSelectedEmployees(selectedOptions)
  }

  const fetchPayrolls = async () => {
    if (selectedEmployees.length === 0) {
      setError("Please select at least one employee")
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      let allPayrolls = []

      if (startDate && endDate) {
        for (const employeeId of selectedEmployees) {
          const payrolls = await fetchPayrollsByEmployeeAndDateRange(employeeId, startDate, endDate)
          allPayrolls = [...allPayrolls, ...payrolls]
        }
      } else {
        for (const employeeId of selectedEmployees) {
          const payrolls = await fetchPayrollsByEmployee(employeeId)
          allPayrolls = [...allPayrolls, ...payrolls]
        }
      }

      setPayrolls(allPayrolls)

      if (allPayrolls.length === 0) {
        setSuccessMessage("No payroll records found for the selected criteria.")
      }
    } catch (error) {
      console.error("Error fetching payrolls:", error)
      setError("Failed to load payroll data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const generatePayroll = async () => {
    if (selectedEmployees.length === 0) {
      setError("Please select at least one employee")
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const results = []
      const currentDate = new Date().toISOString().split("T")[0]

      for (const employeeId of selectedEmployees) {
        try {
          const url = `${API_URL}/generate/${employeeId}?payrollDate=${currentDate}`
          const response = await apiRequest("get", url)

          results.push({
            employeeId,
            success: true,
            payroll: response,
          })
        } catch (err) {
          results.push({
            employeeId,
            success: false,
            error: err.message,
          })
        }
      }

      const successCount = results.filter((r) => r.success).length
      const newPayrolls = results.filter((r) => r.success && r.payroll).map((r) => r.payroll)

      if (newPayrolls.length > 0) {
        setPayrolls((prev) => [...newPayrolls, ...prev])
      }

      if (successCount === selectedEmployees.length) {
        setSuccessMessage(`Successfully generated payroll for ${successCount} employee(s).`)
      } else if (successCount > 0) {
        setSuccessMessage(`Generated payroll for ${successCount} out of ${selectedEmployees.length} employee(s).`)
        setError(`Failed to generate payroll for ${selectedEmployees.length - successCount} employee(s).`)
      } else {
        setError("Failed to generate payroll for any of the selected employees.")
      }
    } catch (error) {
      console.error("Error generating payroll:", error)
      setError("Failed to generate payroll. Please check your authorization and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditPayroll = (payroll) => {
    setEditMode(true)
    setCurrentPayroll(payroll)
  }

  const handleUpdatePayroll = async () => {
    if (!currentPayroll) return

    try {
      setLoading(true)
      const updatedPayroll = await apiRequest("put", `${API_URL}/${currentPayroll.payrollId}`, currentPayroll)

      setPayrolls(payrolls.map((p) => (p.payrollId === updatedPayroll.payrollId ? updatedPayroll : p)))

      setSuccessMessage("Payroll updated successfully!")
      setEditMode(false)
      setCurrentPayroll(null)
    } catch (error) {
      console.error("Error updating payroll:", error)
      setError("Failed to update payroll. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePayroll = async (payrollId) => {
    if (window.confirm("Are you sure you want to delete this payroll record?")) {
      try {
        setLoading(true)
        await apiRequest("delete", `${API_URL}/${payrollId}`)

        setPayrolls(payrolls.filter((p) => p.payrollId !== payrollId))
        setSuccessMessage("Payroll deleted successfully!")
      } catch (error) {
        console.error("Error deleting payroll:", error)
        setError("Failed to delete payroll. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value || 0)
  }

  const handleReset = () => {
    setSelectedEmployees([])
    setStartDate("")
    setEndDate("")
    setPayrolls([])
    setError(null)
    setSuccessMessage(null)
    setEditMode(false)
    setCurrentPayroll(null)
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A"
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) return "Invalid Date"
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <HrNav userType="hr" />
          </div>
          <HrUser userName={fullName} userEmail={hr.email} />
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
            <p className="text-gray-500">Manage and process employee payrolls</p>
          </div>
          <div className="mt-4 sm:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm flex items-center text-gray-700 border border-gray-200">
            <FiCalendar className="mr-2 text-purple-500" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-red-800">{error}</div>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              &times;
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start">
            <FiCheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-green-800">{successMessage}</div>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-500 hover:text-green-700">
              &times;
            </button>
          </div>
        )}

        {/* Edit Payroll Modal */}
        {editMode && currentPayroll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-[#7c213c] text-white rounded-t-lg">
                <h3 className="text-lg font-semibold flex items-center">
                  <FiEdit className="mr-2" /> Edit Payroll
                </h3>
                <button
                  onClick={() => {
                    setEditMode(false)
                    setCurrentPayroll(null)
                  }}
                  className="text-white hover:text-gray-200"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Salary</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₱</span>
                      </div>
                      <input
                        type="number"
                        value={currentPayroll.baseSalary || ""}
                        onChange={(e) =>
                          setCurrentPayroll({
                            ...currentPayroll,
                            baseSalary: Number.parseFloat(e.target.value),
                          })
                        }
                        className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm h-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      value={currentPayroll.overtimeHours || ""}
                      onChange={(e) =>
                        setCurrentPayroll({
                          ...currentPayroll,
                          overtimeHours: Number.parseFloat(e.target.value),
                        })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Absence Days</label>
                    <input
                      type="number"
                      value={currentPayroll.absenceDays || ""}
                      onChange={(e) =>
                        setCurrentPayroll({
                          ...currentPayroll,
                          absenceDays: Number.parseInt(e.target.value),
                        })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm h-10"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditMode(false)
                      setCurrentPayroll(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePayroll}
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="mr-2" /> Update Payroll
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-[#7c213c] rounded-t-lg flex items-center">
            <FiFilter className="mr-2 text-white" />
            <h2 className="text-lg font-semibold text-white">Payroll Filters</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Employees</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <select
                    multiple
                    value={selectedEmployees}
                    onChange={handleEmployeeSelect}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    style={{ height: "150px" }}
                  >
                    {employees && employees.length > 0 ? (
                      employees.map((employee) => (
                        <option key={employee.employeeId} value={employee.employeeId}>
                          {employee.firstName} {employee.lastName} ({employee.position})
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading employees...</option>
                    )}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple employees</p>
              </div>

              <div className="md:col-span-3">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col justify-end">
                <div className="space-y-3">
                  <button
                    onClick={fetchPayrolls}
                    disabled={loading || selectedEmployees.length === 0}
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-[#8b2545] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw className="mr-2" /> View Payroll
                      </>
                    )}
                  </button>

                  <button
                    onClick={generatePayroll}
                    disabled={loading || selectedEmployees.length === 0}
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiDollarSign className="mr-2" /> Generate Payroll
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && !editMode && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                className="animate-spin h-12 w-12 text-purple-500 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-500 text-lg">Loading payroll data...</p>
            </div>
          </div>
        )}

        {!loading && payrolls.length > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-[#7c213c] rounded-t-lg flex justify-between items-center">
              <div className="flex items-center">
                <FiDollarSign className="mr-2 text-white" />
                <h2 className="text-lg font-semibold text-white">Payroll Records</h2>
              </div>
              <span className="bg-white text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                {payrolls.length} Record(s)
              </span>
            </div>

            <div className="divide-y divide-gray-200">
              {payrolls.map((payroll) => (
                <div key={payroll.payrollId} className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {payroll.employee ? `${payroll.employee.firstName} ${payroll.employee.lastName}` : "Employee"}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <FiUser className="mr-1" /> {payroll.employee?.position || "Position"}
                        </span>
                        <span className="flex items-center">
                          <FiCalendar className="mr-1" /> {formatDate(payroll.payrollDate)}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          ID: {payroll.payrollId}
                        </span>
                      </div>
                    </div>
                    <div className="flex mt-4 md:mt-0 space-x-2">
                      <button
                        onClick={() => handleEditPayroll(payroll)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <FiEdit className="mr-1.5 text-purple-500" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeletePayroll(payroll.payrollId)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FiTrash2 className="mr-1.5 text-red-500" /> Delete
                      </button>

                      <button
                        onClick={() => generatePayslip(payroll.payrollId)}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <FiPrinter className="mr-1.5" /> Generate Payslip
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          localStorage.setItem("printPayrollId", payroll.payrollId)
                          window.print()
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <FiPrinter className="mr-1.5 text-gray-500" /> Print
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-50 rounded-lg overflow-hidden border border-green-100">
                      <div className="bg-green-600 text-white px-4 py-2 font-medium">Earnings</div>
                      <div className="divide-y divide-green-100">
                        <div className="flex justify-between px-4 py-3">
                          <span className="text-gray-600">Base Salary</span>
                          <span className="font-medium">{formatCurrency(payroll.baseSalary)}</span>
                        </div>
                        <div className="flex justify-between px-4 py-3">
                          <span className="text-gray-600">Overtime Pay</span>
                          <span className="font-medium">{formatCurrency(payroll.overtimePay)}</span>
                        </div>
                        <div className="flex justify-between px-4 py-3">
                          <span className="text-gray-600">Holiday Pay</span>
                          <span className="font-medium">
                            {formatCurrency((payroll.regularHolidayPay || 0) + (payroll.specialHolidayPay || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between px-4 py-3 bg-green-100">
                          <span className="font-bold text-gray-800">Gross Income</span>
                          <span className="font-bold text-green-700">{formatCurrency(payroll.grossIncome)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg overflow-hidden border border-red-100">
                      <div className="bg-red-600 text-white px-4 py-2 font-medium">Deductions</div>
                      <div className="divide-y divide-red-100">
                        <div className="flex justify-between px-4 py-3">
                          <span className="text-gray-600">SSS</span>
                          <span className="font-medium text-red-600">-{formatCurrency(payroll.sssContribution)}</span>
                        </div>
                        <div className="flex justify-between px-4 py-3">
                          <span className="text-gray-600">PhilHealth</span>
                          <span className="font-medium text-red-600">
                            -{formatCurrency(payroll.philhealthContribution)}
                          </span>
                        </div>
                        <div className="flex justify-between px-4 py-3">
                          <span className="text-gray-600">Pag-IBIG</span>
                          <span className="font-medium text-red-600">
                            -{formatCurrency(payroll.pagibigContribution)}
                          </span>
                        </div>

                        <div className="flex justify-between px-4 py-3">
                          <span className="text-gray-600">Absences</span>
                          <span className="font-medium text-red-600">-{payroll.absenceDays}</span>
                        </div>

                        <div className="flex justify-between px-4 py-3">
                          <span className="text-gray-600">Absences Deductions</span>
                          <span className="font-medium text-red-600">-{formatCurrency(payroll.absenceDeduction)}</span>
                        </div>

                        <div className="flex justify-between px-4 py-3">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium text-red-600">-{formatCurrency(payroll.incomeTax)}</span>
                        </div>
                        <div className="flex justify-between px-4 py-3 bg-red-100">
                          <span className="font-bold text-gray-800">Total Deductions</span>
                          <span className="font-bold text-red-700">-{formatCurrency(payroll.totalDeductions)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg overflow-hidden border border-purple-100">
                    <div className="bg-[#7c213c] text-white px-4 py-2 font-medium">Summary</div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">Net Pay</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(payroll.payrollDate)?.replace(/\s\d+,/, "")}
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(payroll.netIncome)}</div>
                      </div>
                      <div className="mt-4 h-2 w-full bg-purple-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#7c213c] rounded-full" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && payrolls.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-purple-100 p-6 mb-4">
                <FiDollarSign className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {selectedEmployees.length > 0 ? "No payroll records found" : "Select employees to view payroll records"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {selectedEmployees.length > 0
                  ? "Try generating new payrolls using the button above or adjust your filter criteria."
                  : "To get started, select one or more employees from the dropdown menu above."}
              </p>
              {selectedEmployees.length === 0 && (
                <button
                  onClick={() => document.querySelector("select").focus()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Select Employees
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PayrollPage
