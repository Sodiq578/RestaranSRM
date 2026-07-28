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
  FaShieldAlt,
  FaConciergeBell,
  FaFire,
  FaGlassCheers,
  FaChevronDown
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
    icon: <FaShieldAlt />,
    color: "#e9ae72"
  },
  {
    id: 2,
    username: "waiter1",
    password: "waiter123",
    role: "waiter",
    name: "Ofitsiant 1",
    icon: <FaConciergeBell />,
    color: "#60a5fa"
  },
  {
    id: 3,
    username: "waiter2",
    password: "waiter123",
    role: "waiter",
    name: "Ofitsiant 2",
    icon: <FaConciergeBell />,
    color: "#60a5fa"
  },
  {
    id: 4,
    username: "kitchen",
    password: "kitchen123",
    role: "kitchen",
    name: "Oshxona Xodimi",
    icon: <FaFire />,
    color: "#f59e0b"
  },
  {
    id: 5,
    username: "bar",
    password: "bar123",
    role: "bar",
    name: "Bar Xodimi",
    icon: <FaGlassCheers />,
    color: "#34d399"
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
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Sahifa yuklanganda
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedUser");
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }

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

  // Tezkor login
  const handleQuickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setShowQuickMenu(false);

    setTimeout(() => {
      performLogin(user.username, user.password);
    }, 300);
  };

  // Login qilish funksiyasi
  const performLogin = (usernameInput, passwordInput) => {
    const user = USERS.find(
      (u) => u.username === usernameInput && u.password === passwordInput
    );

    if (user) {
      const userData = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        color: user.color,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem("currentUser", JSON.stringify(userData));

      if (rememberMe) {
        localStorage.setItem("rememberedUser", usernameInput);
      } else {
        localStorage.removeItem("rememberedUser");
      }

      toast.success(`Xush kelibsiz, ${user.name}!`, {
        position: "top-right",
        autoClose: 1500,
        theme: "colored"
      });

      setTimeout(() => {
        switch (user.role) {
          case "admin":
          case "waiter":
            navigate("/", { replace: true });
            break;
          case "kitchen":
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

    if (!username.trim()) {
      toast.error("Foydalanuvchi nomini kiriting!", { theme: "colored" });
      return;
    }
    if (!password.trim()) {
      toast.error("Parolni kiriting!", { theme: "colored" });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const success = performLogin(username.trim(), password);

      if (!success) {
        toast.error("Username yoki parol noto'g'ri!", { theme: "colored" });
      }

      setLoading(false);
    }, 800);
  };

  return (
    <div className="mobile-app-wrapper">
      <div className="app-screen-content">
        {/* Header */}
        <div className="app-header">
          <div className="app-logo-box">
            <FaUtensils />
          </div>
          <h2>SODIQJON</h2>
          <p>Mobil Restoran Tizimi</p>
        </div>

        {/* Login Formasi */}
        <form onSubmit={handleLogin} className="app-form">
          <div className="app-input-group">
            <label>Foydalanuvchi nomi</label>
            <div className="app-input-box">
              <FaUser className="input-ico" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="app-input-group">
            <label>Parol</label>
            <div className="app-input-box">
              <FaLock className="input-ico" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parol"
                disabled={loading}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="app-options">
            <label className="remember-box">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Eslab qolish</span>
            </label>
          </div>

          <button type="submit" className="app-login-btn" disabled={loading}>
            {loading ? (
              <div className="spinner-box">
                <span className="spinner"></span>
                <span>Kirilmoqda...</span>
              </div>
            ) : (
              <>
                <span>Tizimga kirish</span>
                <FaSignInAlt />
              </>
            )}
          </button>
        </form>

        {/* Tezkor / Demo Rol tanlash */}
        <div className="quick-dropdown-container">
          <button
            type="button"
            className="quick-toggle-btn"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
          >
            <span>⚡ Tezkor / Demo rollar orqali kirish</span>
            <FaChevronDown className={`chevron ${showQuickMenu ? "rotate" : ""}`} />
          </button>

          {showQuickMenu && (
            <div className="quick-dropdown-list">
              {USERS.map((user) => (
                <div
                  key={user.id}
                  className="quick-item"
                  onClick={() => handleQuickLogin(user)}
                >
                  <span className="qi-icon" style={{ color: user.color }}>
                    {user.icon}
                  </span>
                  <div className="qi-text">
                    <strong>{user.name}</strong>
                    <small>{user.username} / {user.password}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="app-footer">
          <p>© 2026 SODIQJON Mobile SDK</p>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={1800} />
    </div>
  );
}

export default Login;