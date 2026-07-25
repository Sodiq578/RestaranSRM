import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import DebtManagement from "./pages/DebtManagement";
import OrdersHistory from "./components/OrdersHistory";
import KitchenDashboard from "./components/KitchenDashboard";
import UserDashboard from "./components/UserDashboard";
import { AppProvider } from "./context/AppContext";
import "./App.css";

// ==================== PROTECTED ROUTE ====================
const ProtectedRoute = ({ children, allowedRoles }) => {
  // HAR DOIM localStorage dan o'qish - state emas!
  const currentUser = (() => {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : {};
    } catch (error) {
      return {};
    }
  })();

  console.log("=== PROTECTED ROUTE ===");
  console.log("Current User:", currentUser);
  console.log("User Role:", currentUser.role);
  console.log("Allowed Roles:", allowedRoles);
  console.log("Is Logged In:", currentUser.isLoggedIn);

  // Login qilinmagan bo'lsa
  if (!currentUser.isLoggedIn) {
    console.log("❌ Login qilinmagan - Login sahifasiga yo'naltirish");
    return <Navigate to="/login" replace />;
  }

  // Admin hamma joyga kira oladi
  if (currentUser.role === "admin") {
    console.log("✅ Admin - to'liq ruxsat");
    return children;
  }

  // Ruxsat tekshirish
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(currentUser.role);
    console.log("Has Access:", hasAccess);

    if (!hasAccess) {
      console.log("❌ Ruxsat berilmagan!");
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}>
          <span style={{ fontSize: '4rem' }}>🔒</span>
          <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Ruxsat berilmagan</h2>
          <p style={{ color: '#6b7280', marginBottom: '4px' }}>
            Siz bu sahifaga kirish huquqiga ega emassiz
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '20px' }}>
            Sizning rolingiz: <strong>{currentUser.role}</strong>
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.history.back()}
              style={{
                padding: '10px 24px',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              ← Orqaga qaytish
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("currentUser");
                window.location.href = "/login";
              }}
              style={{
                padding: '10px 24px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              🔄 Qayta login qilish
            </button>
          </div>
        </div>
      );
    }
  }

  console.log("✅ Ruxsat berildi!");
  return children;
};

// ==================== APP CONTENT ====================
function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  // HAR RENDERDA localStorage dan o'qish
  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : {};
    } catch (error) {
      return {};
    }
  };

  const currentUser = getCurrentUser();

  console.log("=== APP CONTENT ===");
  console.log("Pathname:", location.pathname);
  console.log("Is Login Page:", isLoginPage);
  console.log("Current User:", currentUser);
  console.log("Is Logged In:", currentUser.isLoggedIn);

  // Login qilmagan foydalanuvchini login sahifasiga yo'naltirish
  if (!isLoginPage && !currentUser.isLoggedIn) {
    console.log("❌ Login qilinmagan - /login ga yo'naltirish");
    return <Navigate to="/login" replace />;
  }

  // Login qilingan bo'lsa va login sahifasida bo'lsa
  if (isLoginPage && currentUser.isLoggedIn) {
    console.log("✅ Login qilingan, role:", currentUser.role);
    // Role bo'yicha yo'naltirish
    if (currentUser.role === "kitchen" || currentUser.role === "bar") {
      console.log("→ /kitchen ga yo'naltirish");
      return <Navigate to="/kitchen" replace />;
    }
    console.log("→ / ga yo'naltirish");
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {!isLoginPage && <Navbar />}
      <div className={isLoginPage ? "" : "app-container"}>
        <Routes>
          {/* ===== PUBLIC ROUTE ===== */}
          <Route path="/login" element={<Login />} />

          {/* ===== HOME - Admin va Ofitsiant ===== */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={["admin", "waiter"]}>
              <Home />
            </ProtectedRoute>
          } />

          {/* ===== ORDERS HISTORY - Admin va Ofitsiant ===== */}
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={["admin", "waiter"]}>
              <OrdersHistory />
            </ProtectedRoute>
          } />

          {/* ===== REPORTS - Faqat Admin ===== */}
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          } />

          {/* ===== ADMIN PANEL - Faqat Admin ===== */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* ===== DEBTS - Faqat Admin ===== */}
          <Route path="/debts" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DebtManagement />
            </ProtectedRoute>
          } />

          {/* ===== KITCHEN - Admin, Kitchen, Bar ===== */}
          <Route path="/kitchen" element={
            <ProtectedRoute allowedRoles={["admin", "kitchen", "bar"]}>
              <KitchenDashboard />
            </ProtectedRoute>
          } />

          {/* ===== USER DASHBOARD - Hamma uchun ===== */}
          <Route path="/user" element={
            <ProtectedRoute allowedRoles={["admin", "waiter", "kitchen", "bar"]}>
              <UserDashboard />
            </ProtectedRoute>
          } />

          {/* ===== 404 ===== */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              fontFamily: 'sans-serif'
            }}>
              <span style={{ fontSize: '5rem' }}>404</span>
              <h2>Sahifa topilmadi</h2>
              <p>So'ralgan sahifa mavjud emas</p>
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  marginTop: '16px',
                  padding: '10px 24px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Bosh sahifaga qaytish
              </button>
            </div>
          } />
        </Routes>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

// ==================== APP ====================
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