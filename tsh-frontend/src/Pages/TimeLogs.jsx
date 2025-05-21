import { useState, useEffect } from "react";
import { Calendar, Clock, Download, Filter, Search } from "lucide-react";
import { MainNav } from "../components/dashboard/MainNav";
import { UserNav } from "../components/dashboard/UserNav";
import { PageHeader } from "../components/dashboard/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner"; // Updated import path

function Card({ children, className }) {
  return <div className={`rounded-lg border bg-white shadow-sm ${className || ""}`}>{children}</div>;
}

function CardHeader({ children, className }) {
  return <div className={`p-6 pb-3 ${className || ""}`}>{children}</div>;
}

function CardTitle({ children, className }) {
  return <h3 className={`text-lg font-semibold ${className || ""}`}>{children}</h3>;
}

function CardDescription({ children }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}

function CardContent({ children }) {
  return <div className="p-6 pt-0">{children}</div>;
}

function Button({ children, variant, size, className, onClick }) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";

  const variantStyles = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-50",
  };

  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
  };

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
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

function AssignHrButton({ log, onAssign }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHr, setSelectedHr] = useState(null);
  const [hrList, setHrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHrList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/employee/available-hr', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch HR list');
      }

      const data = await response.json();
      setHrList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/time-logs/assign-hr/${log.timeLogId}?hrId=${selectedHr}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to assign HR');
      }

      onAssign();
      setIsOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          fetchHrList();
          setIsOpen(true);
        }}
        className="text-primary hover:text-primary/80 text-sm font-medium"
      >
        Assign HR
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign HR to Time Log</h3>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select HR
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedHr || ''}
                onChange={(e) => setSelectedHr(e.target.value)}
                disabled={loading}
              >
                <option value="">Select an HR</option>
                {hrList.map((hr) => (
                  <option key={hr.hrId} value={hr.hrId}>
                    {hr.firstName} {hr.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedHr || loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${!selectedHr || loading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
              >
                {loading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function TimeLogs() {
  const [employee, setEmployee] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@techstaffhub.com",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    // Fetch user profile and time logs
    const fetchUserData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Authentication token not found");
        }

        // Fetch user profile
        const profileResponse = await fetch('http://localhost:8080/employee/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile");
        }

        const profileData = await profileResponse.json();
        setEmployee({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
        });

        const logsResponse = await fetch('http://localhost:8080/api/time-logs', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!logsResponse.ok) {
          throw new Error("Failed to fetch time logs");
        }

        const logsData = await logsResponse.json();
        setLogs(logsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Filter logs based on search term and date filter
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.date?.includes(searchTerm) ||
      formatTime(log.timeIn)?.includes(searchTerm) ||
      formatTime(log.timeOut)?.includes(searchTerm) ||
      (log.totalHours?.toString() || "").includes(searchTerm);

    const matchesDate = dateFilter === "" || log.date === dateFilter;

    return matchesSearch && matchesDate;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateTotalHours = () => {
    return (filteredLogs.reduce((total, log) => total + (log.durationMinutes || 0), 0) / 60).toFixed(1);
  };

  const calculateAverageHours = () => {
    if (filteredLogs.length === 0) return "0.0";
    return (filteredLogs.reduce((total, log) => total + (log.durationMinutes || 0), 0) / filteredLogs.length / 60).toFixed(1);
  };

  const exportToCSV = () => {
    let csvContent = "Date,Time In,Time Out,Total Hours\n";

    filteredLogs.forEach((log) => {
      const date = `"${formatDate(log.date)}"`;
      const timeIn = `"${formatTime(log.timeIn)}"`;
      const timeOut = `"${formatTime(log.timeOut)}"`;
      const totalHours = `"${(log.durationMinutes / 60).toFixed(1)} hrs"`;

      csvContent += `${date},${timeIn},${timeOut},${totalHours}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAssignHr = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const logsResponse = await fetch('http://localhost:8080/api/time-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!logsResponse.ok) {
        throw new Error("Failed to fetch updated time logs");
      }

      const logsData = await logsResponse.json();
      setLogs(logsData);
    } catch (err) {
      setError(err.message);
    }
  };

  const fullName = `${employee.firstName} ${employee.lastName}`;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={() => (window.location.href = "/login")}
          >
            Return to Login
          </button>
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
                        setSearchTerm("");
                        setDateFilter("");
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredLogs.map((log) => (
                          <tr key={log.timeLogId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{formatDate(log.date)}</td>
                            <td className="px-4 py-3 text-sm">{formatTime(log.timeIn)}</td>
                            <td className="px-4 py-3 text-sm">{formatTime(log.timeOut)}</td>
                            <td className="px-4 py-3 text-sm font-medium">{((log.durationMinutes || 0) / 60).toFixed(1)} hrs</td>
                            <td className="px-4 py-3 text-sm">
                              <AssignHrButton log={log} onAssign={handleAssignHr} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
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
            © {new Date().getFullYear()} TechStaffHub. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-500">Developed by TechStaffHub</p>
        </div>
      </footer>
    </div>
  );
}