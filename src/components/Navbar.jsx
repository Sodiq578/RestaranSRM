import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FaBars, 
  FaTimes, 
  FaSignOutAlt, 
  FaUtensils,
  FaHistory,
  FaHome,
  FaChartBar,
  FaUserCog,
  FaUserTie,
  FaChevronDown,
  FaUser,
  FaKey,
  FaBell,
  FaMoon,
  FaSun
} from "react-icons/fa";
import { MdAccessTime, MdPerson } from "react-icons/md";
import "./Navbar.css";
import logo from "../assets/logo1.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [settingsDropdown, setSettingsDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Foydalanuvchi ma'lumotlarini yuklash
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setUserInfo(user);
  }, [location]);

  // Vaqt
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setMenuOpen(false);
    navigate("/login");
  };

  const isAdmin = userInfo?.role === "admin";
  const isWaiter = userInfo?.role === "waiter";
  const isKitchen = userInfo?.role === "kitchen";
  const isBar = userInfo?.role === "bar";

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <div className="nav-main">
          {/* Logo */}
          <div className="navbar-logo">
            <img src={logo} alt="Logo" className="app-logo" />
            <span className="logo-text">SDK System</span>
          </div>

          {/* Desktop Links - Role based */}
          <div className="nav-links">
            {(isAdmin || isWaiter) && (
              <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
                <FaHome className="nav-icon" /> Bosh Sahifa
              </Link>
            )}
            
            {(isAdmin || isWaiter) && (
              <Link to="/orders" className={`nav-link ${location.pathname === "/orders" ? "active" : ""}`}>
                <FaHistory className="nav-icon" /> Buyurtmalar Tarixi
              </Link>
            )}
            
            {isAdmin && (
              <Link to="/reports" className={`nav-link ${location.pathname === "/reports" ? "active" : ""}`}>
                <FaChartBar className="nav-icon" /> Hisobotlar
              </Link>
            )}
            
            {(isAdmin || isKitchen || isBar) && (
              <Link to="/kitchen" className={`nav-link ${location.pathname === "/kitchen" ? "active" : ""}`}>
                <FaUtensils className="nav-icon" /> Oshxona
              </Link>
            )}
            
            {(isAdmin || isWaiter) && (
              <Link to="/user" className={`nav-link ${location.pathname === "/user" ? "active" : ""}`}>
                <FaUserTie className="nav-icon" /> Foydalanuvchi
              </Link>
            )}
            
            {isAdmin && (
              <Link to="/admin" className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}>
                <FaUserCog className="nav-icon" /> Admin
              </Link>
            )}
          </div>
        </div>

        {/* Header Info */}
        <div className="app-header">
          <div className="header-info">
            <span className="time-display">
              <MdAccessTime className="info-icon" />
              {currentTime}
            </span>
            {userInfo && (
              <span className="user-info">
                <MdPerson className="info-icon" />
                <span className="user-details">
                  <strong>{userInfo.name}</strong>
                  <span className="user-role">
                    {userInfo.role === "admin" ? "Admin" : 
                     userInfo.role === "waiter" ? "Ofitsiant" : 
                     userInfo.role === "kitchen" ? "Oshxona" : 
                     userInfo.role === "bar" ? "Bar" : "Foydalanuvchi"}
                  </span>
                </span>
              </span>
            )}
            <button className="logout-btn-header" onClick={handleLogout} title="Chiqish">
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <h3>Menyu</h3>
        </div>
        
        <div className="mobile-menu-links">
          {(isAdmin || isWaiter) && (
            <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>
              <FaHome /> Bosh Sahifa
            </Link>
          )}
          {(isAdmin || isWaiter) && (
            <Link to="/orders" className="mobile-link" onClick={() => setMenuOpen(false)}>
              <FaHistory /> Buyurtmalar Tarixi
            </Link>
          )}
          {isAdmin && (
            <Link to="/reports" className="mobile-link" onClick={() => setMenuOpen(false)}>
              <FaChartBar /> Hisobotlar
            </Link>
          )}
          {(isAdmin || isKitchen || isBar) && (
            <Link to="/kitchen" className="mobile-link" onClick={() => setMenuOpen(false)}>
              <FaUtensils /> Oshxona
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>
              <FaUserCog /> Admin Panel
            </Link>
          )}
          
          <div className="mobile-menu-divider"></div>
          
          <div className="mobile-user-info">
            <span className="mobile-time">
              <MdAccessTime /> {currentTime}
            </span>
            {userInfo && (
              <span className="mobile-user">
                <MdPerson /> {userInfo.name} ({userInfo.role})
              </span>
            )}
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Tizimdan Chiqish
          </button>
        </div>
      </div>

      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}
    </nav>
  );
}

export default Navbar;