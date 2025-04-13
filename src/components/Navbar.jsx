import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <nav
        style={{
          background: "#2c3e50",
          padding: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        {/* Logo or brand can go here */}
        <div style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
          Logo
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div style={{ display: "flex" }}>
            <Link
              to="/"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "18px",
                padding: "10px 15px",
                margin: "0 5px",
              }}
            >
              Bosh sahifa
            </Link>
            <Link
              to="/reports"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "18px",
                padding: "10px 15px",
                margin: "0 5px",
              }}
            >
              Hisobotlar
            </Link>
            <Link
              to="/admin"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "18px",
                padding: "10px 15px",
                margin: "0 5px",
              }}
            >
              Admin
            </Link>
            <Link
              to="/login"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "18px",
                padding: "10px 15px",
                margin: "0 5px",
              }}
            >
              Kirish
            </Link>
          </div>
        )}

        {/* Mobile Hamburger Menu */}
        {isMobile && (
          <div
            onClick={toggleMenu}
            style={{
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              padding: "10px",
            }}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
        )}
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobile && menuOpen && (
        <div
          style={{
            background: "#34495e",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px 0",
            position: "absolute",
            width: "100%",
            zIndex: "1000",
            boxShadow: "0 5px 10px rgba(0,0,0,0.2)",
          }}
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "18px",
              padding: "15px",
              width: "100%",
              textAlign: "center",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Bosh sahifa
          </Link>
          <Link
            to="/reports"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "18px",
              padding: "15px",
              width: "100%",
              textAlign: "center",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Hisobotlar
          </Link>
          <Link
            to="/admin"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "18px",
              padding: "15px",
              width: "100%",
              textAlign: "center",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Admin
          </Link>
          <Link
            to="/login"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "18px",
              padding: "15px",
              width: "100%",
              textAlign: "center",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Kirish
          </Link>
        </div>
      )}
    </>
  );
}

export default Navbar;