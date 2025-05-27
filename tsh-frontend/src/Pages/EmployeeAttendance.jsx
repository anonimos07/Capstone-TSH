import React, { useState, useEffect } from "react";
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { MainNav } from "../components/dashboard/MainNav";
import { UserNav } from "../components/dashboard/UserNav";
import { PageHeader } from "../components/dashboard/PageHeader";
import { Button } from "../components/ui/button";
import { format, parseISO } from "date-fns";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const EmployeeAttendance = () => {
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); 

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch("http://localhost:8080/employee/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load employee data");
        }

        const data = await response.json();
        setEmployee({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error("Error fetching employee data:", err);
      }
    };

    fetchEmployeeData();
  }, []);

  const fetchAttendanceData = async (year, month) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `http://localhost:8080/employee/attendance?year=${year}&month=${month}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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

  useEffect(() => {
    fetchAttendanceData(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [currentDate]);

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const renderCalendar = () => {
    if (!attendanceData) return null;

    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const weeks = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      if (day > daysInMonth) break;

      const days = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startingDay) || day > daysInMonth) {
          days.push(<td key={j} className="p-2"></td>);
        } else {
          const currentDate = new Date(year, month, day);
          const dateStr = format(currentDate, "yyyy-MM-dd");

          const record = attendanceData.attendance[dateStr];

          const isPast = currentDate < today.setHours(0, 0, 0, 0);
          const status = record?.status || (isPast ? "A" : null);

          const rawTimeIn = record?.timeIn;
          const rawTimeOut = record?.timeOut;

          const timeIn = rawTimeIn ? format(parseISO(rawTimeIn), "hh:mm a") : "-";
          const timeOut = rawTimeOut ? format(parseISO(rawTimeOut), "hh:mm a") : "-";

          days.push(
            <td key={j} className="p-2 border text-center text-xs">
              <div className="flex flex-col items-center">
                <span className="font-medium">{day}</span>
                <span
                  className={`font-bold ${
                    status === "P" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {status}
                </span>
                <span className="text-gray-500">In: {timeIn}</span>
                <span className="text-gray-500">Out: {timeOut}</span>
              </div>
            </td>
          );
          day++;
        }
      }
      weeks.push(<tr key={i}>{days}</tr>);
    }

    return weeks;
  };

  if (loading) {
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
          <PageHeader
            heading="My Attendance"
            subheading="View your attendance records"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/TimeTracking")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Time Tracking
              </Button>
            </div>
          </PageHeader>

          <div className="mt-6 space-y-6">
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {format(currentDate, "MMMM yyyy")}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date(2025, 4, 1))} // Reset to May 2025
                    >
                      Current Month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day) => (
                            <th
                              key={day}
                              className="p-2 border text-center text-sm font-medium"
                            >
                              {day}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>{renderCalendar()}</tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Present Days
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-green-600">
                      {attendanceData &&
                        Object.values(attendanceData.attendance).filter((v) => v.status === "P").length}
                    </h2>
                  </div>
                  <CalendarDays className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Absent Days
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-red-600">
                      {attendanceData &&
                        Object.values(attendanceData.attendance).filter((v) => v.status === "A").length}
                    </h2>
                  </div>
                  <CalendarDays className="h-8 w-8 text-red-400" />
                </div>
              </div>

              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Current Month
                    </p>
                    <h2 className="mt-2 text-3xl font-bold">
                      {format(currentDate, "MMMM yyyy")}
                    </h2>
                  </div>
                  <CalendarDays className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} TechStaffHub. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-500">
            Developed by TechStaffHub
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EmployeeAttendance;