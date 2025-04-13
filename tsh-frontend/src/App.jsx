import './App.css'
import { Login } from './Pages/LogInForm'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginHR } from './Pages/LoginFormHR';
import { LoginAdmin } from './Pages/LoginFormAdmin';  
import EmployeeDashboard from './Pages/EmployeeDashboard';
import HrDashboard from './Pages/HrDashboard';
import { LogoutHR } from './Pages/LogoutHr';

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
        </Route>


        <Route element={<ProtectedRoutes allowedRoles={["HR"]} />}>
        <Route path="/HrDashboard" element={<HrDashboard />} />
        </Route>

        <Route element={<ProtectedRoutes allowedRoles={["ADMIN"]} />}>
        {/* admin routes */}
        </Route>


        


        <Route path="/LogoutHr" element={<LogoutHR />} />

      </Routes>
    </Router>
    </>
  )
}

export default App
