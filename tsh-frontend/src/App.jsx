import './App.css'
import { Login } from './Pages/LogInForm'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginHR } from './Pages/LoginFormHR';
import { LoginAdmin } from './Pages/LoginFormAdmin';  
import EmployeeDashboard from './Pages/EmployeeDashboard';


function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/hr" element={<LoginHR />} />

        <Route path="/admin" element={<LoginAdmin />} />

        <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />

      </Routes>
    </Router>
    </>
  )
}

export default App
