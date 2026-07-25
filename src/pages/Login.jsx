import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaLock,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
  FaUtensils,
  FaUserTie,
  FaFire,
  FaGlassCheers
} from "react-icons/fa";
import "./Login.css";

// ==================== FOYDALANUVCHILAR RO'YXATI ====================
const USERS = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "Admin User",
    icon: "👑",
    color: "#6366f1"
  },
  {
    id: 2,
    username: "waiter1",
    password: "waiter123",
    role: "waiter",
    name: "Ofitsiant 1",
    icon: "👨‍💼",
    color: "#10b981"
  },
  {
    id: 3,
    username: "waiter2",
    password: "waiter123",
    role: "waiter",
    name: "Ofitsiant 2",
    icon: "👨‍💼",
    color: "#10b981"
  },
  {
    id: 4,
    username: "kitchen",
    password: "kitchen123",
    role: "kitchen",
    name: "Oshxona Xodimi",
    icon: "👨‍🍳",
    color: "#f59e0b"
  },
  {
    id: 5,
    username: "bar",
    password: "bar123",
    role: "bar",
    name: "Bar Xodimi",
    icon: "🍹",
    color: "#ef4444"
  }
];

// ==================== LOGIN COMPONENT ====================
function Login() {
  const navigate = useNavigate();

  // State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Sahifa yuklanganda - eslab qolingan username ni yuklash
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedUser");
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }

    // Agar login qilingan bo'lsa, home ga yo'naltirish
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user.isLoggedIn) {
          navigate("/", { replace: true });
        }
      } catch (error) {
        localStorage.removeItem("currentUser");
      }
    }
  }, [navigate]);

  // Tezkor login - rol tanlash orqali
  const handleQuickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setSelectedRole(user.role);
    
    // Avtomatik login
    setTimeout(() => {
      performLogin(user.username, user.password);
    }, 300);
  };

  // Login qilish
  const performLogin = (usernameInput, passwordInput) => {
    const user = USERS.find(
      (u) => u.username === usernameInput && u.password === passwordInput
    );

    if (user) {
      // Foydalanuvchi ma'lumotlarini saqlash
      const userData = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        icon: user.icon,
        color: user.color,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem("currentUser", JSON.stringify(userData));

      // Eslab qolish
      if (rememberMe) {
        localStorage.setItem("rememberedUser", usernameInput);
      } else {
        localStorage.removeItem("rememberedUser");
      }

      toast.success(`✅ Xush kelibsiz, ${user.name}!`, {
        position: "top-center",
        autoClose: 1500
      });

      // Role bo'yicha yo'naltirish
      setTimeout(() => {
        switch (user.role) {
          case "admin":
            navigate("/", { replace: true });
            break;
          case "waiter":
            navigate("/", { replace: true });
            break;
          case "kitchen":
            navigate("/kitchen", { replace: true });
            break;
          case "bar":
            navigate("/kitchen", { replace: true });
            break;
          default:
            navigate("/", { replace: true });
        }
      }, 500);

      return true;
    }
    return false;
  };

  // Form submit
  const handleLogin = (e) => {
    e.preventDefault();

    // Validatsiya
    if (!username.trim()) {
      toast.error("❌ Foydalanuvchi nomini kiriting!");
      return;
    }
    if (!password.trim()) {
      toast.error("❌ Parolni kiriting!");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const success = performLogin(username.trim(), password);

      if (!success) {
        toast.error("❌ Username yoki password noto'g'ri!");
      }

      setLoading(false);
    }, 800);
  };

  // Enter tugmasi bilan login
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* ===== LOGIN CARD ===== */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">🍽️</div>
            <h1 className="login-title">SODIQJON</h1>
            <p className="login-subtitle">Restoran Boshqaruv Tizimi</p>
            <div className="login-version">v2.0</div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form" onKeyDown={handleKeyDown}>
            {/* Username */}
            <div className="login-form-group">
              <label className="login-label">
                <FaUser /> Foydalanuvchi nomi
              </label>
              <div className="login-input-wrap">
                <FaUser className="login-input-icon" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSelectedRole(null);
                  }}
                  placeholder="Username kiriting"
                  className="login-input"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-form-group">
              <label className="login-label">
                <FaLock /> Parol
              </label>
              <div className="login-input-wrap">
                <FaLock className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedRole(null);
                  }}
                  placeholder="Parol kiriting"
                  className="login-input"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Eslab qolish</span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="login-btn" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Kutilmoqda...
                </>
              ) : (
                <>
                  <FaSignInAlt /> Tizimga kirish
                </>
              )}
            </button>
          </form>

          {/* ===== TEZKOR LOGIN ===== */}
          <div className="login-quick-section">
            <h4 className="login-quick-title">Tezkor kirish</h4>
            <div className="login-quick-grid">
              {USERS.map((user) => (
                <button
                  key={user.id}
                  className={`login-quick-card ${selectedRole === user.role ? "active" : ""}`}
                  onClick={() => handleQuickLogin(user)}
                  style={{
                    borderColor: selectedRole === user.role ? user.color : "transparent"
                  }}
                  disabled={loading}
                >
                  <span className="login-quick-icon">{user.icon}</span>
                  <div className="login-quick-info">
                    <strong>{user.name}</strong>
                    <span className="login-quick-role">
                      {user.role === "admin" && "👑 Admin"}
                      {user.role === "waiter" && "👨‍💼 Ofitsiant"}
                      {user.role === "kitchen" && "👨‍🍳 Oshxona"}
                      {user.role === "bar" && "🍹 Bar"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ===== DEMO CREDENTIALS ===== */}
          <div className="login-demo">
            <h4>📋 Demo ma'lumotlar</h4>
            <div className="demo-grid">
              <div className="demo-item">
                <span className="demo-role">👑 Admin:</span>
                <code>admin / admin123</code>
              </div>
              <div className="demo-item">
                <span className="demo-role">👨‍💼 Ofitsiant:</span>
                <code>waiter1 / waiter123</code>
              </div>
              <div className="demo-item">
                <span className="demo-role">👨‍🍳 Oshxona:</span>
                <code>kitchen / kitchen123</code>
              </div>
              <div className="demo-item">
                <span className="demo-role">🍹 Bar:</span>
                <code>bar / bar123</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2024 SODIQJON Restorani. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Login;