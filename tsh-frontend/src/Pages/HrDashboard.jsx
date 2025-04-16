import React, { useState, useEffect } from "react";
import { CalendarDays, Clock, PhilippinePeso, FileText, PieChart, UserCheck } from 'lucide-react';
import { HrNav } from "../components/dashboard/HrNav";
import { HrUser } from "../components/dashboard/HrUser";
import { HrHeader } from "../components/dashboard/HrHeader";
import { HrOverview } from "../components/dashboard/HrOverview";
import { Link } from "react-router-dom";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add form state for Create Employee
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    contact: "",
    position: "",
    baseSalary: "",
    role: "" // Default to EMPLOYEE
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Add filtered employees computation
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    // const username = employee.username.toLowerCase();
    const username = (employee.user ?? "").toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) || username.includes(search);
  });

  // Form handling functions
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
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          baseSalary: parseFloat(formData.baseSalary || 0), // Ensure it's a number
        }),
      });

      // const responseText = await response.text();
    // console.log("Server Response:", responseText);
  
      if (!response.ok) {
        throw new Error(data || "Failed to create employee");
      }
  
      // Reset form after successful creation
      setFormData({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        contact: "",
        position: "",
        baseSalary: "",
        role: "", // Default to EMPLOYEE
      });
  
      alert(data || "Employee created successfully!");
      // setActiveTab("overview");
    } catch (error) {
      setFormError(error.message || "Failed to create employee");
    } finally {
      setFormLoading(false);
    }
  };
  

  // Add handlers for edit and delete
  const handleEdit = (employee) => {
    // Pre-fill the create form with employee data
    setFormData({
      employeeId: employee.employeeId,
      username: employee.username,
      password: "", // Don't pre-fill password for security
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      contact: employee.contact,
      position: employee.position,
      baseSalary: employee.baseSalary,
      role: employee.role
    });
    // Switch to create/edit tab
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
      baseSalary: parseFloat(formData.baseSalary || 0) // Make sure baseSalary is a number
    })
  });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      // Remove employee from list
      setEmployees(employees.filter(emp => emp.employeeId !== employeeId));
      alert("Employee deleted successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  // Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      setEmployeesLoading(true);
      setEmployeesError("");
      
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch("http://localhost:8080/hr/all-employee", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }

        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        setEmployeesError(error.message);
        // For development, add some sample data
        if (process.env.NODE_ENV === 'development') {
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
            },
          ]);
        }
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchHrData = async () => {
      setIsLoading(true);
  
      const token = localStorage.getItem('token');
  
      try {
        const response = await fetch("http://localhost:8080/hr/all-hr", {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          // Remove this unless you're using cookies/sessions
          // credentials: 'include'
        });
  
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
  
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }
  
        const data = await response.json();
        setHr(data);
  
      } catch (err) {
        console.error('API fetch failed:', err);
  
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using fallback HR data in development environment');
          setHr({
            firstName: "bre",
            lastName: "bre",
            email: "bre@gmail.com"
          });
        } else {
          setError(err.message || "Failed to fetch HR data");
        }
  
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchHrData();
  }, []);
  

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading hr data...</p>
        </div>
      </div>
    );
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

  const fullName = `${hr.firstName} ${hr.lastName}`;

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
              <Button>Request Leave</Button>
            </div>
          </HrHeader>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
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
                  title="Next Payday"
                  value="15 Apr 2025"
                  description="Estimated amount: ₱5,264"
                  icon={PhilippinePeso}
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
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Leave Request Approved",
                          description: "Your leave request for April 14-16 has been approved",
                          date: "2 hours ago",
                        },
                        {
                          title: "Payslip Generated",
                          description: "Your March 2025 payslip is now available for download",
                          date: "Yesterday",
                        },
                        {
                          title: "Performance Review",
                          description: "Your quarterly performance review is scheduled for April 25",
                          date: "3 days ago",
                        },
                        {
                          title: "Training Completion",
                          description: "You've completed the required compliance training",
                          date: "1 week ago",
                        },
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-4 rounded-lg border p-3">
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <div className="text-xs text-gray-500">{item.date}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Benefits Overview</CardTitle>
                    <CardDescription>Your current benefits and utilization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div>Health Insurance</div>
                          <div className="font-medium">Active</div>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div>Retirement Plan</div>
                          <div className="font-medium">₱12,450 contributed</div>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div>Professional Development</div>
                          <div className="font-medium">₱800 used of ₱1,500</div>
                        </div>
                        <Progress value={53} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div>Wellness Program</div>
                          <div className="font-medium">25 points earned</div>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Holidays</CardTitle>
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Good Friday", date: "April 18, 2025" },
                        { name: "Labor Day", date: "May 1, 2025" },
                        { name: "Independence Day", date: "June 12, 2025" },
                      ].map((holiday, index) => (
                        <div key={index} className="flex justify-between">
                          <p className="text-sm">{holiday.name}</p>
                          <p className="text-sm text-gray-500">{holiday.date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Payslips</CardTitle>
                    <FileText className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { period: "March 2025", amount: "₱5,264.00", status: "Paid" },
                        { period: "February 2025", amount: "₱5,264.00", status: "Paid" },
                        { period: "January 2025", amount: "₱5,264.00", status: "Paid" },
                      ].map((payslip, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <p className="text-sm">{payslip.period}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{payslip.amount}</p>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tax Summary</CardTitle>
                    <PieChart className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { type: "Income Tax", amount: "₱450.20", percentage: "13.9%" },
                        { type: "Social Security", amount: "₱250.10", percentage: "7.7%" },
                        { type: "Medicare", amount: "₱65.30", percentage: "2.0%" },
                        { type: "Other Deductions", amount: "₱120.40", percentage: "3.7%" },
                      ].map((tax, index) => (
                        <div key={index} className="flex justify-between">
                          <p className="text-sm">{tax.type}</p>
                          <div className="flex gap-2">
                            <p className="text-sm text-gray-500">{tax.percentage}</p>
                            <p className="text-sm font-medium">{tax.amount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Overview</CardTitle>
                  <CardDescription>Your attendance records for the current month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2 rounded-lg border p-4">
                        <div className="text-sm text-gray-500">Present Days</div>
                        <div className="text-2xl font-bold">18</div>
                      </div>
                      <div className="space-y-2 rounded-lg border p-4">
                        <div className="text-sm text-gray-500">Absent Days</div>
                        <div className="text-2xl font-bold">0</div>
                      </div>
                      <div className="space-y-2 rounded-lg border p-4">
                        <div className="text-sm text-gray-500">Late Arrivals</div>
                        <div className="text-2xl font-bold">2</div>
                      </div>
                    </div>

                    <div className="rounded-lg border">
                      <div className="grid grid-cols-7 gap-px bg-gray-100">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                          <div key={day} className="bg-white p-2 text-center text-sm font-medium">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-px bg-gray-100">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                          let status = "present";
                          if (date > 20) status = "future";
                          if (date === 5 || date === 12) status = "late";
                          if (date === 6 || date === 13) status = "weekend";

                          return (
                            <div
                              key={date}
                              className={`bg-white p-2 text-center ${
                                status === "present"
                                  ? "text-green-600"
                                  : status === "late"
                                    ? "text-amber-600"
                                    : status === "weekend"
                                      ? "text-gray-500"
                                      : "text-gray-500"
                              }`}
                            >
                              <div className="text-sm">{date}</div>
                              <div className="text-xs">
                                {status === "present" && "9:00 - 5:00"}
                                {status === "late" && "9:15 - 5:00"}
                                {status === "weekend" && "Off"}
                                {status === "future" && "-"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payroll" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Salary Breakdown</CardTitle>
                  <CardDescription>Your current salary components and deductions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Earnings</h3>
                      <div className="space-y-1 rounded-lg border p-4">
                        {[
                          { type: "Basic Salary", amount: "₱5,000.00" },
                          { type: "Housing Allowance", amount: "₱600.00" },
                          { type: "Transportation Allowance", amount: "₱300.00" },
                          { type: "Overtime (8 hours)", amount: "₱250.00" },
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between py-1">
                            <span className="text-sm">{item.type}</span>
                            <span className="text-sm font-medium">{item.amount}</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-medium">Total Earnings</span>
                          <span className="font-medium">₱6,150.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Deductions</h3>
                      <div className="space-y-1 rounded-lg border p-4">
                        {[
                          { type: "Income Tax", amount: "₱450.20" },
                          { type: "Social Security", amount: "₱250.10" },
                          { type: "Medicare", amount: "₱65.30" },
                          { type: "Health Insurance", amount: "₱120.40" },
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between py-1">
                            <span className="text-sm">{item.type}</span>
                            <span className="text-sm font-medium">{item.amount}</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-medium">Total Deductions</span>
                          <span className="font-medium">₱886.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4 bg-gray-50">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold">Net Salary</span>
                        <span className="text-lg font-bold">₱5,264.00</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>Download Payslip</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                        <tr className="bg-gray-50 text-left">
                          <th className="p-4 font-medium">Employee ID</th>
                          <th className="p-4 font-medium">Username</th>
                          <th className="p-4 font-medium">Name</th>
                          <th className="p-4 font-medium">Email</th>
                          <th className="p-4 font-medium">Contact</th>
                          <th className="p-4 font-medium">Position</th>
                          <th className="p-4 font-medium">Base Salary</th>
                          <th className="p-4 font-medium">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((employee) => (
                          <tr 
                            key={employee.employeeId}
                            className="border-t hover:bg-gray-50"
                          >
                            <td className="p-4">{employee.employeeId}</td>
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
 {/*Create Employee Form*/}





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