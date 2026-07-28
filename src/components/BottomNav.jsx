import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  FaHome,
  FaClipboard,
  FaUtensils,
  FaUserCog,
  FaUserTie,
  FaChair,
  FaBook,
} from "react-icons/fa";
import "./BottomNav.css";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AppContext) || {};
  const currentUser = user || JSON.parse(localStorage.getItem("currentUser") || "{}");
  const role = currentUser?.role || "";

  const isAdmin = role === "admin";
  const isWaiter = role === "waiter";
  const isKitchen = role === "kitchen";
  const isBar = role === "bar";

  const tabs = [];

  if (isAdmin || isWaiter) {
    tabs.push({ key: "home", label: "Bosh sahifa", icon: <FaHome />, path: "/", tab: "dashboard" });
  }

  if (isAdmin || isWaiter) {
    tabs.push({ key: "tables", label: "Stollar", icon: <FaChair />, path: "/", tab: "tables" });
  }

  if (isAdmin || isWaiter) {
    tabs.push({ key: "menu", label: "Menyu", icon: <FaBook />, path: "/", tab: "menu" });
  }

  if (isAdmin || isWaiter) {
    tabs.push({ key: "orders", label: "Buyurtmalar", icon: <FaClipboard />, path: "/orders" });
  }

  if (isAdmin || isKitchen || isBar) {
    tabs.push({ key: "kitchen", label: "Oshxona", icon: <FaUtensils />, path: "/kitchen" });
  }

  if (isAdmin) {
    tabs.push({ key: "admin", label: "Admin", icon: <FaUserCog />, path: "/admin" });
  }

  if (isAdmin || isWaiter || isKitchen || isBar) {
    tabs.push({ key: "user", label: "Profil", icon: <FaUserTie />, path: "/user" });
  }

  if (tabs.length < 2) return null;

  const activeTab = tabs.find((t) => {
    if (t.path === location.pathname) {
      if (t.path === "/" && t.tab) {
        const params = new URLSearchParams(location.search);
        return params.get("tab") === t.tab;
      }
      return true;
    }
    return false;
  })?.key || "home";

  const handleTabClick = (tab) => {
    if (tab.path === "/" && tab.tab) {
      navigate(`/?tab=${tab.tab}`);
    } else {
      navigate(tab.path);
    }
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`bottom-nav-item ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => handleTabClick(tab)}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;