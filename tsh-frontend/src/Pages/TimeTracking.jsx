import { useState, useEffect } from "react"
import { Clock, ArrowRight } from "lucide-react"
import { MainNav } from "../components/dashboard/MainNav"
import { UserNav } from "../components/dashboard/UserNav"
import { PageHeader } from "../components/dashboard/PageHeader"
import LoadingSpinner from "../components/ui/LoadingSpinner" // Import LoadingSpinner

// API Service
const API_BASE_URL = 'http://localhost:8080/api/time-logs';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};
const userData = {
  username: localStorage.getItem("username") || ""
};

// API request helper with token
const callApi = async (endpoint, method = 'GET', body = null) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const text = await response.text();
    console.error('API error response:', response.status, text);
    throw new Error(`API request failed: ${response.status}`);
  }
  
  try {
    // Try to parse as normal JSON first
    const text = await response.text();
    return JSON.parse(text);
  } catch (e) {
    // For time-in endpoint
    if (endpoint === '/time-in') {
      // Reload data instead of trying to process malformed response
      const status = await getCurrentStatus();
      const logs = await getTodayLogs();
      return { success: true };
    }
    
    // For time-out endpoint
    if (endpoint === '/time-out') {
      // Reload data instead of trying to process malformed response
      const status = await getCurrentStatus();
      const logs = await getTodayLogs();
      return { success: true };
    }
    
    // For other endpoints, return empty success
    return { success: true };
  }
};

async function getCurrentStatus() {
  return callApi('/status');
}

async function getTodayLogs() {
  return callApi('/today');
}

async function timeIn() {
  return callApi('/time-in', 'POST');
}

async function timeOut() {
  return callApi('/time-out', 'POST');
}

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
    username: userData.username,
    firstName: "",
    lastName: "",
    email: "",
  })

  const [timeStatus, setTimeStatus] = useState({
    isTimedIn: false,
    timeIn: null,
    timeOut: null,
  })

  const [timeRecords, setTimeRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Function to check if user is authenticated
  useEffect(() => {
    // Get the token from local storage
    const token = localStorage.getItem("token");
    
    if (!token) {
      setIsAuthenticated(false);
      setError('Not authenticated. Please log in.');
      return;
    }
    
    // Get the user object from local storage
    const userStr = localStorage.getItem("user");
    const userData = userStr ? JSON.parse(userStr) : null;
    
    if (!userData) {
      setIsAuthenticated(false);
      setError('User data not found. Please log in again.');
      return;
    }
    
    // Load employee info
    setEmployee({
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role
    });
    
    setIsAuthenticated(true);
  }, []);

  // Function to load time status and records
  const loadData = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      
      // Get current status
      const status = await getCurrentStatus();
      setTimeStatus(status);
      
      // Get today's records
      const logs = await getTodayLogs();
      console.log("Today's logs:", logs);
      setTimeRecords(logs);
      
      setError(null);

      const normalizedLogs = Array.isArray(logs) ? logs.map(log => ({
        id: log.timeLogId,
        timeIn: log.timeIn,
        timeOut: log.timeOut,
      })) : [];
      
      console.log("Today's logs (normalized):", normalizedLogs);
      setTimeRecords(normalizedLogs);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      
      const intervalId = setInterval(() => {
        loadData();
      }, 300000);
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);

  const handleTimeIn = async () => {
    try {
      setLoading(true);
      await timeIn();
      
      await loadData();
      setError(null);
    } catch (error) {
      console.error('Time in error:', error);
      setError('Failed to time in. Please try again.');
      try {
        await loadData();
      } catch (e) {
        // Ignore secondary errors
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleTimeOut = async () => {
    try {
      setLoading(true);
      await timeOut();
      
      await loadData();
      setError(null);
    } catch (error) {
      console.error('Time out error:', error);
      setError('Failed to time out. Please try again.');
      try {
        await loadData();
      } catch (e) {
        // Ignore secondary errors
      }
    } finally {
      setLoading(false);
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-xl font-bold">Authentication Required</h1>
          <p className="mb-6">Please log in to access time tracking features.</p>
          <Button onClick={() => window.location.href = "/"}>Go to Login</Button>
        </div>
      </div>
    );
  }

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

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

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
                      disabled={timeStatus.isTimedIn || loading}
                    >
                      <Clock className="mr-2 h-5 w-5" />
                      Time In
                    </Button>
                    <Button
                      variant="danger"
                      size="lg"
                      className="flex-1"
                      onClick={handleTimeOut}
                      disabled={!timeStatus.isTimedIn || loading}
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
                {loading ? (
                  <div className="flex h-40 items-center justify-center">
                    <LoadingSpinner size="8" text="Loading records..." />
                  </div>
                ) : timeRecords.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-center text-gray-500">No time records for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeRecords.map((record, index) => (
                      <div key={record.id || `record-${index}`} className="rounded-lg border p-4">
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
            © {new Date().getFullYear()} TechStaffHub. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-500">Developed by TechStaffHub</p>
        </div>
      </footer>
    </div>
  )
}