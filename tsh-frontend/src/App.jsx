import './App.css'
import { Login } from './Pages/LogInForm'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginHR } from './Pages/LoginFormHR';
import { LoginAdmin } from './Pages/LoginFormAdmin';  
import EmployeeDashboard from './Pages/EmployeeDashboard';
import HrDashboard from './Pages/HrDashboard';
import ForgotPassword from './Pages/ForgotPassword';
import Unauthorized from './components/layout/Unauthorized';
import ProtectedRoutes from './Pages/ProtectedRoutes';
import TimeLogs from './Pages/TimeLogs';
import TimeTracking from './Pages/TimeTracking';
import { AdminDashboard } from '@/Pages/AdminDashboard';
import EmployeeManagementPage from './Pages/EmployeeManagementPage';
import HRManagementPage from './Pages/HRManagementPage';
import NotFound from './components/layout/NotFound';
import Forbidden from './components/layout/Forbidden';
import ServerError from './components/layout/ServerError';
import EmployeeProfile from './Pages/EmployeeProfile';
import HrProfile from './Pages/HrProfile';
import ResetPassword from './Pages/ResetPassword';
import LeaveRequestForm from "./pages/LeaveRequestForm";
import HrLeaveRequests from './Pages/HrLeaveRequests';
import EmployeePayslip from './Pages/EmployeePayslip';

function App() {

  return (
    <>
    <Router>
      <Routes>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />
       
        <Route path="/" element={<Login />} />
        <Route path="/hr" element={<LoginHR />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      

        <Route element={<ProtectedRoutes allowedRoles={["EMPLOYEE"]} />}>
          <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />
          <Route path="/TimeLogs" element={<TimeLogs  />} />
          <Route path="/TimeTracking" element={<TimeTracking  />} />
          <Route path="/profile" element={<EmployeeProfile />} />      
          <Route path="/LeaveRequest" element={<LeaveRequestForm />} />
          <Route path="/EmployeePayslip" element={<EmployeePayslip />} />
        </Route>


        <Route element={<ProtectedRoutes allowedRoles={["HR"]} />}>
        <Route path="/HrDashboard" element={<HrDashboard />} />
        <Route path="/Hrprofile" element={<HrProfile />} />
        <Route path="/HrLeaveRequests" element={<HrLeaveRequests />} />
        </Route>

        <Route element={<ProtectedRoutes allowedRoles={["ADMIN"]} />}>
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/adminEmployees" element={<EmployeeManagementPage />} />
        <Route path="/adminHR" element={<HRManagementPage />} />
        </Route>

      </Routes>
    </Router>
    </>
  )
}

export default App