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
import { format } from "date-fns";
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
      const response = await fetch("http://localhost:8080/api/hr/time-logs/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch time logs");
      const data = await response.json();
      setTimeLogs(data);
    } catch (error) {
      setError("Failed to load time logs");
      console.error("Error fetching time logs:", error);
    }
  };

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  // Handle opening the edit modal
  const handleEdit = (log) => {
    setSelectedLog(log);
    setEditedLog({
      timeLogId: log.timeLogId,
      employeeId: log.employeeId,
      timeIn: format(new Date(log.timeIn), "yyyy-MM-dd'T'HH:mm"),
      timeOut: format(new Date(log.timeOut), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsModalOpen(true);
  };

  // Handle saving the edited log
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/hr/time-logs/adjust", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editedLog),
      });

      if (!response.ok) throw new Error("Failed to update time log");

      // Refresh the time logs list
      await fetchTimeLogs();
      setIsModalOpen(false);
      setSelectedLog(null);
      setEditedLog(null);
    } catch (error) {
      setError("Failed to update time log");
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
                      <TableCell>{log.employeeId}</TableCell>
                      <TableCell>{format(timeIn, "MMM dd, yyyy HH:mm")}</TableCell>
                      <TableCell>{format(timeOut, "MMM dd, yyyy HH:mm")}</TableCell>
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