import React, { useContext, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Dashboard from "../components/Dashboard";
import TableList from "../components/TableList";
import MenuItem from "../components/MenuItem";
import OrderForm from "../components/OrderForm";
import { FaHome, FaChair, FaBook, FaShoppingCart } from "react-icons/fa";
import "./Home.css";

const Home = () => {
  const { tables, selectedTableId, selectTable, menu } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["dashboard", "tables", "menu", "order"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const categories = ["all", ...new Set(menu.map(item => item.category))];
  const filteredMenu = selectedCategory === "all" 
    ? menu 
    : menu.filter(item => item.category === selectedCategory);

  const handleTableSelect = useCallback((tableId) => {
    selectTable(tableId);
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    if (table.orders.length === 0) {
      setActiveTab("menu");
      navigate("/?tab=menu", { replace: true });
    } else {
      setActiveTab("order");
      navigate("/?tab=order", { replace: true });
    }
  }, [tables, selectTable, navigate]);

  const tabs = [
    { key: "dashboard", label: "Bosh sahifa", icon: <FaHome /> },
    { key: "tables", label: "Stollar", icon: <FaChair /> },
    { key: "menu", label: "Menyu", icon: <FaBook /> },
  ];

  if (selectedTableId) {
    tabs.push({
      key: "order",
      label: `Buyurtma (${selectedTable?.orders?.length || 0})`,
      icon: <FaShoppingCart />
    });
  }

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "dashboard") {
      navigate("/", { replace: true });
    } else {
      navigate(`/?tab=${key}`, { replace: true });
    }
  };

  return (
    <div className="home-wrapper">
      <div className="home-tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`home-tab-btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="home-content-area">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "tables" && <TableList onSelectTable={handleTableSelect} />}
        {activeTab === "menu" && (
          <div className="home-menu-panel">
            <div className="home-category-list">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`home-category-btn ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === "all" ? "📋 Barcha" : cat}
                </button>
              ))}
            </div>
            <div className="home-menu-grid">
              {filteredMenu.map(item => <MenuItem key={item.id} item={item} />)}
            </div>
          </div>
        )}
        {activeTab === "order" && selectedTableId && (
          <div className="home-order-panel">
            <OrderForm tableId={selectedTableId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;