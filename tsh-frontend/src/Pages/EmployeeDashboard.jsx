import React, { useState, useEffect } from "react";
import { DollarSign, CalendarDays, Clock, FileText, PieChart, UserCheck, ChevronDown, ChevronUp, Filter, RefreshCw } from "lucide-react";
import { MainNav } from "../components/dashboard/MainNav";
import { UserNav } from "../components/dashboard/UserNav";
import { PageHeader } from "../components/dashboard/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner"; // Import LoadingSpinner

// Utility functions
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getDaysBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Status badge component
const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 text-xs rounded-full ${
    status === "APPROVED" 
      ? "bg-green-100 text-green-800" 
      : status === "REJECTED" 
        ? "bg-red-100 text-red-800" 
        : "bg-yellow-100 text-yellow-800"
  }`}>
    {status}
  </span>
);

// Leave Request Card component
const LeaveRequestCard = ({ request, onClick }) => (
  <div 
    key={request.id} 
    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium flex items-center gap-2">
          {request.leaveType} Leave
          <StatusBadge status={request.status} />
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          {formatDate(request.startDate)} - {formatDate(request.endDate)} 
          <span className="ml-2">({getDaysBetweenDates(request.startDate, request.endDate)} days)</span>
        </p>
        <p className="text-sm mt-2 line-clamp-2">{request.reason}</p>
        {/* Add HR information */}
        {request.assignedHR && (
          <p className="text-xs text-gray-500 mt-1">
            Assigned to: {request.assignedHR.firstName} {request.assignedHR.lastName}
          </p>
        )}
      </div>
      {request.status === "PENDING" && (
        <button 
          className="text-xs text-gray-500 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            // Add cancel functionality here
          }}
        >
          Cancel
        </button>
      )}
    </div>
  </div>
);

// Progress component
function Progress({ value, className }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className || ""}`}>
      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${value}%` }}></div>
    </div>
  );
}

// Tabs components
function Tabs({ defaultValue, children, className }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const tabsList = children.find((child) => child.type === TabsList);
  const tabsContents = children.filter((child) => child.type === TabsContent);

  const clonedTabsList = tabsList ? React.cloneElement(tabsList, { activeTab, setActiveTab }) : null;

  const activeContent = tabsContents.find((content) => content.props.value === activeTab);

  return (
    <div className={className}>
      {clonedTabsList}
      {activeContent}
    </div>
  );
}

function TabsList({ children, activeTab, setActiveTab }) {
  const clonedChildren = React.Children.map(children, (child) =>
    React.cloneElement(child, {
      isActive: child.props.value === activeTab,
      onClick: () => setActiveTab(child.props.value),
    }),
  );

  return <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">{clonedChildren}</div>;
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

// Card components
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

// Button component
function Button({ children, variant, size, className, ...props }) {
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
      className={`${baseStyles} ${variantStyles[variant || "default"]} ${sizeStyles[size || "default"]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

// OverviewCard component
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
  );
}

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Leave requests state
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveRequestsLoading, setLeaveRequestsLoading] = useState(false);
  const [leaveRequestsError, setLeaveRequestsError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortField, setSortField] = useState("startDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        const response = await fetch("http://localhost:8080/employee/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to load employee data");
        }

        const data = await response.json();
        setEmployee({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          ...data,
        });
        
        await fetchLeaveRequests();
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLeaveRequestsLoading(true);
      setLeaveRequestsError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch("http://localhost:8080/employee/leave-requests", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }

      const data = await response.json();
      setLeaveRequests(data);
    } catch (err) {
      setLeaveRequestsError(err.message);
    } finally {
      setLeaveRequestsLoading(false);
    }
  };

  // Filter and sort leave requests
  const filteredRequests = leaveRequests.filter(request => 
    filterStatus === "ALL" || request.status === filterStatus
  );

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

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
              <Button onClick={() => (window.location.href = "/LeaveRequest")}>Request Leave</Button>
            </div>
          </PageHeader>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
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
                  description="Check your logs"
                  icon={FileText}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => (window.location.href = "/TimeLogs")}
                />
                <OverviewCard
                  title="Attendance"
                  value="View Attendance"
                  description="Check your attendance records"
                  icon={UserCheck}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => (window.location.href = "/EmployeeAttendance")}
                />
                <OverviewCard
                  title="Overtime"
                  value="Payslips & Tax"
                  description="View your payslips and tax details"
                  icon={DollarSign}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => (window.location.href = "/EmployeePayslip")}
                />
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
                
                <Card className="col-span-7">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>My Leave Requests</CardTitle>
                        <CardDescription>Your recent and upcoming leave requests</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filters
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={fetchLeaveRequests}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => (window.location.href = "/LeaveRequest")}
                        >
                          + New Request
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showFilters && (
                      <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                            >
                              <option value="ALL">All Statuses</option>
                              <option value="PENDING">Pending</option>
                              <option value="APPROVED">Approved</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                              value={sortField}
                              onChange={(e) => setSortField(e.target.value)}
                            >
                              <option value="startDate">Start Date</option>
                              <option value="endDate">End Date</option>
                              <option value="leaveType">Leave Type</option>
                              <option value="status">Status</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                              value={sortDirection}
                              onChange={(e) => setSortDirection(e.target.value)}
                            >
                              <option value="desc">Newest First</option>
                              <option value="asc">Oldest First</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {leaveRequestsLoading ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="8" text="Loading leave requests..." />
                      </div>
                    ) : leaveRequestsError ? (
                      <div className="p-4 rounded-lg bg-red-50">
                        <p className="text-red-600">Error: {leaveRequestsError}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2"
                          onClick={fetchLeaveRequests}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : sortedRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">No leave requests found</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2"
                          onClick={() => (window.location.href = "/LeaveRequest")}
                        >
                          Create New Request
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentItems.map((request) => (
                          <LeaveRequestCard 
                            key={request.id} 
                            request={request}
                            onClick={() => {
                              // Navigate to leave request details
                              // window.location.href = `/leave-requests/${request.id}`;
                            }}
                          />
                        ))}
                        
                        {totalPages > 1 && (
                          <div className="flex justify-between items-center mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(currentPage - 1)}
                            >
                              Previous
                            </Button>
                            <span className="text-sm text-gray-500">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(currentPage + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
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

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time Off Balance</CardTitle>
                    <PieChart className="h-4 w-4 text-gray-500" />
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
          </Tabs>
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