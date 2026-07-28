// src/components/OrderForm.jsx
import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { 
  FaMinus, FaPlus, FaTrashAlt, FaUtensils, FaMoneyBillWave, 
  FaCreditCard, FaQrcode, FaExchangeAlt, FaTimes, FaCheckCircle,
  FaShoppingCart, FaEdit, FaReceipt, FaPrint, FaExclamationTriangle,
  FaClock, FaUserTie, FaSpinner, FaInfoCircle,
  FaTrash, FaQuestionCircle
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
    tables, removeFromOrder, updateOrder, completeOrder, 
    sendOrdersToPreparation, generateReceiptPDF, markAsDebt,
    updateTableStatus, kitchenOrders, selectedTableId, setSelectedTableId,
    removeKitchenOrder, confirmPayment
  } = useContext(AppContext);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showClearTableModal, setShowClearTableModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [editingComment, setEditingComment] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [showOrderInfo, setShowOrderInfo] = useState(false);
  const [debtData, setDebtData] = useState({
    debtorName: "", debtorPhone: "", debtorAddress: "", repaymentDate: "", amount: 0
  });
  
  const table = tables.find(t => t.id === tableId);
  
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
  
  const kitchenOrder = kitchenOrders.find(o => o.tableId === tableId);
  
  if (!table) return <div className="of-empty">Stol topilmadi</div>;
  
  const orders = table.orders || [];
  const subtotal = orders.reduce((sum, o) => sum + (o.price || 0) * (o.quantity || 0), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const total = subtotal - discountAmount + taxAmount;
  
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
  
  const handleComplete = () => {
    if (orders.length === 0) {
      toast.warning("Buyurtma yo'q!");
      return;
    }
    setShowPaymentModal(true);
  };
  
  const handlePaymentConfirm = async () => {
    await completeOrder(tableId, true);
    setShowPaymentModal(false);
    toast.success(`✅ To'lov amalga oshirildi! Jami: ${formatPrice(total)}`);
    if (selectedTableId === tableId) {
      setSelectedTableId(null);
    }
  };
  
  const handleSendKitchen = async () => {
    if (orders.length === 0) {
      toast.warning("Buyurtma yo'q!");
      return;
    }
    setIsSending(true);
    try {
      const success = await sendOrdersToPreparation(tableId);
      if (success) {
        toast.success(`✅ ${table.name} stolidagi buyurtmalar oshxonaga yuborildi!`);
      }
    } catch (error) {
      toast.error("Xatolik yuz berdi: " + error.message);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleViewReceipt = () => {
    if (orders.length === 0) {
      toast.warning("Buyurtma yo'q!");
      return;
    }
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
  
  const openDebtModal = () => {
    if (orders.length === 0) {
      toast.warning("Buyurtma yo'q!");
      return;
    }
    setDebtData({ debtorName: "", debtorPhone: "", debtorAddress: "", repaymentDate: "", amount: total });
    setShowDebtModal(true);
  };
  
  const handleDebtSubmit = async () => {
    if (!debtData.debtorName || !debtData.repaymentDate) {
      toast.error("Iltimos, qarzdor ismi va to'lov sanasini kiriting!");
      return;
    }
    await markAsDebt(tableId, {
      amount: debtData.amount,
      debtorName: debtData.debtorName,
      debtorPhone: debtData.debtorPhone || "",
      debtorAddress: debtData.debtorAddress || "",
      repaymentDate: debtData.repaymentDate
    });
    setShowDebtModal(false);
    if (selectedTableId === tableId) setSelectedTableId(null);
  };
  
  const handleClearTable = () => {
    if (orders.length > 0) {
      setShowClearTableModal(true);
    } else {
      if (window.confirm(`"${table.name}" stolini bo'shatishni tasdiqlaysizmi?`)) {
        clearTable();
      }
    }
  };
  
  const clearTable = () => {
    const tableOrders = [...table.orders];
    tableOrders.forEach((_, index) => { removeFromOrder(tableId, 0); });
    updateTableStatus(tableId, "Bo'sh");
    if (table.kitchenOrderId && removeKitchenOrder) {
      removeKitchenOrder(table.kitchenOrderId);
    }
    if (selectedTableId === tableId) setSelectedTableId(null);
    setShowClearTableModal(false);
    toast.success(`✅ ${table.name} stoli muvaffaqiyatli bo'shatildi!`);
  };
  
  const ClearTableModal = () => {
    const orderCount = orders.length;
    const totalAmount = subtotal;
    return (
      <div className="of-clear-overlay" onClick={() => setShowClearTableModal(false)}>
        <div className="of-clear-modal" onClick={(e) => e.stopPropagation()}>
          <div className="of-clear-modal-header">
            <FaQuestionCircle className="of-clear-icon" />
            <h3>Stolni bo'shatish</h3>
            <button className="of-modal-close" onClick={() => setShowClearTableModal(false)}><FaTimes /></button>
          </div>
          <div className="of-clear-modal-body">
            <div className="of-clear-warning">
              <FaExclamationTriangle className="of-warning-icon" />
              <p className="of-warning-text"><strong>DIQQAT!</strong> Siz {table.name} stolini bo'shatmoqchisiz!</p>
            </div>
            <div className="of-clear-info">
              <div className="of-clear-info-row"><span>📋 Stol nomi:</span><span><strong>{table.name}</strong></span></div>
              <div className="of-clear-info-row"><span>📦 Buyurtmalar soni:</span><span><strong>{orderCount} ta</strong></span></div>
              {orderCount > 0 && (
                <>
                  <div className="of-clear-info-row"><span>💵 Umumiy summa:</span><span><strong>{formatPrice(totalAmount)}</strong></span></div>
                  <div className="of-clear-info-row"><span>👨‍🍳 Ofitsiant:</span><span><strong>{table.waiter || "Belgilanmagan"}</strong></span></div>
                </>
              )}
              {table.kitchenOrderId && (
                <div className="of-clear-info-row"><span>🍳 Oshxona holati:</span><span><strong className="of-kitchen-warning">Tayyorlanmoqda</strong></span></div>
              )}
            </div>
            {orderCount > 0 && (
              <div className="of-clear-warning-box">
                <FaExclamationTriangle />
                <p><strong>{orderCount} ta buyurtma</strong> mavjud! Ularning barchasi o'chiriladi. {table.kitchenOrderId && " Oshxonadagi buyurtma ham bekor qilinadi."}</p>
              </div>
            )}
            <div className="of-clear-actions">
              <button className="of-btn-cancel-clear" onClick={() => setShowClearTableModal(false)}><FaTimes /> Bekor qilish</button>
              <button className="of-btn-confirm-clear" onClick={clearTable}><FaTrash /> Stolni bo'shatish</button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const getTableStatusInfo = () => {
    const map = {
      "Bo'sh": { icon: "🟢", text: "Bo'sh", color: "#22c55e" },
      "Band": { icon: "🔴", text: "Band", color: "#ef4444" },
      "Zakaz qo'shildi": { icon: "🔴", text: "Band", color: "#ef4444" },
      "Tayyorlashga yuborildi": { icon: "🟡", text: "Tayyorlanmoqda", color: "#f59e0b" },
      "To'lov kutilmoqda": { icon: "🟠", text: "To'lov kutilmoqda", color: "#f97316" },
      "Qarz": { icon: "🔴", text: "Qarz", color: "#dc2626" },
    };
    return map[table.status] || { icon: "⚪", text: table.status || "Noma'lum", color: "#6b7280" };
  };
  
  const statusInfo = getTableStatusInfo();
  const kitchenStatus = kitchenOrder ? {
    'pending': { text: 'Kutilmoqda', color: '#f59e0b' },
    'preparing': { text: 'Tayyorlanmoqda', color: '#3b82f6' },
    'ready': { text: 'Tayyor!', color: '#22c55e' },
    'completed': { text: 'Yakunlangan', color: '#6b7280' }
  }[kitchenOrder.status] : null;
  
  if (orders.length === 0) {
    return (
      <div className="of-empty-state">
        <FaShoppingCart className="of-empty-cart-icon" />
        <h3>Buyurtma bo'sh</h3>
        <p>Menyudan taom qo'shing</p>
        {(table.status === "Band" || table.status === "Zakaz qo'shildi" || table.status === "Tayyorlashga yuborildi" || table.status === "To'lov kutilmoqda") && (
          <div className="of-empty-actions">
            <button className="of-free-table-btn" onClick={handleClearTable}><FaTrash /> Stolni bo'shatish</button>
            {table.status === "To'lov kutilmoqda" && confirmPayment && (
              <button className="of-confirm-payment-btn" onClick={() => confirmPayment(tableId)}><FaCheckCircle /> To'lovni tasdiqlash</button>
            )}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="of-wrapper">
      {/* TABLE INFO */}
      <div className="of-table-info">
        <div className="of-table-info-left">
          <div className="of-table-status-indicator" style={{ background: statusInfo.color }}>
            <span>{statusInfo.icon}</span>
          </div>
          <div>
            <h3 className="of-table-name">{table.name}</h3>
            <span className="of-table-status" style={{ color: statusInfo.color }}>{statusInfo.text}</span>
            {table.waiter && <span className="of-table-waiter"><FaUserTie /> {table.waiter}</span>}
          </div>
        </div>
        <div className="of-table-info-right">
          {elapsedTime > 0 && <div className="of-table-time"><FaClock /> {elapsedTime} daqiqa</div>}
          {kitchenStatus && <div className="of-kitchen-status" style={{ color: kitchenStatus.color }}><FaUtensils /> {kitchenStatus.text}</div>}
          <button className="of-clear-table-btn-small" onClick={handleClearTable} title="Stolni bo'shatish">🗑️ </button>
          <button className={`of-info-btn-small ${showOrderInfo ? 'active' : ''}`} onClick={() => setShowOrderInfo(!showOrderInfo)} title="Buyurtma ma'lumotlari">ℹ️</button>
        </div>
      </div>
      
      {/* ORDER INFO PANEL */}
      {showOrderInfo && kitchenOrder && (
        <div className="of-info-panel">
          <div className="of-info-row"><span>Buyurtma ID:</span><span>{kitchenOrder.kitchenId || kitchenOrder.id}</span></div>
          <div className="of-info-row"><span>Yuborilgan vaqt:</span><span>{new Date(kitchenOrder.startTime).toLocaleString('uz-UZ')}</span></div>
          {kitchenOrder.estimatedReadyTime && <div className="of-info-row"><span>Taxminiy tayyor:</span><span>{new Date(kitchenOrder.estimatedReadyTime).toLocaleString('uz-UZ')}</span></div>}
          {kitchenOrder.preparationTime && <div className="of-info-row"><span>Tayyorlanish vaqti:</span><span>{kitchenOrder.preparationTime} daqiqa</span></div>}
          <div className="of-info-row"><span>Buyurtmalar soni:</span><span>{orders.length} ta</span></div>
          <div className="of-info-row"><span>Jami summa:</span><span>{formatPrice(subtotal)}</span></div>
        </div>
      )}
      
      {/* ORDER HEADER */}
      <div className="of-header">
        <div className="of-header-left">
          <FaUtensils className="of-header-icon" />
          <h3>Buyurtmalar</h3>
          <span className="of-badge">{orders.length} ta</span>
        </div>
        <div className="of-header-actions">
          <button className="of-btn-receipt" onClick={handleViewReceipt}><FaReceipt /> Chek</button>
          <button className={`of-btn-kitchen ${isSending ? 'sending' : ''}`} onClick={handleSendKitchen} disabled={isSending || orders.length === 0 || table.status === "Tayyorlashga yuborildi"}>
            {isSending ? <FaSpinner className="of-spinner" /> : <FaUtensils />}
            {isSending ? 'Yuborilmoqda...' : 'Oshxonaga'}
          </button>
          <button className="of-btn-clear-table" onClick={handleClearTable} title="Stolni bo'shatish"><FaTrash /> Bo'shatish</button>
        </div>
      </div>
      
      {/* ORDER ITEMS */}
      <div className="of-items">
        {orders.map((item, index) => (
          <div key={index} className="of-item">
            <div className="of-item-info">
              <span className="of-item-name">{item.name}</span>
              {item.comment && <span className="of-item-comment">📝 {item.comment}</span>}
              {editingComment === index ? (
                <div className="of-comment-edit">
                  <input type="text" defaultValue={item.comment || ""} placeholder="Izoh yozing..." autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCommentChange(index, e.target.value); if (e.key === 'Escape') setEditingComment(null); }}
                    onBlur={(e) => handleCommentChange(index, e.target.value)} />
                </div>
              ) : (
                <button className="of-comment-edit-btn" onClick={() => setEditingComment(index)} title="Izoh qo'shish/yangilash">
                  <FaEdit /> {item.comment ? "Tahrirlash" : "Izoh qo'shish"}
                </button>
              )}
            </div>
            <div className="of-item-controls">
              <button 
                className="of-qty-btn of-qty-minus" 
                onClick={() => handleQuantityChange(index, item.quantity - 1)} 
                disabled={table.status === "Tayyorlashga yuborildi"}
              >
             -
              </button>
              <span className="of-qty-value">{item.quantity}</span>
              <button 
                className="of-qty-btn of-qty-plus" 
                onClick={() => handleQuantityChange(index, item.quantity + 1)} 
                disabled={table.status === "Tayyorlashga yuborildi"}
              >
               +
              </button>
              <span className="of-item-price">{formatPrice(item.price * item.quantity)}</span>
              <button 
                className="of-item-remove-btn" 
                onClick={() => removeFromOrder(tableId, index)} 
                disabled={table.status === "Tayyorlashga yuborildi"}
              >
              🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* ORDER SUMMARY */}
      <div className="of-summary">
        <div className="of-summary-row"><span>Oraliq summa</span><span>{formatPrice(subtotal)}</span></div>
        <div className="of-summary-row of-summary-discount"><span>Chegirma ({discount}%)</span><span>- {formatPrice(discountAmount)}</span></div>
        <div className="of-summary-row of-summary-tax"><span>Soliq ({tax}%)</span><span>+ {formatPrice(taxAmount)}</span></div>
        <div className="of-summary-row of-summary-total"><span>JAMI</span><span>{formatPrice(total)}</span></div>
      </div>
      
      {/* ORDER ACTIONS */}
      <div className="of-actions">
        <button className="of-btn-debt" onClick={openDebtModal} disabled={orders.length === 0 || table.status === "Tayyorlashga yuborildi"}><FaExclamationTriangle /> Qarzga yozish</button>
        <button className="of-btn-payment" onClick={handleComplete} disabled={orders.length === 0 || table.status === "Tayyorlashga yuborildi"}><FaMoneyBillWave /> To'lov</button>
      </div>
      
      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="of-payment-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="of-payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="of-payment-modal-header"><h3>💳 To'lov usuli</h3><button className="of-modal-close" onClick={() => setShowPaymentModal(false)}><FaTimes /></button></div>
            <div className="of-payment-methods">
              <button className={`of-pay-method ${paymentMethod === "cash" ? "active" : ""}`} onClick={() => setPaymentMethod("cash")}><FaMoneyBillWave /> Naqd</button>
              <button className={`of-pay-method ${paymentMethod === "card" ? "active" : ""}`} onClick={() => setPaymentMethod("card")}><FaCreditCard /> Karta</button>
              <button className={`of-pay-method ${paymentMethod === "qr" ? "active" : ""}`} onClick={() => setPaymentMethod("qr")}><FaQrcode /> QR</button>
              <button className={`of-pay-method ${paymentMethod === "mixed" ? "active" : ""}`} onClick={() => setPaymentMethod("mixed")}><FaExchangeAlt /> Aralash</button>
            </div>
            <div className="of-payment-total"><span>To'lov summasi</span><strong>{formatPrice(total)}</strong></div>
            <div className="of-payment-actions">
              <button className="of-btn-cancel" onClick={() => setShowPaymentModal(false)}>Bekor qilish</button>
              <button className="of-btn-confirm" onClick={handlePaymentConfirm}><FaCheckCircle /> Tasdiqlash</button>
            </div>
          </div>
        </div>
      )}
      
      {/* DEBT MODAL */}
      {showDebtModal && (
        <div className="of-payment-overlay" onClick={() => setShowDebtModal(false)}>
          <div className="of-payment-modal of-debt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="of-payment-modal-header"><h3>⚠️ Qarzga yozish</h3><button className="of-modal-close" onClick={() => setShowDebtModal(false)}><FaTimes /></button></div>
            <div className="of-debt-form-body">
              <div className="of-debt-form-group"><label>Qarzdor ismi *</label><input type="text" value={debtData.debtorName} onChange={(e) => setDebtData({...debtData, debtorName: e.target.value})} placeholder="Ism familiya" required /></div>
              <div className="of-debt-form-group"><label>Telefon raqami</label><input type="tel" value={debtData.debtorPhone} onChange={(e) => setDebtData({...debtData, debtorPhone: e.target.value})} placeholder="+998 90 123 45 67" /></div>
              <div className="of-debt-form-group"><label>Manzil</label><input type="text" value={debtData.debtorAddress} onChange={(e) => setDebtData({...debtData, debtorAddress: e.target.value})} placeholder="Manzil" /></div>
              <div className="of-debt-form-group"><label>Qarz summasi</label><input type="number" value={debtData.amount} onChange={(e) => setDebtData({...debtData, amount: Number(e.target.value)})} /></div>
              <div className="of-debt-form-group"><label>To'lov sanasi *</label><input type="date" value={debtData.repaymentDate} onChange={(e) => setDebtData({...debtData, repaymentDate: e.target.value})} required /></div>
            </div>
            <div className="of-payment-actions">
              <button className="of-btn-cancel" onClick={() => setShowDebtModal(false)}>Bekor qilish</button>
              <button className="of-btn-confirm of-debt-confirm" onClick={handleDebtSubmit}><FaExclamationTriangle /> Qarzga yozish</button>
            </div>
          </div>
        </div>
      )}
      
      {/* RECEIPT MODAL */}
      {showReceiptModal && (
        <div className="of-receipt-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="of-receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="of-receipt-modal-header"><h3>🧾 Chek</h3><button className="of-modal-close" onClick={() => setShowReceiptModal(false)}><FaTimes /></button></div>
            <div className="of-receipt-content">
              <div className="of-receipt-header"><h2>SODIQJON RESTORANI</h2><p>{table.name}</p><p>{new Date().toLocaleString("uz-UZ")}</p></div>
              <div className="of-receipt-items">{orders.map((item, idx) => (<div key={idx} className="of-receipt-item"><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></div>))}</div>
              <div className="of-receipt-total"><span>JAMI:</span><span>{formatPrice(total)}</span></div>
              <button className="of-btn-print" onClick={() => window.print()}><FaPrint /> Chop etish</button>
            </div>
          </div>
        </div>
      )}
      
      {showClearTableModal && <ClearTableModal />}
    </div>
  );
};

export default OrderForm;