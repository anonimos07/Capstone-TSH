// EmployeeFinance.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Banknote, FileText, Download, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button'; // Assuming you have a Button component

const EmployeePayslip = ({ employeeId }) => {
  const [activeTab, setActiveTab] = useState('payslips');
  const [payslips, setPayslips] = useState([]);
  const [taxDetails, setTaxDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'payslips') {
      fetchPayslips();
    } else {
      fetchTaxDetails();
    }
  }, [activeTab, employeeId]);

  const fetchPayslips = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/employee/payslips`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
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

  const downloadPayslip = (payslipId) => {
    // Implement download functionality
    console.log(`Downloading payslip ${payslipId}`);
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
        <Button variant="outline" size="sm">
          Request Payslip
        </Button>
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
                  <h4 className="font-medium">{payslip.period}</h4>
                  <p className="text-sm text-gray-500">Issued: {new Date(payslip.issueDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">${payslip.netPay.toFixed(2)}</span>
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
                  <p>${payslip.grossPay.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tax</p>
                  <p>${payslip.taxDeductions.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Deductions</p>
                  <p>${payslip.otherDeductions.toFixed(2)}</p>
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