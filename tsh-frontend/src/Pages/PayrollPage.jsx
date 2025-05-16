import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { format } from 'date-fns';

const API_URL = 'http://localhost:8080/api';

const PayrollPage = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Helper function to get the auth token and create headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Function to refresh the token if needed
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }
      
      const response = await axios.post("http://localhost:8080/auth/refresh-token", {
        refreshToken: refreshToken
      });
      
      localStorage.setItem("token", response.data.token);
      return response.data.token;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // Redirect to login page if token refresh fails
      window.location.href = "/login";
      throw error;
    }
  };

  // Enhanced axios request with token refresh capability
  const apiRequest = async (method, url, data = null) => {
    try {
      const config = getAuthHeaders();
      let response;
      
      if (method.toLowerCase() === 'get') {
        response = await axios.get(url, config);
      } else if (method.toLowerCase() === 'post') {
        response = await axios.post(url, data, config);
      } else if (method.toLowerCase() === 'put') {
        response = await axios.put(url, data, config);
      } else if (method.toLowerCase() === 'delete') {
        response = await axios.delete(url, config);
      }
      
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // Try to refresh the token and retry the request
        try {
          await refreshToken();
          const newConfig = getAuthHeaders();
          
          if (method.toLowerCase() === 'get') {
            return await axios.get(url, newConfig);
          } else if (method.toLowerCase() === 'post') {
            return await axios.post(url, data, newConfig);
          } else if (method.toLowerCase() === 'put') {
            return await axios.put(url, data, newConfig);
          } else if (method.toLowerCase() === 'delete') {
            return await axios.delete(url, newConfig);
          }
        } catch (refreshError) {
          throw refreshError;
        }
      }
      throw error;
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('get', "http://localhost:8080/hr/all-employee");
      console.log("Employees:", response);
      
      // Check if response is an array
      if (Array.isArray(response)) {
        setEmployees(response);
      } else if (response && typeof response === 'object') {
        // If it's an object, check if it has a data property that is an array
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          // If it's another structure, convert to array if possible
          const employeesArray = Object.values(response);
          if (employeesArray.length > 0) {
            setEmployees(employeesArray);
          } else {
            setError('Employee data has an unexpected format');
          }
        }
      } else {
        setError('Failed to load employee data');
      }
    } catch (error) {
      console.error("Fetch employees error:", error);
      setError('Failed to load employee data. Please check the API endpoint.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedEmployees(selectedOptions);
  };

  const fetchPayrolls = async () => {
    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const allPayrolls = [];
      
      // Fetch payrolls for each selected employee
      for (const employeeId of selectedEmployees) {
        let url;
        
        // Use the correct endpoint format based on your backend controller
        if (startDate && endDate) {
          url = `${API_URL}/payrolls/employee/${employeeId}/dateRange?startDate=${startDate}&endDate=${endDate}`;
        } else {
          url = `${API_URL}/payrolls/employee/${employeeId}`;
        }
        
        const response = await apiRequest('get', url);
        
        if (Array.isArray(response)) {
          allPayrolls.push(...response);
        } else if (response) {
          allPayrolls.push(response);
        }
      }
      
      setPayrolls(allPayrolls);
      
      if (allPayrolls.length === 0) {
        setSuccessMessage('No payroll records found for the selected employees.');
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      setError('Failed to load payroll data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePayroll = async () => {
    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const results = [];
      const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Generate payroll for each selected employee
      for (const employeeId of selectedEmployees) {
        try {
          // Use the payrollDate parameter if you want to specify a date
          const url = `${API_URL}/payrolls/generate/${employeeId}?payrollDate=${currentDate}`;
          const response = await apiRequest('get', url);
          
          results.push({
            employeeId,
            success: true,
            payroll: response
          });
        } catch (err) {
          results.push({
            employeeId, 
            success: false,
            error: err.message
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      
      // Add newly generated payrolls to the current list
      const newPayrolls = results
        .filter(r => r.success && r.payroll)
        .map(r => r.payroll);
        
      if (newPayrolls.length > 0) {
        setPayrolls(prev => [...newPayrolls, ...prev]);
      }
      
      if (successCount === selectedEmployees.length) {
        setSuccessMessage(`Successfully generated payroll for ${successCount} employee(s).`);
      } else if (successCount > 0) {
        setSuccessMessage(`Generated payroll for ${successCount} out of ${selectedEmployees.length} employee(s).`);
        setError(`Failed to generate payroll for ${selectedEmployees.length - successCount} employee(s).`);
      } else {
        setError('Failed to generate payroll for any of the selected employees.');
      }
      
    } catch (error) {
      console.error('Error generating payroll:', error);
      setError('Failed to generate payroll. Please check your authorization and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  const handleReset = () => {
    setSelectedEmployees([]);
    setStartDate('');
    setEndDate('');
    setPayrolls([]);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '1400px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-primary">Payroll Management</h1>
          <p className="text-muted">View and generate employee payroll records</p>
        </div>
        <Badge bg="light" className="text-dark fs-6">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
          {successMessage}
        </Alert>
      )}

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Payroll Filters</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row className="align-items-end g-3">
              <Col md={4}>
                <Form.Group controlId="employeeSelect">
                  <Form.Label className="fw-semibold">Employees</Form.Label>
                  <Form.Select
                    multiple
                    value={selectedEmployees}
                    onChange={handleEmployeeSelect}
                    className="form-select-lg"
                    style={{ height: '150px' }}
                  >
                    {employees && employees.length > 0 ? (
                      employees.map(employee => (
                        <option key={employee.employeeId} value={employee.employeeId}>
                          {employee.firstName} {employee.lastName} ({employee.position})
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading employees...</option>
                    )}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Hold Ctrl/Cmd to select multiple employees
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group controlId="startDate">
                  <Form.Label className="fw-semibold">Start Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group controlId="endDate">
                  <Form.Label className="fw-semibold">End Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              
              <Col md={2} className="d-flex flex-column gap-2">
                <Button 
                  variant="primary" 
                  onClick={fetchPayrolls} 
                  disabled={loading || selectedEmployees.length === 0}
                  className="w-100"
                >
                  {loading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                    'View Payroll'
                  )}
                </Button>
                
                <Button 
                  variant="success" 
                  onClick={generatePayroll} 
                  disabled={loading || selectedEmployees.length === 0}
                  className="w-100"
                >
                  {loading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                    'Generate Payroll'
                  )}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={handleReset}
                  className="w-100"
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading payroll data...</p>
        </div>
      ) : payrolls.length > 0 ? (
        <div>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-info text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Payroll Results</h5>
                <Badge bg="white" text="dark">
                  {payrolls.length} Record(s) Found
                </Badge>
              </div>
            </Card.Header>
          </Card>
          
          {payrolls.map(payroll => (
            <Card key={payroll.payrollId} className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-1">
                      {payroll.employee ? `${payroll.employee.firstName} ${payroll.employee.lastName}` : 'Employee Name'}
                    </h3>
                    <div className="d-flex gap-3">
                      <span className="text-muted">
                        <i className="bi bi-briefcase me-1"></i> {payroll.employee ? payroll.employee.position : 'Position'}
                      </span>
                      <span className="text-muted">
                        <i className="bi bi-calendar me-1"></i> {format(new Date(payroll.payrollDate), 'MMMM dd, yyyy')}
                      </span>
                      <Badge bg="info" className="text-white">
                        Payroll ID: {payroll.payrollId}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => {
                      // Store the current payroll ID to print only this payslip
                      localStorage.setItem('printPayrollId', payroll.payrollId);
                      window.print();
                    }}
                    className="d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-printer"></i> Print Payslip
                  </Button>
                </div>
              </Card.Header>
              
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Card className="mb-4 h-100 border-0 shadow-sm">
                      <Card.Header className="bg-success text-white">
                        <h5 className="mb-0">Earnings</h5>
                      </Card.Header>
                      <Card.Body>
                        <Table hover className="mb-0">
                          <tbody>
                            <tr>
                              <th className="w-50">Base Salary</th>
                              <td className="text-end">{formatCurrency(payroll.baseSalary || 0)}</td>
                            </tr>
                            <tr>
                              <th>Regular Holiday Pay</th>
                              <td className="text-end">{formatCurrency(payroll.regularHolidayPay || 0)}</td>
                            </tr>
                            <tr>
                              <th>Special Holiday Pay</th>
                              <td className="text-end">{formatCurrency(payroll.specialHolidayPay || 0)}</td>
                            </tr>
                            <tr>
                              <th>Overtime Hours</th>
                              <td className="text-end">{(payroll.overtimeHours || 0).toFixed(2)} hrs</td>
                            </tr>
                            <tr>
                              <th>Overtime Rate</th>
                              <td className="text-end">{formatCurrency(payroll.overtimeRate || 0)} / hr</td>
                            </tr>
                            <tr>
                              <th>Overtime Pay</th>
                              <td className="text-end">{formatCurrency(payroll.overtimePay || 0)}</td>
                            </tr>
                            <tr>
                              <th>Absence Days</th>
                              <td className="text-end">{payroll.absenceDays || 0} days</td>
                            </tr>
                            <tr>
                              <th>Absence Deduction</th>
                              <td className="text-end text-danger">-{formatCurrency(payroll.absenceDeduction || 0)}</td>
                            </tr>
                            <tr>
                              <th>Partial Income</th>
                              <td className="text-end">{formatCurrency(payroll.partialIncome || 0)}</td>
                            </tr>
                            <tr className="table-primary">
                              <th className="fw-bold">Gross Income</th>
                              <td className="text-end fw-bold">{formatCurrency(payroll.grossIncome || 0)}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="mb-4 h-100 border-0 shadow-sm">
                      <Card.Header className="bg-danger text-white">
                        <h5 className="mb-0">Deductions</h5>
                      </Card.Header>
                      <Card.Body>
                        <Table hover className="mb-0">
                          <tbody>
                            <tr>
                              <th className="w-50">SSS Contribution</th>
                              <td className="text-end">-{formatCurrency(payroll.sssContribution || 0)}</td>
                            </tr>
                            <tr>
                              <th>PhilHealth Contribution</th>
                              <td className="text-end">-{formatCurrency(payroll.philhealthContribution || 0)}</td>
                            </tr>
                            <tr>
                              <th>Pag-IBIG Contribution</th>
                              <td className="text-end">-{formatCurrency(payroll.pagibigContribution || 0)}</td>
                            </tr>
                            <tr>
                              <th>Income Tax</th>
                              <td className="text-end">-{formatCurrency(payroll.incomeTax || 0)}</td>
                            </tr>
                            <tr className="table-danger">
                              <th className="fw-bold">Total Deductions</th>
                              <td className="text-end fw-bold">-{formatCurrency(payroll.totalDeductions || 0)}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                
                <Card className="border-0 shadow-sm mt-3">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">Payroll Summary</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={8} className="mx-auto">
                        <Table hover className="mb-0">
                          <tbody>
                            <tr>
                              <th className="w-50">Gross Income</th>
                              <td className="text-end">{formatCurrency(payroll.grossIncome || 0)}</td>
                            </tr>
                            <tr>
                              <th>Total Deductions</th>
                              <td className="text-end text-danger">-{formatCurrency(payroll.totalDeductions || 0)}</td>
                            </tr>
                            <tr className="table-success">
                              <th className="fw-bold">Net Income</th>
                              <td className="text-end fw-bold">{formatCurrency(payroll.netIncome || 0)}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  </Card.Body>
                  <Card.Footer className="text-muted small">
                    <div className="d-flex justify-content-between">
                      <span>Payroll generated on: {format(new Date(payroll.payrollDate), 'PPPPpp')}</span>
                      <span>Employee ID: {payroll.employee ? payroll.employee.employeeId : 'N/A'}</span>
                    </div>
                  </Card.Footer>
                </Card>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center border-0 shadow-sm">
          <Card.Body className="py-5">
            <i className="bi bi-file-earmark-text display-4 text-muted mb-3"></i>
            <h4 className="text-muted">
              {selectedEmployees.length > 0
                ? 'No payroll records found' 
                : 'Select employees to view payroll records'}
            </h4>
            <p className="text-muted">
              {selectedEmployees.length > 0 && 'Generate new payrolls using the button above'}
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PayrollPage;