import React, { useState, useEffect } from "react"
import { CalendarDays, Clock, FileText, PieChart, UserCheck } from "lucide-react"
import { MainNav } from "../components/dashboard/MainNav"
import { UserNav } from "../components/dashboard/UserNav"
import { PageHeader } from "../components/dashboard/PageHeader"

function Progress({ value, className }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className || ""}`}>
      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${value}%` }}></div>
    </div>
  )
}

function Tabs({ defaultValue, children, className }) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  const tabsList = children.find((child) => child.type === TabsList)
  const tabsContents = children.filter((child) => child.type === TabsContent)

  const clonedTabsList = tabsList ? React.cloneElement(tabsList, { activeTab, setActiveTab }) : null

  const activeContent = tabsContents.find((content) => content.props.value === activeTab)

  return (
    <div className={className}>
      {clonedTabsList}
      {activeContent}
    </div>
  )
}

function TabsList({ children, activeTab, setActiveTab }) {
  const clonedChildren = React.Children.map(children, (child) =>
    React.cloneElement(child, {
      isActive: child.props.value === activeTab,
      onClick: () => setActiveTab(child.props.value),
    }),
  )

  return <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">{clonedChildren}</div>
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
  )
}

function TabsContent({ value, children, className }) {
  return <div className={className}>{children}</div>
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

function Button({ children, variant, size, className, ...props }) {
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
      {...props}
    >
      {children}
    </button>
  )
}

function OverviewCard({ title, value, description, icon: Icon, className, onClick }) {
  return (
    <div className={`rounded-lg border bg-white p-6 shadow-sm ${className || ""}`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold">{value}</h2>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
        {Icon && <Icon className="h-8 w-8 text-gray-400" />}
      </div>
    </div>
  )
}

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        try {
          // Use the "me" endpoint to get current user's profile
          const response = await fetch("http://localhost:8080/employee/me", {
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
            
            if (response.status === 401 || response.status === 403) {
              // Handle unauthorized/forbidden - might need to redirect to login
              localStorage.removeItem("token"); // Clear invalid token
              throw new Error("Session expired. Please log in again.");
            }
            
            throw new Error(errorMessage);
          }

          const data = await response.json();
          setEmployee({
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
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(err.message || "An unexpected error occurred");
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading employee data...</p>
        </div>
      </div>
    )
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
    )
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
          <PageHeader heading="Employee Dashboard" subheading={`Welcome back, ${fullName}`}>
            <div className="flex items-center gap-2">
              <Button>Request Leave</Button>
            </div>
          </PageHeader>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <OverviewCard
                  title="Time In/Out"
                  value="Track Hours"
                  description="Record your daily attendance"
                  icon={Clock}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => (window.location.href = "/TimeTracking")}
                />
                <OverviewCard
                  title="Logs"
                  value="View History"
                  description="Check your attendance records"
                  icon={FileText}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => (window.location.href = "/TimeLogs")}
                />
                <OverviewCard title="Attendance"  icon={UserCheck} />
                <OverviewCard title="Overtime"  icon={Clock} />
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
                  
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Payslips</CardTitle>
                    <FileText className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  
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
                        
                      </div>
                      <div className="space-y-2 rounded-lg border p-4">
                        <div className="text-sm text-gray-500">Absent Days</div>
                        
                      </div>
                      <div className="space-y-2 rounded-lg border p-4">
                        <div className="text-sm text-gray-500">Late Arrivals</div>
                        
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
                  
                      <Button>Download Payslip</Button>
                    
                </CardContent>
              </Card>
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
  )
}
