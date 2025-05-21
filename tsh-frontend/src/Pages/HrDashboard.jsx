import React, { useState, useEffect } from "react";
import { CalendarDays, Clock, PhilippinePeso, FileText, PieChart, UserCheck } from 'lucide-react';
import { HrNav } from "../components/dashboard/HrNav";
import { HrUser } from "../components/dashboard/HrUser";
import { HrHeader } from "../components/dashboard/HrHeader";
import { HrOverview } from "../components/dashboard/HrOverview";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";

function Progress({ value, className }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className || ""}`}>
      <div 
        className="bg-primary h-full rounded-full transition-all"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}

function Tabs({ defaultValue, children, className }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  const tabsList = children.find(child => child.type === TabsList);
  const tabsContents = children.filter(child => child.type === TabsContent);

  const clonedTabsList = tabsList ? 
    React.cloneElement(tabsList, { activeTab, setActiveTab }) : null;
  
  const activeContent = tabsContents.find(content => content.props.value === activeTab);
  
  return (
    <div className={className}>
      {clonedTabsList}
      {activeContent}
    </div>
  );
}

function TabsList({ children, activeTab, setActiveTab }) {
  const clonedChildren = React.Children.map(children, child => 
    React.cloneElement(child, { 
      isActive: child.props.value === activeTab,
      onClick: () => setActiveTab(child.props.value)
    })
  );
  
  return (
    <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
      {clonedChildren}
    </div>
  );
}

function TabsTrigger({ value, children, isActive, onClick }) {
  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
        isActive ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children, className }) {
  return <div className={className}>{children}</div>;
}

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

function Button({ children, variant, size, className, ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";
  
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
      {...props}
    >
      {children}
    </button>
  );
}

export default function HrDashboard() {
  const [hr, setHr] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hrList, setHrList] = useState([]);     // for all HRs
  
  // const fullName = `${hr.firstName} ${hr.lastName}`;
  const fullName = hr ? `${hr.firstName} ${hr.lastName}` : "";


  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    contact: "",
    position: "",
    baseSalary: "",
    role: "" 
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);


    const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const username = (employee.user ?? "").toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) || username.includes(search);
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getEndpoint = () => {
    if (formData.role === "HR") return "http://localhost:8080/hr/create-hr";
    if (formData.role === "EMPLOYEE") return "http://localhost:8080/hr/create-employee";
    return null; 
  };

   

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const endpoint = getEndpoint();


  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          baseSalary: parseFloat(formData.baseSalary || 0), 
        }),
      });

    

    if (!formData.role) {
      setFormError("Please select a role.");
      setFormLoading(false);
      return;
    }
  
      if (!response.ok) {
        throw new Error(data || "Failed to create employee");
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
      });
  
      alert(data || "Employee created successfully!");
   
    } catch (error) {
      setFormError(error.message || "Failed to create employee");
    } finally {
      setFormLoading(false);
    }
    return;
  };
  

 
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
      role: employee.role
    });
    setActiveTab('createEmployee');
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
  const response = await fetch("http://localhost:8080/hr/create-employee", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      ...formData,
      baseSalary: parseFloat(formData.baseSalary || 0)
    })
  });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }


      setEmployees(employees.filter(emp => emp.employeeId !== employeeId));
      alert("Employee deleted successfully");
    } catch (error) {
      alert(error.message);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      setEmployeesLoading(true);
      setEmployeesError("");
      setIsLoading(true);
      setError("");
  
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      try {
        // Use the "me" endpoint to get current user's profile
        const response = await fetch("http://localhost:8080/hr/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const responseClone = response.clone();
          let errorMessage = `Server error: ${response.status}`;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            try {
              const text = await responseClone.text();
              if (text) errorMessage += ` - ${text}`;
            } catch (textError) {
              console.error("Failed to read response body", textError);
            }
          }
          
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/unauthorized");
            return;
          } 
          else if (response.status === 403) {
            navigate("/403");
            return; 
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setHr({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          ...data,
        });
      } catch (fetchError) {
        console.error("API fetch failed:", fetchError);
        setError(fetchError.message || "Failed to load employee data");
      } finally {
        setIsLoading(false);
      }
    
      const endpoints = {
        EMPLOYEE: "http://localhost:8080/hr/all-employee",
        HR: "http://localhost:8080/hr/all-hr"
      };
  
      try {
   
        const employeeResponse = await fetch(endpoints.EMPLOYEE, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
  
        if (!employeeResponse.ok) throw new Error("Failed to fetch employees");
        const employeeData = await employeeResponse.json();
  
  
        const hrResponse = await fetch(endpoints.HR, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
  
        if (!hrResponse.ok) throw new Error(`Server responded with status: ${hrResponse.status}`);
        const contentType = hrResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }
  
        const hrData = await hrResponse.json();
  
 
        const hrList = Array.isArray(hrData) ? hrData : [hrData];
        const combinedData = [...employeeData, ...hrList];
  
        setEmployees(combinedData);
        setHrList(hrList);
        // setHr(hrData); 
  
      } catch (error) {
        console.error("Fetch error:", error);
  
        if (process.env.NODE_ENV === 'development') {
          console.warn("Using fallback dev data");
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
              role: ""
            }
          ]);
          
        } else {
          setEmployeesError(error.message);
          setError(error.message);
        }
      } finally {
        setEmployeesLoading(false);
        setIsLoading(false);
      }
    };
    console.log("HR object changed:", hr);
  
    fetchData();
  }, []);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500">Error: {error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  function AttendanceOverview() {
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
  
    useEffect(() => {
      const fetchAttendanceData = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch("http://localhost:8080/hr/attendance-overview", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
  
          if (!response.ok) {
            throw new Error("Failed to fetch attendance data");
          }
  
          const data = await response.json();
          setAttendanceData(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchAttendanceData();
    }, []);
  
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <p>Loading attendance data...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="text-center text-red-500 py-8">
          Error: {error}
        </div>
      );
    }
  
    if (!attendanceData) {
      return (
        <div className="text-center py-8">
          No attendance data available
        </div>
      );
    }
  
    // Calculate attendance percentage - PROPERLY FIXED VERSION
    const attendancePercentage = attendanceData.totalEmployees > 0 
    ? Math.round((attendanceData.totalPresentDays / (attendanceData.totalEmployees * 30)) * 100)
    : 0;
  
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-lg border p-4">
            <div className="text-sm text-gray-500">Total Employees</div>
            <div className="text-2xl font-semibold">
              {attendanceData.totalEmployees}
            </div>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="text-sm text-gray-500">Present Days (30 days)</div>
            <div className="text-2xl font-semibold">
              {attendanceData.totalPresentDays}
            </div>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="text-sm text-gray-500">Average Hours/Day</div>
            <div className="text-2xl font-semibold">
              {attendanceData.averageHoursPerDay} hrs
            </div>
          </div>
        </div>
  
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Attendance Rate</h3>
            <span className="text-sm font-medium">
              {attendancePercentage}%
            </span>
          </div>
          <Progress value={attendancePercentage} />
        </div>
  
         
        <div className="space-y-4">
          <h3 className="font-medium">Total Worked Hours</h3>
          <div className="text-2xl font-semibold">
            {Math.round(attendanceData.totalWorkedMinutes / 60)} hours
          </div>
        </div>
        <AttendanceCalendar />
      </div>
    );
  }

  function AttendanceCalendar() {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({
      employee: "",
      month: new Date().getMonth() + 1,
      year: 2025, // Default to 2025 as requested
      status: ""
    });
    const [employees, setEmployees] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          
          // Fetch employees for filter dropdown
          const empResponse = await fetch("http://localhost:8080/hr/all-employee", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const empData = await empResponse.json();
          setEmployees(empData);
  
          // Fetch attendance data with filters
          const params = new URLSearchParams();
          if (filters.employee) params.append('employeeId', filters.employee);
          if (filters.month) params.append('month', filters.month);
          if (filters.year) params.append('year', filters.year);
          if (filters.status) params.append('status', filters.status);
  
          const response = await fetch(`http://localhost:8080/hr/attendance-calendar?${params.toString()}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (!response.ok) throw new Error("Failed to fetch attendance data");
          const data = await response.json();
          setAttendanceData(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [filters]);
  
    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const getStatusColor = (status) => {
      return status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    };
  
    if (loading) {
      return <div className="text-center py-4">Loading attendance calendar...</div>;
    }
  
    if (error) {
      return <div className="text-center text-red-500 py-4">{error}</div>;
    }
  
    // Group data by employee
    const groupedData = attendanceData.reduce((acc, record) => {
      if (!acc[record.employeeId]) {
        acc[record.employeeId] = {
          employee: record.employee,
          records: {}
        };
      }
      acc[record.employeeId].records[record.date] = record.status;
      return acc;
    }, {});
  
    // Generate days for the selected month
    const daysInMonth = new Date(filters.year, filters.month, 0).getDate();
    const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);
  
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
          <CardDescription>View employee attendance by day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee</label>
                <select
                  name="employee"
                  value={filters.employee}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1, 1).toLocaleString('default', {month: 'long'})}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input
                  type="number"
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-md"
                  min="2025"
                  max="2030"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>
            </div>
  
            {/* Calendar Table */}
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left border">Employee</th>
                    {daysArray.map(day => (
                      <th key={day} className="p-2 text-center border w-8">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedData).map(([employeeId, {employee, records}]) => (
                    <tr key={employeeId} className="border-t hover:bg-gray-50">
                      <td className="p-3 border">
                        {employee.firstName} {employee.lastName}
                      </td>
                      {daysArray.map(day => {
                        const dateStr = `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const status = records[dateStr] || 'ABSENT';
                        return (
                          <td key={day} className="p-1 text-center border">
                            <span className={`inline-block w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStatusColor(status)}`}>
                              {status.charAt(0)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center mr-2">P</span>
                <span>Present</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center mr-2">A</span>
                <span>Absent</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <HrNav userType="hr" />
          </div>
          <HrUser userName={fullName} userEmail={hr.email} />
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <HrHeader heading="Hr Dashboard" subheading={`Welcome back, ${fullName}`}>
            <div className="flex items-center gap-2">
            <Button 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/HrLeaveRequests")}>See Leave Requests
            </Button>
            </div>
          </HrHeader>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="viewEmployee">View all Employees/HR</TabsTrigger>
              <TabsTrigger value="createEmployee">Create Employee/HR</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <HrOverview
                  title="Available Leave"
                  value="15 days"
                  description="Out of 24 days annual leave"
                  icon={CalendarDays}
                />
                <HrOverview
                  title="Payroll"
                  value="Generate Payroll "
                  description=""
                  icon={PhilippinePeso}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => (window.location.href = "/PayrollPage")}
                />
                <HrOverview
                  title="Logs"
                  value="View all employee's Logs"
                  description="Check the employee's attendance record"
                  icon={FileText}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => (window.location.href = "/EmployeeTimeLogs")}
                />
                <HrOverview title="Attendance" value="94%" description="Last 30 days" icon={UserCheck} />
                <HrOverview title="Overtime" value="8 hours" description="This month" icon={Clock} />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent activities and notifications</CardDescription>
                  </CardHeader>
                  
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Benefits Overview</CardTitle>
                    <CardDescription>Your current benefits and utilization</CardDescription>
                  </CardHeader>            
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Holidays</CardTitle>
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                   
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Payslips</CardTitle>
                    <FileText className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                   
                  </CardContent>
                </Card>

               
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Overview</CardTitle>
                  <CardDescription>Company-wide attendance statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <AttendanceOverview />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payroll" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
              </div>
            </TabsContent>

            {/*fetch Users*/}
            <TabsContent value="viewEmployee" className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-semibold">Employee List</h2>
                  <p className="text-gray-500 mt-1">View all employees and HR staff</p>
                  {employeesError && (
                    <p className="text-red-500 mt-2">{employeesError}</p>
                  )}
                  <div className="mt-4 relative">
                    <input
                      type="text"
                      placeholder="Search by name or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <svg
                      className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {employeesLoading ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">Loading employees...</p>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No list of Employee and HR</p>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No employees found matching your search</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-center">
                         
                          <th className="p-4 font-medium">Username</th>
                          <th className="p-4 font-medium">Name</th>
                          <th className="p-4 font-medium">Email</th>
                          <th className="p-4 font-medium">Contact</th>
                          <th className="p-4 font-medium">Position</th>
                          <th className="p-4 font-medium">Base Salary</th>
                          <th className="p-4 font-medium">Role</th>
                          <th className="p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((employee) => (
                          <tr 
                            key={employee.employeeId}
                            className="border-t hover:bg-gray-50"
                          >
                            
                            <td className="p-4">{employee.username}</td>
                            <td className="p-4">
                              {employee.firstName} {employee.lastName}
                            </td>
                            <td className="p-4">{employee.email}</td>
                            <td className="p-4">{employee.contact}</td>
                            <td className="p-4">{employee.position}</td>
                            <td className="p-4">₱{employee.baseSalary.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                employee.role === 'hr' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {employee.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEdit(employee)}
                              >
                                Edit
                              </Button>
                              </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            {/*fetch Users*/}





            {/*Create Employee Form*/}
            <TabsContent value="createEmployee" className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold">Create New Employee/HR</h2>
                  <p className="text-gray-500 mt-1">Enter the details of the new employee/hr</p>
                  {formError && <p className="text-red-500 mt-2">{formError}</p>}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* First Name and Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        placeholder="Firstname"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        placeholder="Lastname"
                      />
                    </div>

                    {/* Username and Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        placeholder="Username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        placeholder="Password"
                      />
                    </div>

                    {/* Email and Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        placeholder="Position"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact
                      </label>
                      <input
                        type="text"
                        name="contact"
                        value={formData.contact}                        
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        placeholder="Contact"
                      />
                    </div>

                    {/* Base Salary and Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Salary
                      </label>
                      <input
                        type="number"
                        name="baseSalary"
                        value={formData.baseSalary}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                        required
                      >
                        <option>Select Role</option>
                        <option value="EMPLOYEE">EMPLOYEE</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      className="px-4 py-2 border rounded-md hover:bg-gray-50"
                      onClick={() => setActiveTab('overview')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                      {formLoading ? "Creating..." : "Create Employee"}
                    </button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
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
  );
}