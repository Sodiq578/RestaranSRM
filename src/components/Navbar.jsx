import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt, FaCog } from "react-icons/fa";
import { MdAccessTime, MdPerson, MdRestaurantMenu } from "react-icons/md";
import "./Navbar.css";
import logo from "../assets/logo1.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Admin",
    role: "Operator",
    profilePicture: null
  });

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  // Handle file input for profile picture
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo({ ...userInfo, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the updated user info to a backend
    console.log("Updated user info:", userInfo);
    setModalOpen(false);
  };

  // Update time every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(timeString);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    console.log("Chiqish amalga oshirildi");
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <div className="nav-main">
          <div className="navbar-logo">
            <img src={logo} alt="Restoran POS Logo" className="app-logo" />
            <span className="logo-text">SDK System</span>
          </div>

          <div className="nav-links">
            <Link to="/" className="nav-link">
              <MdRestaurantMenu className="nav-icon" />
              Bosh Sahifa
            </Link>
            <Link to="/reports" className="nav-link">
              <FaCog className="nav-icon" />
              Hisobotlar
            </Link>
            <Link to="/admin" className="nav-link">
              <MdPerson className="nav-icon" />
              Admin
            </Link>
          </div>
        </div>

        <header className="app-header">
          <div className="header-left">
            <p className="header-subtitle">Professional boshqaruv yechimi</p>
          </div>
          <div className="header-info">
            <span className="time-display">
              <MdAccessTime className="info-icon" />
              {currentTime}
            </span>
            <span className="user-info" onClick={toggleModal}>
              {userInfo.profilePicture ? (
                <img
                  src={userInfo.profilePicture}
                  alt="Profile"
                  className="profile-picture"
                />
              ) : (
                <MdPerson className="info-icon" />
              )}
              <span className="user-details">
                <strong>{userInfo.name}</strong>
                <span className="user-role">{userInfo.role}</span>
              </span>
            </span>
          </div>
        </header>

        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? (
            <FaTimes className="icon-close" />
          ) : (
            <FaBars className="icon-menu" />
          )}
        </div>

        <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
          <div className="mobile-menu-header">
            <h3>Menyu</h3>
          </div>
          
          <div className="mobile-menu-links">
            <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>
              <MdRestaurantMenu className="mobile-icon" />
              Bosh Sahifa
            </Link>
            <Link to="/reports" className="mobile-link" onClick={() => setMenuOpen(false)}>
              <FaCog className="mobile-icon" />
              Hisobotlar
            </Link>
            <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>
              <MdPerson className="mobile-icon" />
              Admin Panel
            </Link>
            <div className="mobile-menu-divider"></div>
            <div className="mobile-user-info">
              <span className="mobile-time">
                <MdAccessTime /> {currentTime}
              </span>
              <span className="mobile-user" onClick={toggleModal}>
                {userInfo.profilePicture ? (
                  <img
                    src={userInfo.profilePicture}
                    alt="Profile"
                    className="mobile-profile-picture"
                  />
                ) : (
                  <MdPerson />
                )}
                {userInfo.name} ({userInfo.role})
              </span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt className="logout-icon" />
              Tizimdan Chiqish
            </button>
          </div>
        </div>

        {modalOpen && (
          <div className="modal-overlay">
            <div className="user-modal">
              <div className="modal-header">
                <h2>Foydalanuvchi Ma'lumotlari</h2>
                <FaTimes className="modal-close" onClick={toggleModal} />
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="name">Ism:</label>
                  <input
                    type="text"
                    id="name"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, name: e.target.value })
                    }
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="profilePicture">Rasm:</label>
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {userInfo.profilePicture && (
                    <img
                      src={userInfo.profilePicture}
                      alt="Preview"
                      className="preview-image"
                    />
                  )}
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-btn">
                    Saqlash
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={toggleModal}
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}
      </div>
    </nav>
  );
}

export default Navbar;