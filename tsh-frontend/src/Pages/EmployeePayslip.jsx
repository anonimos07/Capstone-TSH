import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Banknote, FileText, Download, ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input'; // Assuming you have an Input component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'; // Assuming you have a Dialog component

const EmployeePayslip = ({ employeeId }) => {
  const [activeTab, setActiveTab] = useState('payslips');
  const [payslips, setPayslips] = useState([]);
  const [taxDetails, setTaxDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payrollId, setPayrollId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generateSuccess, setGenerateSuccess] = useState(null);

  useEffect(() => {
    if (activeTab === 'payslips') {
      fetchPayslips();
    } else {
      fetchTaxDetails();
    }
  }, [activeTab, employeeId]);

  const fetchPayslips = async () => {
    if (!employeeId) {
      setError('Employee ID is missing');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8080/api/payslips/employee/${employeeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You are not authorized to view these payslips');
        }
        throw new Error('Failed to fetch payslips');
      }

      const data = await response.json();
      setPayslips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePayslip = async () => {
    if (!payrollId) {
      setGenerateError('Payroll ID is required');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8080/api/payslips/generate/${payrollId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You are not authorized to generate payslips');
        }
        throw new Error('Failed to generate payslip');
      }

      const data = await response.json();
      setGenerateSuccess(`Payslip generated successfully for payroll ID: ${payrollId}`);
      setPayrollId('');
      // Refresh the payslips list
      await fetchPayslips();
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchTaxDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/employee/tax-details`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tax details');
      }

      const data = await response.json();
      setTaxDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
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

  const TaxDetailsCard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Banknote className="h-5 w-5" /> Annual Tax Summary
        </h3>
        
        {taxDetails ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Gross Salary</p>
                <p className="text-xl font-bold">${taxDetails.grossSalary?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Tax</p>
                <p className="text-xl font-bold">${taxDetails.tax?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Breakdown</h4>
              <div className="border rounded-lg p-4">
                {taxDetails.taxBreakdown?.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <span>{item.description}</span>
                    <span className="font-medium">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mt-2">No tax details available</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" /> Tax Withholdings
        </h3>
        {taxDetails?.withholdings ? (
          <div className="mt-4 space-y-3">
            {Object.entries(taxDetails.withholdings).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-medium">${value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-2">No withholding information available</p>
        )}
      </div>
    </div>
  );

   const PayslipsList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Payslips</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" /> Generate Payslip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Payslip</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="payrollId" className="block text-sm font-medium text-gray-700 mb-1">
                  Payroll ID
                </label>
                <Input
                  id="payrollId"
                  type="text"
                  value={payrollId}
                  onChange={(e) => setPayrollId(e.target.value)}
                  placeholder="Enter payroll ID"
                />
              </div>
              {generateError && (
                <div className="bg-red-50 p-3 rounded-md">
                  <p className="text-red-600 text-sm">{generateError}</p>
                </div>
              )}
              {generateSuccess && (
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-green-600 text-sm">{generateSuccess}</p>
                </div>
              )}
              <Button 
                onClick={generatePayslip}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Payslip'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
            <div key={payslip.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{payslip.period || `Payslip #${payslip.id}`}</h4>
                  <p className="text-sm text-gray-500">
                    Issued: {payslip.issueDate ? new Date(payslip.issueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">${payslip.netPay?.toFixed(2) || '0.00'}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadPayslip(payslip.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Gross</p>
                  <p>${payslip.grossPay?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tax</p>
                  <p>${payslip.taxDeductions?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Deductions</p>
                  <p>${payslip.otherDeductions?.toFixed(2) || '0.00'}</p>
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
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h2 className="text-2xl font-bold">Finance Center</h2>
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
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4" /> Tax Details
          </div>
        </button>
      </div>

      {activeTab === 'payslips' ? <PayslipsList /> : <TaxDetailsCard />}
    </div>
  );
};

export default EmployeePayslip;