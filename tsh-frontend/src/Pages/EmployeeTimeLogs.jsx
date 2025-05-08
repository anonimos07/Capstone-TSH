import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseISO, format as formatDate } from "date-fns";
import { HrNav } from "../components/dashboard/HrNav";
import { HrUser } from "../components/dashboard/HrUser";
import { useNavigate } from "react-router-dom";

export function EmployeeTimeLogs() {
  const [timeLogs, setTimeLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedLog, setEditedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch all time logs
  const fetchTimeLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching logs with token:", token ? `${token.substring(0, 15)}...` : "No token found");
      
      const response = await fetch("http://localhost:8080/api/hr/time-logs/assigned-logs", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
      });
      
      if (response.status === 403) {
        console.error("Authorization failed when fetching logs (403 Forbidden)");
        setError("Authentication failed - please log in again");
        return;
      }
      
      if (!response.ok) throw new Error(`Failed to fetch time logs: ${response.status}`);
      
      const data = await response.json();
      console.log("Successfully fetched logs:", data);
      setTimeLogs(data);
    } catch (error) {
      setError(`Failed to load time logs: ${error.message}`);
      console.error("Error fetching time logs:", error);
    }
  };

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  // Handle opening the edit modal
  const handleEdit = (log) => {
    console.log("Editing log:", log);
    
    // Ensure we have the employee ID
    const employeeId = log.employee?.employeeId || log.employeeId;
    if (!employeeId) {
      setError("Could not determine employee ID");
      return;
    }
  
    setSelectedLog(log);
    setEditedLog({
      timeLogId: log.timeLogId,
      employeeId: employeeId, // Use the properly extracted ID
      timeIn: formatDate(new Date(log.timeIn), "yyyy-MM-dd'T'HH:mm"),
      timeOut: formatDate(new Date(log.timeOut), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsModalOpen(true);
  };

  // Handle saving the edited log
  const handleSave = async () => {
    setIsLoading(true);
    setError("");
  
    try {
      // Format dates exactly as expected by the backend
      const timeInDate = parseISO(editedLog.timeIn);
      const timeOutDate = parseISO(editedLog.timeOut);
      
      const formattedLog = {
        timeLogId: editedLog.timeLogId,
        employeeId: editedLog.employeeId,
        timeIn: formatDate(timeInDate, "yyyy-MM-dd HH:mm:ss"),  // Removed .SSS to match your Postman example
        timeOut: formatDate(timeOutDate, "yyyy-MM-dd HH:mm:ss"), // Removed .SSS to match your Postman example
      };
  
      console.log("Sending to backend:", formattedLog);
      
      const token = localStorage.getItem("token");
      
      // Add CSRF token if your backend requires it
      // You might need to fetch this token from a cookie or from a dedicated endpoint
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      };
      
      // Add CSRF token if available
      if (csrfToken) {
        headers["X-CSRF-TOKEN"] = csrfToken;
      }
      
      const response = await fetch("http://localhost:8080/api/hr/time-logs/adjust", {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(formattedLog),
        // Include credentials if your backend requires cookies
        credentials: 'include'
      });
      
      console.log("Response status:", response.status);
      
      if (response.status === 403) {
        throw new Error("Authentication failed - please log in again");
      }
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error(`Failed to update time log: ${response.status}`);
      }
  
      await fetchTimeLogs();
      setIsModalOpen(false);
      setSelectedLog(null);
      setEditedLog(null);
    } catch (error) {
      setError(`Failed to update time log: ${error.message}`);
      console.error("Error updating time log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes in the modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedLog((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helper function to get employee ID
  const getEmployeeId = (log) => {
    // Check different possible structures based on your API response
    if (log.employeeId) return log.employeeId;
    if (log.employee && log.employee.employeeId) return log.employee.employeeId;
    if (log.employee && log.employee.id) return log.employee.id;
    return "N/A"; // Fallback if no ID can be found
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <HrNav userType="hr" />
          </div>
          <HrUser userName="HR User" userEmail="hr@example.com" />
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Employee Time Logs</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              {error.includes("Authentication") && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Redirect to login page
                      navigate("/login");
                    }}
                  >
                    Login Again
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeLogs.map((log) => {
                  const timeIn = new Date(log.timeIn);
                  const timeOut = new Date(log.timeOut);
                  const duration = Math.round((timeOut - timeIn) / (1000 * 60)); // Duration in minutes

                  return (
                    <TableRow key={log.timeLogId}>
                      <TableCell>{getEmployeeId(log)}</TableCell>
                      <TableCell>{formatDate(timeIn, "MMM dd, yyyy HH:mm")}</TableCell>
                      <TableCell>{formatDate(timeOut, "MMM dd, yyyy HH:mm")}</TableCell>
                      <TableCell>{`${Math.floor(duration / 60)}h ${duration % 60}m`}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(log)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

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
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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