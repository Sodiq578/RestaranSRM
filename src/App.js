import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import DebtManagement from "./pages/DebtManagement";
import OrdersHistory from "./components/OrderForm"; // New import
import { AppProvider } from "./context/AppContext";


function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && <Navbar />}
      <div className={isLoginPage ? "" : "app-container"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<OrdersHistory />} /> {/* Updated route */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/login" element={<Login />} />
          <Route path="/debts" element={<DebtManagement />} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;