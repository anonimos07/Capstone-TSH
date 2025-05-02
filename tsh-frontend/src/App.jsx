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

      

        <Route element={<ProtectedRoutes allowedRoles={["EMPLOYEE"]} />}>
          <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />
          <Route path="/TimeLogs" element={<TimeLogs  />} />
          <Route path="/TimeTracking" element={<TimeTracking  />} />
        </Route>


        <Route element={<ProtectedRoutes allowedRoles={["HR"]} />}>
        <Route path="/HrDashboard" element={<HrDashboard />} />
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
