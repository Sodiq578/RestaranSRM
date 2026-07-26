// src/components/MenuItem.jsx
import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { FaPlus, FaMinus, FaPencilAlt, FaTimes, FaCommentAlt } from "react-icons/fa";
import "./MenuItem.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const MenuItem = ({ item }) => {
  const { tables, selectedTableId, addToOrder, removeFromOrder, updateOrder } = useContext(AppContext);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  const table = tables.find(t => t.id === selectedTableId);
  const existingOrder = table?.orders?.find(o => o.id === item.id);
  const quantity = existingOrder?.quantity || 0;
  const existingComment = existingOrder?.comment || "";

  const handleAdd = () => {
    if (!selectedTableId) {
      alert("Iltimos, avval stol tanlang!");
      return;
    }
    addToOrder({ ...item, quantity: 1 });
  };

  const handleRemove = () => {
    if (!selectedTableId || quantity === 0) return;
    const index = table?.orders?.findIndex(o => o.id === item.id);
    if (index === undefined || index < 0) return;
    if (quantity === 1) {
      removeFromOrder(selectedTableId, index);
    } else {
      updateOrder(selectedTableId, index, quantity - 1, existingComment);
    }
  };

  const openCommentModal = () => {
    if (!selectedTableId) {
      alert("Iltimos, avval stol tanlang!");
      return;
    }
    setCommentText(existingComment);
    setShowCommentModal(true);
  };

  const saveComment = () => {
    if (!selectedTableId) return;
    const index = table?.orders?.findIndex(o => o.id === item.id);
    if (index !== undefined && index >= 0) {
      updateOrder(selectedTableId, index, quantity, commentText);
    } else {
      addToOrder({ ...item, quantity: 1, comment: commentText });
    }
    setShowCommentModal(false);
    setCommentText("");
  };

  return (
    <>
      <div className="menu-item-card">
        {/* Rasm */}
        <div className="menu-item-image-wrapper">
          <img 
            src={item.image || "/placeholder.png"} 
            alt={item.name} 
            className="menu-item-img" 
          />
          {item.isBestSeller && (
            <span className="best-seller-badge">⭐ Mashhur</span>
          )}
        </div>

        {/* Ma'lumot */}
        <div className="menu-item-info">
          <h4 className="menu-item-name">{item.name}</h4>
          <span className="menu-item-category">{item.category}</span>
          <div className="menu-item-bottom">
            <span className="menu-item-price">{formatPrice(item.price)}</span>
            <button 
              className="menu-item-comment-btn" 
              onClick={openCommentModal}
              title="Izoh qo'shish"
            >
              <FaPencilAlt />
            </button>
          </div>
        </div>

        {/* Miqdor boshqaruvi */}
        <div className="menu-item-controls">
          <button 
            className="menu-item-qty-btn minus" 
            onClick={handleRemove}
            disabled={quantity === 0}
          >
            -
          </button>
          <span className="menu-item-qty">{quantity}</span>
          <button 
            className="menu-item-qty-btn plus" 
            onClick={handleAdd}
          >
           +
          </button>
        </div>
      </div>

      {/* Izoh modal */}
      {showCommentModal && (
        <div className="comment-modal-overlay" onClick={() => setShowCommentModal(false)}>
          <div className="comment-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="comment-modal-header">
              <h4>✍️ {item.name} uchun izoh</h4>
              <button className="comment-modal-close" onClick={() => setShowCommentModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="comment-modal-body">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Masalan: Muzli, Achchiq, Limon bilan, Tuzsiz..."
                rows={3}
                autoFocus
              />
            </div>
            <div className="comment-modal-footer">
              <button className="comment-btn-cancel" onClick={() => setShowCommentModal(false)}>
                Bekor qilish
              </button>
              <button className="comment-btn-submit" onClick={saveComment}>
                <FaCommentAlt /> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItem;