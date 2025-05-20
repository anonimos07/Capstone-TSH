import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Banknote, FileText, Download, ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { MainNav } from "../components/dashboard/MainNav";
import { UserNav } from "../components/dashboard/UserNav";

const EmployeePayslip = ({ employeeId }) => {
  const [employee, setEmployee] = useState({
      firstName: "",
      lastName: "",
      email: "",
    });
  const [activeTab, setActiveTab] = useState('payslips');
  const [payslips, setPayslips] = useState([]);
  const [taxDetails, setTaxDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payrollId, setPayrollId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generateSuccess, setGenerateSuccess] = useState(null);

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : "";

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

      if (activeTab === 'payslips') {
        fetchPayslips();
      } else {
        fetchTaxDetails();
      }
    } catch (error) {
      console.error("Error fetching HR data:", error);
    }
  };  

  fetchEmployeeData();
  }, []);



  const fetchPayslips = async () => {
    console.log('[fetchPayslips] Starting fetch operation...');
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        const errorMsg = 'No authentication token found';
        console.error('[fetchPayslips] Error:', errorMsg);
        throw new Error(errorMsg);
      }

      const apiUrl = 'http://localhost:8080/api/payslips/my-payslips'; // matches your backend GetMapping

      console.log('[fetchPayslips] Calling API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Only needed if cookies are involved
      });

      console.log('[fetchPayslips] Received response:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }

        let errorMsg = response.status === 403
          ? 'You are not authorized to view these payslips. Please ensure you are logged in as the correct employee.'
          : 'Failed to fetch payslips';

        console.error('[fetchPayslips] API Error:', {
          message: errorMsg,
          status: response.status,
          statusText: response.statusText
        });

        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('[fetchPayslips] Successful response data:', data);
      setPayslips(data);

    } catch (err) {
      console.error('[fetchPayslips] Caught error:', {
        error: err,
        message: err.message,
        stack: err.stack
      });
      setError(err.message);
    } finally {
      console.log('[fetchPayslips] Completing operation');
      setIsLoading(false);
    }
  };

  const downloadPayslip = async (payslipId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/payslips/${payslipId}/download`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download payslip');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from content-disposition header or use a default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `payslip-${payslipId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError(err.message);
    }
  };

  const PayslipsList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Payslips</h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">Loading payslips...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchPayslips}>
            Retry
          </Button>
        </div>
      ) : payslips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <FileText className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500">No payslips found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payslips.map((payslip) => (
            <div key={payslip.payslipId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Payslip #{payslip.payslipId}</h4>
                  <p className="text-sm text-gray-500">
                    Issued: {payslip.generatedDate ? new Date(payslip.generatedDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadPayslip(payslip.payslipId)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
        <header className="sticky top-0 z-40 border-b bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
              <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
                <MainNav userType="employee" />
              </div>
            <UserNav userName={fullName} userEmail={employee.email} />
          </div>
       </header>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h2 className="text-2xl font-bold">Payslip</h2>
      </div>

      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-6">
        <button
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            activeTab === 'payslips' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('payslips')}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Payslips
          </div>
        </button>
        <button
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            activeTab === 'tax' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('tax')}
        >
        </button>
      </div>

      {activeTab === 'payslips' ? <PayslipsList /> : <TaxDetailsCard />}
    </div>
  );
};

export default EmployeePayslip;