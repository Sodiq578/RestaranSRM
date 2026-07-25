import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { 
  FaPaperPlane, 
  FaTrash, 
  FaEdit, 
  FaCheck, 
  FaTimes,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaMoneyBillWave,
  FaComment,
  FaFire,
  FaSpinner
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

const OrderForm = ({ tableId, openPayment, onSendToKitchen }) => {
  const { tables, updateOrder, removeFromOrder, sendOrdersToPreparation } = useContext(AppContext);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editComment, setEditComment] = useState("");
  const [isSending, setIsSending] = useState(false);

  const table = tables.find((t) => t.id === tableId);

  if (!table) {
    return (
      <div className="orderform-empty">
        <div className="empty-cart-icon-wrapper">
          <FaShoppingCart />
        </div>
        <h3>Stol topilmadi</h3>
        <p>Iltimos, stolni tanlang</p>
      </div>
    );
  }

  const total = table.orders.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = table.orders.reduce((sum, item) => sum + item.quantity, 0);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditQuantity(table.orders[index].quantity);
    setEditComment(table.orders[index].comment || "");
  };

  const handleSave = (index) => {
    if (editQuantity < 1) {
      toast.error("Miqdor 1 dan kam bo'lmasligi kerak!");
      return;
    }
    updateOrder(tableId, index, editQuantity, editComment);
    setEditingIndex(null);
    setEditQuantity(1);
    setEditComment("");
    toast.success("✅ Buyurtma yangilandi!");
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditQuantity(1);
    setEditComment("");
  };

  const handleRemove = (index) => {
    removeFromOrder(tableId, index);
    toast.success("🗑️ Buyurtma o'chirildi!");
  };

  // Tayyorlashga yuborish va oshxonaga o'tkazish
  const handleSendToKitchen = async () => {
    if (!table.orders || table.orders.length === 0) {
      toast.error("❌ Buyurtma bo'sh!");
      return;
    }

    setIsSending(true);

    try {
      // Oshxona uchun buyurtma ma'lumotlarini tayyorlash
      const kitchenOrder = {
        kitchenId: `KIT-${Date.now().toString().slice(-6)}-${tableId}`,
        tableId: tableId,
        tableName: table.name,
        waiter: table.waiter || "Belgilanmagan",
        items: table.orders.map(order => ({
          name: order.name,
          quantity: order.quantity,
          price: order.price,
          notes: order.comment || "",
        })),
        totalAmount: total,
        date: new Date().toISOString(),
        startTime: null,
        status: "pending", // pending -> preparing -> ready -> completed
        preparationTime: 0,
      };

      // LocalStorage ga saqlash - Oshxona dashboard uchun
      const existingOrders = JSON.parse(localStorage.getItem('kitchenPreparingOrders') || '[]');
      
      // Buyurtma allaqachon mavjudligini tekshirish
      const orderExists = existingOrders.some(order => order.tableId === tableId);
      
      if (!orderExists) {
        existingOrders.push(kitchenOrder);
        localStorage.setItem('kitchenPreparingOrders', JSON.stringify(existingOrders));
        
        // Context orqali yuborish
        const success = await sendOrdersToPreparation(tableId);
        
        if (success || success === undefined) {
          toast.success("✅ Buyurtma oshxonaga yuborildi!");
          
          // Callback chaqirish
          if (onSendToKitchen) {
            onSendToKitchen();
          }
        }
      } else {
        // Yangilash
        const updatedOrders = existingOrders.map(order => {
          if (order.tableId === tableId) {
            return {
              ...order,
              items: table.orders.map(o => ({
                name: o.name,
                quantity: o.quantity,
                price: o.price,
                notes: o.comment || "",
              })),
              totalAmount: total,
              date: new Date().toISOString(),
            };
          }
          return order;
        });
        localStorage.setItem('kitchenPreparingOrders', JSON.stringify(updatedOrders));
        toast.success("✅ Buyurtma yangilandi va oshxonaga yuborildi!");
      }
      
    } catch (error) {
      toast.error("❌ Xatolik: " + (error.message || "Noma'lum xatolik"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="orderform">
      {/* Buyurtmalar soni ko'rsatkichi */}
      {table.orders.length > 0 && (
        <div className="orderform-info-bar">
          <div className="info-item">
            <FaShoppingCart />
            <span>{table.orders.length} ta buyurtma</span>
          </div>
          <div className="info-item">
            <span>Jami: {totalItems} ta mahsulot</span>
          </div>
        </div>
      )}

      {/* Buyurtmalar ro'yxati */}
      <div className="orderform-items">
        {table.orders.length === 0 ? (
          <div className="orderform-empty-inner">
            <div className="empty-cart-icon-wrapper">
              <FaShoppingCart />
            </div>
            <h4>Buyurtma bo'sh</h4>
            <p>Menyudan taom tanlang va qo'shing</p>
          </div>
        ) : (
          <div className="order-list">
            {table.orders.map((item, index) => (
              <div 
                key={index} 
                className={`order-item-card ${editingIndex === index ? "editing" : ""}`}
              >
                {editingIndex === index ? (
                  /* ===== TAHRIRLASH REJIMI ===== */
                  <div className="edit-mode">
                    <div className="edit-header">
                      <span className="edit-item-name">{item.name}</span>
                      <span className="edit-item-price">{formatPrice(item.price)}</span>
                    </div>
                    
                    <div className="edit-controls">
                      <div className="quantity-control">
                        <button
                          onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                          className="qty-btn"
                          disabled={editQuantity <= 1}
                        >
                          <FaMinus />
                        </button>
                        <span className="qty-value">{editQuantity}</span>
                        <button
                          onClick={() => setEditQuantity(editQuantity + 1)}
                          className="qty-btn"
                        >
                          <FaPlus />
                        </button>
                        <span className="qty-total-edit">
                          = {formatPrice(item.price * editQuantity)}
                        </span>
                      </div>
                      
                      <div className="comment-control">
                        <FaComment className="comment-icon" />
                        <input
                          type="text"
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Izoh qo'shish (ixtiyoriy)..."
                          className="comment-input"
                        />
                      </div>
                      
                      <div className="edit-actions">
                        <button onClick={() => handleSave(index)} className="save-btn">
                          <FaCheck /> Saqlash
                        </button>
                        <button onClick={handleCancel} className="cancel-btn">
                          <FaTimes /> Bekor qilish
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ===== KO'RISH REJIMI ===== */
                  <div className="view-mode">
                    <div className="item-main">
                      <div className="item-info">
                        <span className="item-num">{index + 1}.</span>
                        <span className="item-name">{item.name}</span>
                        {item.comment && (
                          <span className="item-comment-badge" title={item.comment}>
                            <FaComment /> {item.comment.length > 20 ? item.comment.slice(0, 20) + "..." : item.comment}
                          </span>
                        )}
                      </div>
                      <div className="item-right">
                        <span className="item-qty">×{item.quantity}</span>
                        <span className="item-total">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <button onClick={() => handleEdit(index)} className="edit-btn" title="Tahrirlash">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleRemove(index)} className="delete-btn" title="O'chirish">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Jami va tugmalar */}
      {table.orders.length > 0 && (
        <div className="orderform-footer">
          <div className="total-row">
            <div className="total-info">
              <span className="total-label">Jami summa:</span>
              <span className="total-items-count">{table.orders.length} ta buyurtma</span>
            </div>
            <span className="total-amount">{formatPrice(total)}</span>
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={handleSendToKitchen} 
              className="btn-kitchen"
              disabled={isSending}
            >
              {isSending ? (
                <><FaSpinner className="spin-icon" /> Yuborilmoqda...</>
              ) : (
                <><FaFire /> Tayyorlashga yuborish</>
              )}
            </button>
            <button 
              onClick={openPayment} 
              className="btn-payment"
              disabled={isSending}
            >
              <FaMoneyBillWave /> To'lov qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;