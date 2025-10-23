import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import {
  FaTrash,
  FaPaperPlane,
  FaCreditCard,
  FaTimes,
  FaPrint,
  FaPlus,
  FaMinus,
  FaComment,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./OrderForm.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const checkPrinterConnection = () => {
  return Math.random() > 0.5;
};

const printReceipt = (order) => {
  try {
    console.log("Printing receipt:", order);
    return true;
  } catch (error) {
    console.error("Printer error:", error);
    return false;
  }
};

const OrderForm = ({ tableId, openPayment }) => {
  const {
    tables,
    updateOrder,
    removeFromOrder,
    sendOrdersToPreparation,
    completeOrder,
    generateReceiptPDF,
    sendTelegramMessage,
  } = useContext(AppContext);

  const selectedTable =
    tables.find((table) => table.id === tableId) || {
      orders: [],
      name: "-",
      waiter: "",
    };

  const [quantities, setQuantities] = useState({});
  const [comments, setComments] = useState({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [failureReason, setFailureReason] = useState("");
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    setQuantities(
      selectedTable.orders.reduce((acc, order, index) => {
        acc[index] = order.quantity;
        return acc;
      }, {})
    );
    setComments(
      selectedTable.orders.reduce((acc, order, index) => {
        acc[index] = order.comment || "";
        return acc;
      }, {})
    );
  }, [selectedTable]);

  const total = selectedTable.orders.reduce(
    (sum, order) => sum + order.price * order.quantity,
    0
  );

  useEffect(() => {
    setAnimateItems(true);
    const timer = setTimeout(() => setAnimateItems(false), 300);
    return () => clearTimeout(timer);
  }, [selectedTable.orders]);

  const handleQuantityChange = (index, value) => {
    const newQuantity = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({ ...prev, [index]: newQuantity }));
    updateOrder(tableId, index, newQuantity, comments[index]);
  };

  const handleQuantityAdjust = (index, increment) => {
    const currentQuantity =
      quantities[index] || selectedTable.orders[index].quantity;
    const newQuantity = Math.max(1, currentQuantity + (increment ? 1 : -1));
    setQuantities((prev) => ({ ...prev, [index]: newQuantity }));
    updateOrder(tableId, index, newQuantity, comments[index]);
  };

  const handleCommentChange = (index, value) => {
    setComments((prev) => ({ ...prev, [index]: value }));
  };

  const handleCommentBlur = (index) => {
    const comment = comments[index]?.trim() || "";
    const formatted = comment.endsWith(".") || comment === "" ? comment : comment + ".";
    setComments((prev) => ({ ...prev, [index]: formatted }));
    updateOrder(
      tableId,
      index,
      quantities[index] || selectedTable.orders[index].quantity,
      formatted
    );
  };

  const handleSendToPreparation = async () => {
    const success = await sendOrdersToPreparation(tableId);
    if (success) {
      toast.success("✅ Buyurtma tayyorlashga yuborildi!", { autoClose: 2000 });
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Barcha buyurtmalarni bekor qilmoqchimisiz?")) {
      try {
        const cancelPromises = selectedTable.orders.map((_, index) =>
          removeFromOrder(tableId, 0)
        );
        await Promise.all(cancelPromises);
        toast.success("🚫 Buyurtma bekor qilindi!", { autoClose: 2000 });
      } catch (error) {
        toast.error("Xato: " + error.message, { autoClose: 2000 });
      }
    }
  };

  const handleGenerateReceipt = async () => {
    const order = {
      id: Date.now(),
      items: selectedTable.orders,
      total,
      date: new Date(),
      tableId,
      tableName: selectedTable.name,
      waiter: selectedTable.waiter,
      status: "To'lov kutilmoqda",
    };

    const isPrinterConnected = checkPrinterConnection();

    if (isPrinterConnected) {
      try {
        const printSuccess = printReceipt(order);
        if (printSuccess) {
          toast.success("🖨️ Chek apparat orqali chop etildi!", {
            autoClose: 2000,
          });
          return;
        }
      } catch (error) {
        console.warn("Printer xatosi, PDF rejimga o'tilmoqda");
      }
    }

    try {
      await generateReceiptPDF(order);
      toast.success("📄 Chek PDF sifatida yaratildi!", { autoClose: 2000 });
    } catch (error) {
      toast.error("Chek yaratishda xato: " + error.message, {
        autoClose: 2000,
      });
    }
  };

  const handleCompleteOrder = () => {
    setShowCompletionModal(true);
  };

  const handleCompletionSubmit = async () => {
    if (completionStatus === null) {
      toast.error("Iltimos, holatni tanlang!", { autoClose: 2000 });
      return;
    }

    if (completionStatus === false && !failureReason.trim()) {
      toast.error("Sababni kiriting!", { autoClose: 2000 });
      return;
    }

    try {
      const success = await completeOrder(tableId, completionStatus);
      if (success) {
        if (completionStatus) {
          toast.success("✅ Buyurtma yakunlandi!", { autoClose: 2000 });
        } else {
          const formattedReason = failureReason.trim().endsWith(".")
            ? failureReason.trim()
            : failureReason.trim() + ".";
          const reasonMessage = `
<b>⚠️ Buyurtma muvaffaqiyatsiz yakunlandi - ${selectedTable.name}</b>
📝 Sabab: <i>${formattedReason}</i>
🕒 ${new Date().toLocaleString("uz-UZ")}
👨‍🍳 Ofitsiant: ${selectedTable.waiter || "Belgilanmagan"}
          `;
          await sendTelegramMessage(reasonMessage, "-4646692596");
          toast.info("⚠️ Buyurtma bekor qilindi!", { autoClose: 2000 });
        }
        setShowCompletionModal(false);
        setCompletionStatus(null);
        setFailureReason("");
      }
    } catch (error) {
      toast.error("Xato: " + error.message, { autoClose: 2000 });
    }
  };

  const handleQuickClose = () => {
    setShowCompletionModal(false);
    setCompletionStatus(null);
    setFailureReason("");
  };

  return (
    <div className="order-form">
      <div className="order-form-header">
        <h3>{selectedTable.name} Buyurtmalari</h3>
        <span className="order-count">{selectedTable.orders.length} ta element</span>
      </div>

      {selectedTable.orders.length === 0 ? (
        <div className="empty-state">
          <FaTimes className="empty-icon" />
          <p>Buyurtmalar yo'q</p>
          <small>Menyudan taom qo'shing</small>
        </div>
      ) : (
        <>
          <div className="order-list">
            {selectedTable.orders.map((order, index) => (
              <div key={index} className={`order-item ${animateItems ? "animate-fade-in" : ""}`}>
                <div className="order-details">
                  {order.image && <img src={order.image} alt={order.name} className="order-image" />}
                  <div className="order-info">
                    <div className="order-name-row">
                      <span className="order-name">{order.name}</span>
                      <span className="order-price">{formatPrice(order.price)}</span>
                    </div>
                    <div className="order-meta">
                      <span className="order-category">{order.category}</span>
                      <span className="order-total-price">
                        {formatPrice(order.price * (quantities[index] || order.quantity))}
                      </span>
                    </div>
                    <div className="comment-section">
                      <FaComment className="comment-icon" />
                      <input
                        type="text"
                        placeholder="Izoh (masalan: tuzsiz)"
                        value={comments[index] || ""}
                        onChange={(e) => handleCommentChange(index, e.target.value)}
                        onBlur={() => handleCommentBlur(index)}
                        className="comment-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="order-controls">
                  <div className="quantity-control">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityAdjust(index, false)}
                    >
                      <FaMinus />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantities[index] || order.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="quantity-input"
                    />
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityAdjust(index, true)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => removeFromOrder(tableId, index)}
                    title="Buyurtmani o'chirish"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="order-total">
            <span>Jami:</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div className="order-actions">
            <button
              className="btn btn-primary"
              onClick={handleSendToPreparation}
              disabled={selectedTable.status === "Tayyorlashga yuborildi"}
            >
              <FaPaperPlane /> Tayyorlashga yuborish
            </button>

            <button className="btn btn-danger" onClick={handleCancelOrder}>
              <FaTimes /> Bekor qilish
            </button>

            <button className="btn btn-primary" onClick={handleGenerateReceipt}>
              <FaPrint /> Chek chiqarish
            </button>

            <button className="btn btn-primary" onClick={openPayment}>
              <FaCreditCard /> To'lov qabul qilish
            </button>

            <button className="btn btn-success" onClick={handleCompleteOrder}>
              <FaTimes /> Yakunlash
            </button>
          </div>
        </>
      )}

      {showCompletionModal && (
        <div className="completion-modal">
          <div className="completion-modal-content">
            <button className="modal-close" onClick={handleQuickClose}>
              <FaTimes />
            </button>
            <h2>Buyurtma Yakunlash</h2>
            <p>{selectedTable.name} uchun yakun holatini tanlang:</p>
            <div className="completion-options">
              <button
                className={`btn ${completionStatus === true ? "btn-success active" : "btn-secondary"}`}
                onClick={() => setCompletionStatus(true)}
              >
                ✅ Muvaffaqiyatli
              </button>
              <button
                className={`btn ${completionStatus === false ? "btn-danger active" : "btn-secondary"}`}
                onClick={() => setCompletionStatus(false)}
              >
                ❌ Muvaffaqiyatsiz
              </button>
            </div>

            {completionStatus === false && (
              <div className="failure-reason">
                <label htmlFor="failureReason">Sabab:</label>
                <textarea
                  id="failureReason"
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  placeholder="Masalan: mijoz rad etdi"
                  className="form-input"
                  rows="4"
                />
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleCompletionSubmit}>
                Tasdiqlash
              </button>
              <button className="btn btn-secondary" onClick={handleQuickClose}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;