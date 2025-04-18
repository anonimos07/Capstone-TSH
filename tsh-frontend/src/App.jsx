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


function App() {

  return (
    <>
    <Router>
      <Routes>
      <Route path="/unauthorized" element={<Unauthorized />} />
       
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
        {/* admin routes */}
        </Route>


        


      </Routes>
    </Router>
    </>
  )
}

export default App
