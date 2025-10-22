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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // ⏰ Vaqtni har soniyada yangilash
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

  // Scroll ni kuzatish
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    // Logout logikasi
    console.log("Chiqish amalga oshirildi");
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo va asosiy menyu */}
        <div className="nav-main">
          <div className="navbar-logo">
            <img src={logo} alt="Restoran POS Logo" className="app-logo" />
            <span className="logo-text">SDK System</span>
          </div>

          {/* Asosiy navigatsiya */}
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <MdRestaurantMenu className="nav-icon" />
              Bosh Sahifa
            </Link>
            <Link to="/orders" className="nav-link">
              <FaBars className="nav-icon" />
              Buyurtmalar Tarixi
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

        {/* Sarlavha va ma'lumotlar */}
        <header className="app-header">
          <div className="header-left">
            <h1>Restoran POS Tizimi</h1>
            <p className="header-subtitle">Professional boshqaruv yechimi</p>
          </div>
          <div className="header-info">
            <span className="time-display">
              <MdAccessTime className="info-icon" /> 
              {currentTime}
            </span>
            <span className="user-info">
              <MdPerson className="info-icon" /> 
              <span className="user-details">
                <strong>Admin</strong>
                <span className="user-role">Operator</span>
              </span>
            </span>
          </div>
        </header>

        {/* Burger Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? (
            <FaTimes className="icon-close" />
          ) : (
            <FaBars className="icon-menu" />
          )}
        </div>

        {/* Mobil menyu */}
        <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
          <div className="mobile-menu-header">
            <h3>Menyu</h3>
          </div>
          
          <div className="mobile-menu-links">
            <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>
              <MdRestaurantMenu className="mobile-icon" />
              Bosh Sahifa
            </Link>
            <Link to="/orders" className="mobile-link" onClick={() => setMenuOpen(false)}>
              <FaBars className="mobile-icon" />
              Buyurtmalar Tarixi
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
              <span className="mobile-user">
                <MdPerson /> Admin (Operator)
              </span>
            </div>
            
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt className="logout-icon" />
              Tizimdan Chiqish
            </button>
          </div>
        </div>

        {/* Overlay */}
        {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}
      </div>
    </nav>
  );
}

export default Navbar;