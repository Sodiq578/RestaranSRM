import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { FaPaperPlane, FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import "./OrderForm.css";

const OrderForm = ({ tableId, openPayment, onSendToKitchen }) => {
  const { tables, updateOrder, removeFromOrder, sendOrdersToPreparation } = useContext(AppContext);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editComment, setEditComment] = useState("");

  const table = tables.find((t) => t.id === tableId);

  if (!table) {
    return (
      <div className="order-form">
        <div className="empty-state">
          <p>Stol topilmadi</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const total = table.orders.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditQuantity(1);
    setEditComment("");
  };

  const handleRemove = (index) => {
    removeFromOrder(tableId, index);
  };

  // YANGI: Tayyorlashga yuborish funksiyasi
  const handleSendToKitchen = async () => {
    if (!table.orders || table.orders.length === 0) {
      toast.error("Buyurtma bo'sh!");
      return;
    }

    try {
      const success = await sendOrdersToPreparation(tableId);
      if (success && onSendToKitchen) {
        onSendToKitchen();
      }
    } catch (error) {
      toast.error("Xatolik yuz berdi: " + error.message);
    }
  };

  return (
    <div className="order-form">
      <div className="order-items">
        {table.orders.length === 0 ? (
          <div className="empty-order">
            <p>Hozircha buyurtma yo'q</p>
            <small>Menyudan taom qo'shing</small>
          </div>
        ) : (
          table.orders.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-price">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>

              {editingIndex === index ? (
                <div className="edit-controls">
                  <div className="quantity-controls">
                    <button
                      onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity-display">{editQuantity}</span>
                    <button
                      onClick={() => setEditQuantity(editQuantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Izoh qo'shish..."
                    className="comment-input"
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => handleSave(index)}
                      className="save-btn"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="cancel-btn"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="item-controls">
                  <div className="quantity-display">
                    {item.quantity} x {formatPrice(item.price)}
                  </div>
                  {item.comment && (
                    <div className="item-comment">{item.comment}</div>
                  )}
                  <div className="item-actions">
                    <button
                      onClick={() => handleEdit(index)}
                      className="edit-btn"
                      title="Tahrirlash"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      className="remove-btn"
                      title="O'chirish"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {table.orders.length > 0 && (
        <div className="order-footer">
          <div className="order-total">
            <span>Jami:</span>
            <span>{formatPrice(total)}</span>
          </div>
          
          <div className="order-actions">
            {/* YANGI: Tayyorlashga yuborish tugmasi */}
            <button
              onClick={handleSendToKitchen}
              className="btn btn-primary send-kitchen-btn"
            >
              <FaPaperPlane /> Tayyorlashga Yuborish
            </button>
            
            <button
              onClick={openPayment}
              className="btn btn-success"
            >
              To'lov
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;