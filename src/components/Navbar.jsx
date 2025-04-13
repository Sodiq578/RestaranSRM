import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        background: "#2c3e50",
        padding: "15px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "18px", padding: "10px" }}>
        Bosh sahifa
      </Link>
      <Link to="/reports" style={{ color: "white", textDecoration: "none", fontSize: "18px", padding: "10px" }}>
        Hisobotlar
      </Link>
      <Link to="/admin" style={{ color: "white", textDecoration: "none", fontSize: "18px", padding: "10px" }}>
        Admin
      </Link>
      <Link to="/login" style={{ color: "white", textDecoration: "none", fontSize: "18px", padding: "10px" }}>
        Kirish
      </Link>
    </nav>
  );
}

export default Navbar;