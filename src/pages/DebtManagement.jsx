// src/pages/DebtManagement.jsx
import React, { useContext, useState, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { FaPhone, FaSearch, FaTimes, FaMoneyBillWave, FaUser, FaCalendarAlt, FaHome } from "react-icons/fa";
import "./DebtManagement.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const DebtManagement = () => {
  const { ordersHistory, confirmPayment } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Faqat qarz buyurtmalar
  const debtOrders = useMemo(() => {
    return ordersHistory.filter(order => order.status === "Qarz");
  }, [ordersHistory]);

  // Filter va qidiruv
  const filteredDebts = useMemo(() => {
    return debtOrders.filter(order => {
      const search = searchTerm.toLowerCase();
      const debt = order.debtDetails || {};
      const matchesSearch = 
        (order.tableName || "").toLowerCase().includes(search) ||
        (debt.debtorName || "").toLowerCase().includes(search) ||
        (debt.debtorPhone || "").includes(search);
      
      const now = new Date();
      const repayDate = new Date(debt.repaymentDate);
      const isOverdue = repayDate < now;
      
      if (filterStatus === "overdue") return isOverdue;
      if (filterStatus === "upcoming") return !isOverdue;
      return true;
    });
  }, [debtOrders, searchTerm, filterStatus]);

  // Telefon raqamiga qo'ng'iroq qilish
  const handleCall = (phone) => {
    if (!phone) {
      toast.warning("Telefon raqami mavjud emas!");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  // Qarzni to'lov qilish
  const handlePayDebt = (orderId) => {
    const order = ordersHistory.find(o => o.id === orderId);
    if (!order) return;
    
    confirmPayment(order.tableId);
    toast.success("✅ Qarz to'landi!");
  };

  // Statistikalar
  const stats = useMemo(() => {
    const total = debtOrders.length;
    const totalAmount = debtOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const overdue = debtOrders.filter(o => {
      const repayDate = new Date(o.debtDetails?.repaymentDate);
      return repayDate < new Date();
    }).length;
    return { total, totalAmount, overdue };
  }, [debtOrders]);

  if (debtOrders.length === 0) {
    return (
      <div className="debt-empty-state">
        <div className="debt-empty-icon">💰</div>
        <h2>Qarzdorlar mavjud emas</h2>
        <p>Hozircha hech qanday qarz buyurtmasi yo'q</p>
      </div>
    );
  }

  return (
    <div className="debt-page">
      <div className="debt-header">
        <h1>💰 Qarzlar</h1>
        <p>Qarzdorlar ro'yxati va boshqaruvi</p>
      </div>

      {/* Statistics */}
      <div className="debt-stats">
        <div className="debt-stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Jami qarzdorlar</span>
        </div>
        <div className="debt-stat-card overdue">
          <span className="stat-number">{stats.overdue}</span>
          <span className="stat-label">Muddati o'tgan</span>
        </div>
        <div className="debt-stat-card amount">
          <span className="stat-number">{formatPrice(stats.totalAmount)}</span>
          <span className="stat-label">Umumiy qarz</span>
        </div>
      </div>

      {/* Filters */}
      <div className="debt-filters">
        <div className="debt-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Ism, telefon yoki stol bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              <FaTimes />
            </button>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="debt-filter-select"
        >
          <option value="all">📋 Barcha</option>
          <option value="overdue">🔴 Muddati o'tgan</option>
          <option value="upcoming">🟡 Muddati kelgan</option>
        </select>
      </div>

      {/* Debt List */}
      <div className="debt-list">
        {filteredDebts.map((order) => {
          const debt = order.debtDetails || {};
          const isOverdue = new Date(debt.repaymentDate) < new Date();
          
          return (
            <div key={order.id} className={`debt-card ${isOverdue ? "overdue" : "upcoming"}`}>
              <div className="debt-card-header">
                <div className="debt-user">
                  <div className="debt-avatar">
                    <FaUser />
                  </div>
                  <div className="debt-user-info">
                    <h4>{debt.debtorName || "Noma'lum"}</h4>
                    <span className="debt-table">Stol: {order.tableName}</span>
                  </div>
                </div>
                <span className={`debt-status ${isOverdue ? "overdue" : "upcoming"}`}>
                  {isOverdue ? "🔴 Muddati o'tgan" : "🟡 Muddati kelgan"}
                </span>
              </div>

              <div className="debt-card-body">
                <div className="debt-info-row">
                  <span className="debt-label">📞 Telefon</span>
                  <span className="debt-value">
                    {debt.debtorPhone ? (
                      <button 
                        className="debt-phone-btn"
                        onClick={() => handleCall(debt.debtorPhone)}
                      >
                        <FaPhone /> {debt.debtorPhone}
                      </button>
                    ) : (
                      "Ko'rsatilmagan"
                    )}
                  </span>
                </div>
                <div className="debt-info-row">
                  <span className="debt-label">🏠 Manzil</span>
                  <span className="debt-value">{debt.debtorAddress || "Ko'rsatilmagan"}</span>
                </div>
                <div className="debt-info-row">
                  <span className="debt-label">📅 To'lov sanasi</span>
                  <span className="debt-value">
                    {new Date(debt.repaymentDate).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
                <div className="debt-info-row amount">
                  <span className="debt-label">💰 Qarz summasi</span>
                  <span className="debt-value">{formatPrice(debt.amount || order.total)}</span>
                </div>
              </div>

              <div className="debt-card-actions">
                {debt.debtorPhone && (
                  <button className="debt-btn call" onClick={() => handleCall(debt.debtorPhone)}>
                    <FaPhone /> Qo'ng'iroq qilish
                  </button>
                )}
                <button className="debt-btn pay" onClick={() => handlePayDebt(order.id)}>
                  <FaMoneyBillWave /> To'lov qilish
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDebts.length === 0 && (
        <div className="debt-empty-filter">
          <p>🔍 Qidiruv bo'yicha natija topilmadi</p>
        </div>
      )}
    </div>
  );
};

export default DebtManagement;