import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">Logo</div>

      {/* Burger Icon */}
      <div className="menu-icon" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Bosh sahifa
          </Link>
          <Link to="/reports" onClick={() => setMenuOpen(false)}>
            Hisobotlar
          </Link>
          <Link to="/admin" onClick={() => setMenuOpen(false)}>
            Admin
          </Link>
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            Kirish
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
