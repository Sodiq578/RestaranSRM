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
} from "react-icons/fa";
import { MdAccessTime, MdPerson } from "react-icons/md";
import "./Navbar.css";
import logo from "../assets/logo1.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState({
    name: "",
    role: "",
    profilePicture: ""
  });
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setUserInfo(user);
    setEditUser({
      name: user.name || "",
      role: user.role || "",
      profilePicture: user.profilePicture || ""
    });
  }, [location]);

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setMenuOpen(false);
    navigate("/login");
  };

  const handleUserUpdate = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...userInfo,
      name: editUser.name,
      role: editUser.role,
      profilePicture: editUser.profilePicture
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUserInfo(updatedUser);
    setShowUserModal(false);
    setMenuOpen(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUser({ ...editUser, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const isAdmin = userInfo?.role === "admin";
  const isWaiter = userInfo?.role === "waiter";
  const isKitchen = userInfo?.role === "kitchen";
  const isBar = userInfo?.role === "bar";

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="brand">
            <img src={logo} alt="Logo" className="logo-img" />
            <span className="brand-name">SDK System</span>
          </div>

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

          <div className="desktop-info">
            <span className="clock">
              <MdAccessTime className="clock-icon" />
              {currentTime}
            </span>
            {userInfo && (
              <span className="user-profile" onClick={() => setShowUserModal(true)}>
                {userInfo.profilePicture ? (
                  <img src={userInfo.profilePicture} alt="Profile" className="avatar" />
                ) : (
                  <MdPerson className="avatar-icon" />
                )}
                <span className="user-meta">
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
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </div>

          <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {menuOpen && <div className="overlay open" onClick={() => setMenuOpen(false)} />}

        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <div className="mobile-header">
            <h3>Menyu</h3>
            <button className="mobile-close" onClick={() => setMenuOpen(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="mobile-links">
            {(isAdmin || isWaiter) && (
              <Link to="/" className={`mobile-link ${location.pathname === "/" ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                <FaHome className="mobile-icon" /> Bosh Sahifa
              </Link>
            )}
            {(isAdmin || isWaiter) && (
              <Link to="/orders" className={`mobile-link ${location.pathname === "/orders" ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                <FaHistory className="mobile-icon" /> Buyurtmalar Tarixi
              </Link>
            )}
            {isAdmin && (
              <Link to="/reports" className={`mobile-link ${location.pathname === "/reports" ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                <FaChartBar className="mobile-icon" /> Hisobotlar
              </Link>
            )}
            {(isAdmin || isKitchen || isBar) && (
              <Link to="/kitchen" className={`mobile-link ${location.pathname === "/kitchen" ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                <FaUtensils className="mobile-icon" /> Oshxona
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={`mobile-link ${location.pathname === "/admin" ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                <FaUserCog className="mobile-icon" /> Admin Panel
              </Link>
            )}
            <div className="divider"></div>
            <div className="mobile-user-info">
              <span className="mobile-clock"><MdAccessTime /> {currentTime}</span>
              {userInfo && (
                <span className="mobile-user" onClick={() => setShowUserModal(true)}>
                  {userInfo.profilePicture ? (
                    <img src={userInfo.profilePicture} alt="Profile" className="mobile-avatar" />
                  ) : (
                    <MdPerson />
                  )}
                  <span>
                    {userInfo.name}
                    <small>
                      {userInfo.role === "admin" ? "Admin" : 
                       userInfo.role === "waiter" ? "Ofitsiant" : 
                       userInfo.role === "kitchen" ? "Oshxona" : 
                       userInfo.role === "bar" ? "Bar" : "Foydalanuvchi"}
                    </small>
                  </span>
                </span>
              )}
            </div>
            <button className="mobile-logout" onClick={handleLogout}>
              <FaSignOutAlt /> Tizimdan Chiqish
            </button>
          </div>
        </div>
      </nav>

      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Profilni Tahrirlash</h2>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUserUpdate} className="modal-form">
              <div className="field">
                <label>Ism</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  placeholder="Ismingizni kiriting"
                  required
                />
              </div>
              <div className="field">
                <label>Rasm</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {editUser.profilePicture && (
                  <img src={editUser.profilePicture} alt="Preview" className="preview" />
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowUserModal(false)}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn-save">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;