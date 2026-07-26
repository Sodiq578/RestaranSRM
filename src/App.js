import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
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

const ProtectedRoute = ({ children, allowedRoles }) => {
  const currentUser = (() => {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : {};
    } catch (error) {
      return {};
    }
  })();

  if (!currentUser.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === "admin") {
    return children;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(currentUser.role);
    if (!hasAccess) {
      return (
        <div className="access-denied">
          <div className="access-denied__container">
            <span className="access-denied__icon">🔒</span>
            <h2 className="access-denied__title">Ruxsat berilmagan</h2>
            <p className="access-denied__text">Siz bu sahifaga kirish huquqiga ega emassiz</p>
            <p className="access-denied__role">
              Sizning rolingiz: <strong>{currentUser.role}</strong>
            </p>
            <div className="access-denied__actions">
              <button className="access-denied__btn access-denied__btn--back" onClick={() => window.history.back()}>
                ← Orqaga qaytish
              </button>
              <button
                className="access-denied__btn access-denied__btn--relogin"
                onClick={() => {
                  localStorage.removeItem("currentUser");
                  window.location.href = "/login";
                }}
              >
                🔄 Qayta login qilish
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : {};
    } catch (error) {
      return {};
    }
  };

  const currentUser = getCurrentUser();

  if (!isLoginPage && !currentUser.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isLoginPage && currentUser.isLoggedIn) {
    if (currentUser.role === "kitchen" || currentUser.role === "bar") {
      return <Navigate to="/kitchen" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {!isLoginPage && <Navbar />}
      <div className={isLoginPage ? "" : "app-container"}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute allowedRoles={["admin", "waiter"]}>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={["admin", "waiter"]}>
              <OrdersHistory />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          <Route path="/debts" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DebtManagement />
            </ProtectedRoute>
          } />

          <Route path="/kitchen" element={
            <ProtectedRoute allowedRoles={["admin", "kitchen", "bar"]}>
              <KitchenDashboard />
            </ProtectedRoute>
          } />

          <Route path="/user" element={
            <ProtectedRoute allowedRoles={["admin", "waiter", "kitchen", "bar"]}>
              <UserDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={
            <div className="not-found">
              <div className="not-found__container">
                <span className="not-found__icon">🔍</span>
                <h1 className="not-found__code">404</h1>
                <h2 className="not-found__title">Sahifa topilmadi</h2>
                <p className="not-found__text">So'ralgan sahifa mavjud emas</p>
                <button className="not-found__btn" onClick={() => window.location.href = "/"}>
                  Bosh sahifaga qaytish
                </button>
              </div>
            </div>
          } />
        </Routes>
      </div>

      {!isLoginPage && <BottomNav />}

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
        limit={3}
      />
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