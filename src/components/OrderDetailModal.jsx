import React, { useEffect } from "react";
import {
  FaTimes,
  FaTable,
  FaUserTie,
  FaClock,
  FaCalendarAlt,
  FaCheckCircle,
  FaFire,
  FaHistory,
  FaMoneyBillWave,
  FaPrint,
  FaTrash,
  FaUtensils,
  FaComment,
  FaHourglassHalf
} from "react-icons/fa";
import "./OrderDetailModal.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const getStatusInfo = (status) => {
  switch (status) {
    case "pending":
      return { icon: <FaHourglassHalf />, label: "Kutilmoqda", class: "odm-status-pending", bgClass: "odm-bg-pending", color: "#f59e0b" };
    case "preparing":
      return { icon: <FaFire />, label: "Tayyorlanmoqda", class: "odm-status-preparing", bgClass: "odm-bg-preparing", color: "#ef4444" };
    case "ready":
      return { icon: <FaCheckCircle />, label: "Tayyor", class: "odm-status-ready", bgClass: "odm-bg-ready", color: "#10b981" };
    case "completed":
      return { icon: <FaHistory />, label: "Yakunlangan", class: "odm-status-completed", bgClass: "odm-bg-completed", color: "#6366f1" };
    default:
      return { icon: <FaClock />, label: "Noma'lum", class: "odm-status-default", bgClass: "odm-bg-default", color: "#6b7280" };
  }
};

function OrderDetailModal({ order, onClose, onPrint, onDelete, onStatusChange }) {
  // Hook har doim chaqirilishi kerak - shartli emas!
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  // Agar order bo'lmasa, null qaytarishdan oldin
  if (!order) return null;

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="odm-overlay" onClick={onClose}>
      <div className="odm-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="odm-header">
          <div className="odm-header-left">
            <div className={`odm-header-icon ${statusInfo.bgClass}`}>{statusInfo.icon}</div>
            <div className="odm-header-info">
              <h2 className="odm-title">Buyurtma #{order.kitchenId || order.id?.toString().slice(-6)}</h2>
              <span className={`odm-status-badge ${statusInfo.class}`}>
                <span className="odm-status-dot" style={{ background: statusInfo.color }}></span>
                {statusInfo.icon} {statusInfo.label}
              </span>
            </div>
          </div>
          <button className="odm-close-btn" onClick={onClose} title="Yopish (Esc)">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="odm-body">
          {/* Asosiy ma'lumotlar */}
          <div className="odm-info-card">
            <h3 className="odm-section-title"><FaTable /> Asosiy ma'lumotlar</h3>
            <div className="odm-info-grid">
              <div className="odm-info-item">
                <span className="odm-info-label"><FaTable /> Stol</span>
                <span className="odm-info-value">{order.tableName || "Noma'lum"}</span>
              </div>
              <div className="odm-info-item">
                <span className="odm-info-label"><FaUserTie /> Ofitsiant</span>
                <span className="odm-info-value">{order.waiter || "Belgilanmagan"}</span>
              </div>
              <div className="odm-info-item">
                <span className="odm-info-label"><FaCalendarAlt /> Qabul qilingan</span>
                <span className="odm-info-value">
                  {order.date ? new Date(order.date).toLocaleString("uz-UZ") : "—"}
                </span>
              </div>
              {order.startTime && (
                <div className="odm-info-item">
                  <span className="odm-info-label"><FaFire /> Tayyorlash boshlandi</span>
                  <span className="odm-info-value">{new Date(order.startTime).toLocaleTimeString("uz-UZ")}</span>
                </div>
              )}
              {order.readyTime && (
                <div className="odm-info-item">
                  <span className="odm-info-label"><FaCheckCircle /> Tayyor bo'ldi</span>
                  <span className="odm-info-value">{new Date(order.readyTime).toLocaleTimeString("uz-UZ")}</span>
                </div>
              )}
              {order.completedTime && (
                <div className="odm-info-item">
                  <span className="odm-info-label"><FaHistory /> Yakunlandi</span>
                  <span className="odm-info-value">{new Date(order.completedTime).toLocaleString("uz-UZ")}</span>
                </div>
              )}
              {order.preparationTime !== undefined && order.preparationTime > 0 && (
                <div className="odm-info-item">
                  <span className="odm-info-label"><FaClock /> Tayyorlanish vaqti</span>
                  <span className="odm-info-value">
                    <span className="odm-time-badge">{order.preparationTime} daqiqa</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Buyurtma mahsulotlari */}
          <div className="odm-items-card">
            <h3 className="odm-section-title"><FaUtensils /> Buyurtma mahsulotlari</h3>
            {order.items && order.items.length > 0 ? (
              <div className="odm-items-table-wrapper">
                <table className="odm-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mahsulot</th>
                      <th>Miqdor</th>
                      <th>Narx</th>
                      <th>Jami</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr className="odm-item-row">
                          <td className="odm-item-num">{index + 1}</td>
                          <td className="odm-item-name-cell">
                            <span className="odm-item-name">{item.name}</span>
                            {item.notes && (
                              <span className="odm-item-notes" title={item.notes}>
                                <FaComment /> {item.notes.length > 30 ? item.notes.slice(0, 30) + "..." : item.notes}
                              </span>
                            )}
                          </td>
                          <td className="odm-item-qty">×{item.quantity}</td>
                          <td className="odm-item-price">{formatPrice(item.price)}</td>
                          <td className="odm-item-total">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                        {item.notes && item.notes.length > 30 && (
                          <tr className="odm-notes-full-row">
                            <td colSpan="5">
                              <div className="odm-notes-full">
                                <FaComment /> {item.notes}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="odm-total-row">
                      <td colSpan="4">Jami summa:</td>
                      <td className="odm-total-amount">
                        {formatPrice(
                          order.totalAmount || 
                          order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="odm-empty-items">
                <FaUtensils className="odm-empty-icon" />
                <p>Mahsulotlar ro'yxati bo'sh</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="odm-footer">
          <div className="odm-footer-left">
            {onDelete && (
              <button className="odm-btn-delete" onClick={() => onDelete(order)} title="O'chirish">
                <FaTrash /> O'chirish
              </button>
            )}
          </div>
          <div className="odm-footer-right">
            <button className="odm-btn-secondary" onClick={onClose}>
              <FaTimes /> Yopish
            </button>
            
            {onPrint && (
              <button className="odm-btn-print" onClick={() => onPrint(order)}>
                <FaPrint /> Chop etish
              </button>
            )}
            
            {onStatusChange && order.status === "pending" && (
              <button className="odm-btn-primary" onClick={() => onStatusChange(order, "preparing")}>
                <FaFire /> Tayyorlashni boshlash
              </button>
            )}
            
            {onStatusChange && order.status === "preparing" && (
              <button className="odm-btn-success" onClick={() => onStatusChange(order, "ready")}>
                <FaCheckCircle /> Tayyor deb belgilash
              </button>
            )}
            
            {onStatusChange && order.status === "ready" && (
              <button className="odm-btn-complete" onClick={() => onStatusChange(order, "completed")}>
                <FaHistory /> Yakunlash
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;