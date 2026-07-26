// src/components/OrderForm.jsx
import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { 
  FaMinus, FaPlus, FaTrashAlt, FaUtensils, FaMoneyBillWave, 
  FaCreditCard, FaQrcode, FaExchangeAlt, FaTimes, FaCheckCircle,
  FaShoppingCart, FaEdit, FaReceipt, FaPrint, FaExclamationTriangle,
  FaClock, FaUserTie, FaChair
} from "react-icons/fa";
import "./OrderForm.css";
import { toast } from 'react-toastify';

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const OrderForm = ({ tableId }) => {
  const { 
    tables, 
    removeFromOrder, 
    updateOrder, 
    completeOrder, 
    sendOrdersToPreparation, 
    generateReceiptPDF, 
    markAsDebt,
    updateTableStatus
  } = useContext(AppContext);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [editingComment, setEditingComment] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Qarz ma'lumotlari
  const [debtData, setDebtData] = useState({
    debtorName: "",
    debtorPhone: "",
    debtorAddress: "",
    repaymentDate: "",
    amount: 0
  });
  
  const table = tables.find(t => t.id === tableId);
  
  // ==================== HOOKLAR (RETURN DAN OLDIN) ====================
  // O'rtacha ovqatlanish vaqtini hisoblash (agar stol band bo'lsa)
  useEffect(() => {
    let interval;
    if (table && (table.status === "Band" || table.status === "Zakaz qo'shildi" || table.status === "Tayyorlashga yuborildi")) {
      const start = table.startTime ? new Date(table.startTime) : new Date();
      const updateTimer = () => {
        const now = new Date();
        const diff = Math.floor((now - start) / 60000);
        setElapsedTime(diff);
      };
      updateTimer();
      interval = setInterval(updateTimer, 60000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [table, table?.status, table?.startTime]);

  // ==================== EARLY RETURN ====================
  if (!table) return <div className="order-empty">Stol topilmadi</div>;

  const orders = table.orders || [];
  const subtotal = orders.reduce((sum, o) => sum + (o.price || 0) * (o.quantity || 0), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const total = subtotal - discountAmount + taxAmount;

  if (orders.length === 0) {
    return (
      <div className="order-empty-state">
        <FaShoppingCart className="empty-cart-icon" />
        <h3>Buyurtma bo'sh</h3>
        <p>Menyudan taom qo'shing</p>
        {(table.status === "Band" || table.status === "Zakaz qo'shildi" || table.status === "Tayyorlashga yuborildi" || table.status === "To'lov kutilmoqda") && (
          <button className="free-table-btn" onClick={handleFreeTable}>
            <FaChair /> Stolni bo'shatish
          </button>
        )}
      </div>
    );
  }

  // ==================== FUNKSIYALAR ====================
  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) {
      removeFromOrder(tableId, index);
    } else {
      updateOrder(tableId, index, newQuantity, orders[index].comment || "");
    }
  };

  const handleCommentChange = (index, newComment) => {
    updateOrder(tableId, index, orders[index].quantity, newComment);
    setEditingComment(null);
  };

  const handleComplete = () => setShowPaymentModal(true);
  
  const handlePaymentConfirm = () => {
    completeOrder(tableId, true);
    setShowPaymentModal(false);
  };
  
  const handleSendKitchen = () => sendOrdersToPreparation(tableId);

  const handleViewReceipt = () => {
    const receiptOrder = {
      id: Date.now(),
      items: orders,
      total: total,
      date: new Date(),
      tableId: table.id,
      tableName: table.name,
      waiter: table.waiter || "Belgilanmagan",
      status: "To'lov kutilmoqda"
    };
    generateReceiptPDF(receiptOrder);
    setShowReceiptModal(true);
  };

  // Qarzga belgilash
  const openDebtModal = () => {
    setDebtData({
      debtorName: "",
      debtorPhone: "",
      debtorAddress: "",
      repaymentDate: "",
      amount: total
    });
    setShowDebtModal(true);
  };

  const handleDebtSubmit = () => {
    if (!debtData.debtorName || !debtData.repaymentDate) {
      toast.error("Iltimos, qarzdor ismi va to'lov sanasini kiriting!");
      return;
    }
    markAsDebt(tableId, {
      amount: debtData.amount,
      debtorName: debtData.debtorName,
      debtorPhone: debtData.debtorPhone || "",
      debtorAddress: debtData.debtorAddress || "",
      repaymentDate: debtData.repaymentDate
    });
    setShowDebtModal(false);
  };

  // Stolni bo'shatish
  const handleFreeTable = () => {
    if (window.confirm(`"${table.name}" stolini bo'shatishni tasdiqlaysizmi? Barcha buyurtmalar o'chiriladi!`)) {
      // Barcha buyurtmalarni o'chirish
      const tableOrders = [...table.orders];
      tableOrders.forEach((_, index) => {
        removeFromOrder(tableId, 0);
      });
      // Stol statusini "Bo'sh" ga o'zgartirish
      updateTableStatus(tableId, "Bo'sh");
      toast.success(`✅ ${table.name} bo'shatildi!`);
    }
  };

  // O'rtacha ovqatlanish vaqti va stol holati
  const getTableStatusInfo = () => {
    if (table.status === "Bo'sh") {
      return { icon: "🟢", text: "Bo'sh", color: "#22c55e" };
    } else if (table.status === "Band" || table.status === "Zakaz qo'shildi") {
      return { icon: "🔴", text: "Band", color: "#ef4444" };
    } else if (table.status === "Tayyorlashga yuborildi") {
      return { icon: "🟡", text: "Tayyorlanmoqda", color: "#f59e0b" };
    } else if (table.status === "To'lov kutilmoqda") {
      return { icon: "🟠", text: "To'lov kutilmoqda", color: "#f97316" };
    } else if (table.status === "Qarz") {
      return { icon: "🔴", text: "Qarz", color: "#dc2626" };
    } else {
      return { icon: "⚪", text: table.status || "Noma'lum", color: "#6b7280" };
    }
  };

  const statusInfo = getTableStatusInfo();

  return (
    <div className="order-form-wrapper">
      {/* ===== TABLE INFO ===== */}
      <div className="order-table-info">
        <div className="order-table-info-left">
          <div className="table-status-indicator" style={{ background: statusInfo.color }}>
            <span>{statusInfo.icon}</span>
          </div>
          <div>
            <h3 className="order-table-name">{table.name}</h3>
            <span className="order-table-status" style={{ color: statusInfo.color }}>
              {statusInfo.text}
            </span>
            {table.waiter && (
              <span className="order-table-waiter">
                <FaUserTie /> {table.waiter}
              </span>
            )}
          </div>
        </div>
        <div className="order-table-info-right">
          {elapsedTime > 0 && (
            <div className="order-table-time">
              <FaClock /> {elapsedTime} daqiqa
            </div>
          )}
          <button className="free-table-btn-small" onClick={handleFreeTable} title="Stolni bo'shatish">
            <FaChair />
          </button>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <div className="order-header">
        <div className="order-header-left">
          <FaUtensils className="order-header-icon" />
          <h3>Buyurtmalar</h3>
          <span className="order-badge">{orders.length} ta</span>
        </div>
        <div className="order-header-actions">
          <button className="btn-receipt" onClick={handleViewReceipt}>
            <FaReceipt /> Chek
          </button>
          <button className="btn-kitchen" onClick={handleSendKitchen}>
            <FaUtensils /> Oshxonaga
          </button>
        </div>
      </div>

      {/* ===== ITEMS ===== */}
      <div className="order-items">
        {orders.map((item, index) => (
          <div key={index} className="order-item">
            <div className="order-item-info">
              <span className="item-name">{item.name}</span>
              {item.comment && (
                <span className="item-comment">📝 {item.comment}</span>
              )}
              {editingComment === index ? (
                <div className="comment-edit">
                  <input
                    type="text"
                    defaultValue={item.comment || ""}
                    placeholder="Izoh yozing..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCommentChange(index, e.target.value);
                      }
                      if (e.key === 'Escape') {
                        setEditingComment(null);
                      }
                    }}
                    onBlur={(e) => {
                      handleCommentChange(index, e.target.value);
                    }}
                  />
                </div>
              ) : (
                <button 
                  className="edit-comment-btn" 
                  onClick={() => setEditingComment(index)}
                  title="Izoh qo'shish/yangilash"
                >
                  <FaEdit /> {item.comment ? "Tahrirlash" : "Izoh qo'shish"}
                </button>
              )}
            </div>
            <div className="order-item-controls">
              <button 
                className="qty-btn minus" 
                onClick={() => handleQuantityChange(index, item.quantity - 1)}
              >
                <FaMinus />
              </button>
              <span className="qty-value">{item.quantity}</span>
              <button 
                className="qty-btn plus" 
                onClick={() => handleQuantityChange(index, item.quantity + 1)}
              >
                <FaPlus />
              </button>
              <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
              <button 
                className="remove-btn" 
                onClick={() => removeFromOrder(tableId, index)}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== SUMMARY ===== */}
      <div className="order-summary">
        <div className="summary-row">
          <span>Oraliq summa</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="summary-row discount">
          <span>Chegirma ({discount}%)</span>
          <span>- {formatPrice(discountAmount)}</span>
        </div>
        <div className="summary-row tax">
          <span>Soliq ({tax}%)</span>
          <span>+ {formatPrice(taxAmount)}</span>
        </div>
        <div className="summary-row total">
          <span>JAMI</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="order-actions">
        <button className="btn-debt" onClick={openDebtModal}>
          <FaExclamationTriangle /> Qarzga yozish
        </button>
        <button className="btn-payment" onClick={handleComplete}>
          <FaMoneyBillWave /> To'lov
        </button>
      </div>

      {/* ===== MODALS ===== */}
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h3>💳 To'lov usuli</h3>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="payment-methods">
              <button className={`pay-method ${paymentMethod === "cash" ? "active" : ""}`} onClick={() => setPaymentMethod("cash")}>
                <FaMoneyBillWave /> Naqd
              </button>
              <button className={`pay-method ${paymentMethod === "card" ? "active" : ""}`} onClick={() => setPaymentMethod("card")}>
                <FaCreditCard /> Karta
              </button>
              <button className={`pay-method ${paymentMethod === "qr" ? "active" : ""}`} onClick={() => setPaymentMethod("qr")}>
                <FaQrcode /> QR
              </button>
              <button className={`pay-method ${paymentMethod === "mixed" ? "active" : ""}`} onClick={() => setPaymentMethod("mixed")}>
                <FaExchangeAlt /> Aralash
              </button>
            </div>
            <div className="payment-total">
              <span>To'lov summasi</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div className="payment-actions">
              <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                Bekor qilish
              </button>
              <button className="btn-confirm" onClick={handlePaymentConfirm}>
                <FaCheckCircle /> Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debt Modal */}
      {showDebtModal && (
        <div className="payment-overlay" onClick={() => setShowDebtModal(false)}>
          <div className="payment-modal debt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h3>⚠️ Qarzga yozish</h3>
              <button className="modal-close" onClick={() => setShowDebtModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="debt-form-body">
              <div className="debt-form-group">
                <label>Qarzdor ismi *</label>
                <input
                  type="text"
                  value={debtData.debtorName}
                  onChange={(e) => setDebtData({...debtData, debtorName: e.target.value})}
                  placeholder="Ism familiya"
                  required
                />
              </div>
              <div className="debt-form-group">
                <label>Telefon raqami</label>
                <input
                  type="tel"
                  value={debtData.debtorPhone}
                  onChange={(e) => setDebtData({...debtData, debtorPhone: e.target.value})}
                  placeholder="+998 90 123 45 67"
                />
              </div>
              <div className="debt-form-group">
                <label>Manzil</label>
                <input
                  type="text"
                  value={debtData.debtorAddress}
                  onChange={(e) => setDebtData({...debtData, debtorAddress: e.target.value})}
                  placeholder="Manzil"
                />
              </div>
              <div className="debt-form-group">
                <label>Qarz summasi</label>
                <input
                  type="number"
                  value={debtData.amount}
                  onChange={(e) => setDebtData({...debtData, amount: Number(e.target.value)})}
                />
              </div>
              <div className="debt-form-group">
                <label>To'lov sanasi *</label>
                <input
                  type="date"
                  value={debtData.repaymentDate}
                  onChange={(e) => setDebtData({...debtData, repaymentDate: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="payment-actions">
              <button className="btn-cancel" onClick={() => setShowDebtModal(false)}>
                Bekor qilish
              </button>
              <button className="btn-confirm debt-confirm" onClick={handleDebtSubmit}>
                <FaExclamationTriangle /> Qarzga yozish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="receipt-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <h3>🧾 Chek</h3>
              <button className="modal-close" onClick={() => setShowReceiptModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="receipt-content">
              <div className="receipt-header">
                <h2>SODIQJON RESTORANI</h2>
                <p>{table.name}</p>
                <p>{new Date().toLocaleString("uz-UZ")}</p>
              </div>
              <div className="receipt-items">
                {orders.map((item, idx) => (
                  <div key={idx} className="receipt-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="receipt-total">
                <span>JAMI:</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button className="btn-print" onClick={() => window.print()}>
                <FaPrint /> Chop etish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;