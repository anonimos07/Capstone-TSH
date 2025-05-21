import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";

export default function HrLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [hrId, setHrId] = useState(null); // Add state for HR ID
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHrProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        // First fetch HR profile to get the HR ID
        const profileResponse = await fetch("http://localhost:8080/hr/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch HR profile");
        }

        const profileData = await profileResponse.json();
        setHrId(profileData.hrId); // Assuming the response includes hrId

        // Now fetch leave requests for this HR
        const leaveResponse = await fetch(`http://localhost:8080/hr/pending-leave-requests/${profileData.hrId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!leaveResponse.ok) {
          throw new Error("Failed to fetch leave requests");
        }

        const leaveData = await leaveResponse.json();
        setLeaveRequests(leaveData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHrProfile();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/hr/approve-leave/${requestId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to approve leave request");
      }

      setLeaveRequests(leaveRequests.filter(request => request.id !== requestId));
      alert("Leave request approved successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/hr/reject-leave/${requestId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(rejectionReason)
      });

      if (!response.ok) {
        throw new Error("Failed to reject leave request");
      }

      setLeaveRequests(leaveRequests.filter(request => request.id !== requestId));
      setRejectionReason("");
      alert("Leave request rejected successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Leave Requests</h1>
              <p className="text-gray-500">Review and manage employee leave requests</p>
            </div>
            <Button
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => navigate(-1)}>Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
              <CardDescription>All pending leave requests from employees</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading leave requests...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-4">{error}</div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-4">No pending leave requests</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="p-4 font-medium">Employee</th>
                        <th className="p-4 font-medium">Leave Type</th>
                        <th className="p-4 font-medium">Start Date</th>
                        <th className="p-4 font-medium">End Date</th>
                        <th className="p-4 font-medium">Reason</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.map((request) => (
                        <tr key={request.id} className="border-t hover:bg-gray-50">
                          <td className="p-4">
                            {request.employee?.firstName} {request.employee?.lastName}
                          </td>
                          <td className="p-4">{request.leaveType}</td>
                          <td className="p-4">{request.startDate}</td>
                          <td className="p-4">{request.endDate}</td>
                          <td className="p-4">{request.reason}</td>
                          <td className="p-4 flex space-x-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Rejection reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="px-2 py-1 border rounded-md text-sm w-40"
                              />
                              <button
                                onClick={() => handleReject(request.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}