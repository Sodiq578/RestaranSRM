import React, { useEffect } from "react";
import {
  FaTimes,
  FaTable,
  FaUserTie,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaPrint,
  FaUtensils,
  FaComment,
  FaReceipt
} from "react-icons/fa";
import "./OrderHistoryModal.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const getStatusConfig = (status) => {
  switch (status) {
    case "To'lov qilindi":
      return { icon: <FaCheckCircle />, class: "ohm-status-paid", color: "#10b981", bgClass: "ohm-bg-paid" };
    case "To'lov kutilmoqda":
      return { icon: <FaClock />, class: "ohm-status-pending", color: "#f59e0b", bgClass: "ohm-bg-pending" };
    case "Qarz":
      return { icon: <FaExclamationTriangle />, class: "ohm-status-debt", color: "#ef4444", bgClass: "ohm-bg-debt" };
    case "Tayyorlashga yuborildi":
      return { icon: <FaUtensils />, class: "ohm-status-sent", color: "#3b82f6", bgClass: "ohm-bg-sent" };
    default:
      return { icon: <FaClock />, class: "ohm-status-default", color: "#6b7280", bgClass: "ohm-bg-default" };
  }
};

function OrderHistoryModal({ order, onClose, onPrint }) {
  if (!order) return null;

  const statusConfig = getStatusConfig(order.status);

  // Keyboard event
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div className="ohm-overlay" onClick={onClose}>
      <div className="ohm-container" onClick={(e) => e.stopPropagation()}>
        {/* ===== HEADER ===== */}
        <div className="ohm-header">
          <div className="ohm-header-left">
            <div className={`ohm-header-icon ${statusConfig.bgClass}`}>
              {statusConfig.icon}
            </div>
            <div className="ohm-header-info">
              <h2 className="ohm-title">
                Buyurtma #{order.id?.toString().slice(-6)}
              </h2>
              <span className={`ohm-status-badge ${statusConfig.class}`}>
                <span className="ohm-status-dot" style={{ background: statusConfig.color }}></span>
                {statusConfig.icon}
                {order.status}
              </span>
            </div>
          </div>
          <button className="ohm-close-btn" onClick={onClose} title="Yopish (Esc)">
            <FaTimes />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <div className="ohm-body">
          {/* Asosiy ma'lumotlar */}
          <div className="ohm-info-card">
            <h3 className="ohm-section-title">
              <FaReceipt /> Asosiy ma'lumotlar
            </h3>
            <div className="ohm-info-grid">
              <div className="ohm-info-item">
                <span className="ohm-info-label">
                  <FaTable /> Stol
                </span>
                <span className="ohm-info-value">{order.tableName || "Noma'lum"}</span>
              </div>

              <div className="ohm-info-item">
                <span className="ohm-info-label">
                  <FaUserTie /> Ofitsiant
                </span>
                <span className="ohm-info-value">{order.waiter || "Belgilanmagan"}</span>
              </div>

              <div className="ohm-info-item">
                <span className="ohm-info-label">
                  <FaCalendarAlt /> Sana
                </span>
                <span className="ohm-info-value">
                  {order.date ? new Date(order.date).toLocaleString("uz-UZ") : "—"}
                </span>
              </div>

              <div className="ohm-info-item">
                <span className="ohm-info-label">
                  <FaMoneyBillWave /> Jami summa
                </span>
                <span className="ohm-info-value ohm-total-highlight">
                  {formatPrice(order.total || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Buyurtma mahsulotlari */}
          <div className="ohm-items-card">
            <h3 className="ohm-section-title">
              <FaUtensils /> Buyurtma mahsulotlari
            </h3>

            {order.items && order.items.length > 0 ? (
              <div className="ohm-items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="ohm-item-row">
                    <div className="ohm-item-main">
                      <span className="ohm-item-num">{index + 1}.</span>
                      <span className="ohm-item-name">{item.name}</span>
                      <span className="ohm-item-qty">×{item.quantity}</span>
                      <span className="ohm-item-price">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    {item.comment && (
                      <div className="ohm-item-comment">
                        <FaComment />
                        <span>{item.comment}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="ohm-empty-items">
                <FaUtensils className="ohm-empty-icon" />
                <p>Mahsulotlar ro'yxati bo'sh</p>
              </div>
            )}

            {/* Jami */}
            <div className="ohm-items-total">
              <span>Jami:</span>
              <span>{formatPrice(order.total || 0)}</span>
            </div>
          </div>

          {/* Qarz ma'lumotlari */}
          {order.status === "Qarz" && order.debtDetails && (
            <div className="ohm-debt-card">
              <h3 className="ohm-section-title ohm-debt-title">
                <FaExclamationTriangle /> Qarz ma'lumotlari
              </h3>
              <div className="ohm-debt-grid">
                <div className="ohm-debt-item">
                  <span className="ohm-debt-label">Summa</span>
                  <span className="ohm-debt-value">
                    {formatPrice(order.debtDetails.amount)}
                  </span>
                </div>
                <div className="ohm-debt-item">
                  <span className="ohm-debt-label">Qarzdor</span>
                  <span className="ohm-debt-value">{order.debtDetails.debtorName}</span>
                </div>
                <div className="ohm-debt-item">
                  <span className="ohm-debt-label">Manzil</span>
                  <span className="ohm-debt-value">{order.debtDetails.debtorAddress}</span>
                </div>
                <div className="ohm-debt-item">
                  <span className="ohm-debt-label">To'lov sanasi</span>
                  <span className="ohm-debt-value">
                    {new Date(order.debtDetails.repaymentDate).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="ohm-footer">
          <button className="ohm-btn-secondary" onClick={onClose}>
            <FaTimes /> Yopish
          </button>
          {onPrint && (
            <button className="ohm-btn-print" onClick={() => onPrint(order)}>
              <FaPrint /> Chekni chop etish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderHistoryModal;