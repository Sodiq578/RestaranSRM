import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { FaPlus, FaCheckCircle, FaCommentAlt } from "react-icons/fa";
import "./MenuItem.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const TELEGRAM_BOT_TOKEN = "7885205848:AAEcgs2vXjZqyV40f6Jvl8Rj1OMq0r7QGkA";
const MAIN_REPORTING_CHAT_ID = "-4646692596";
const BAR_CHAT_ID = "-4646692596";
const SALATCHILAR_CHAT_ID = "-4753754534";
const OSHXONA_CHAT_ID = "-4686557731";

const MenuItem = ({ item }) => {
  const { addToOrder, selectedTableId } = useContext(AppContext);
  const [isSelected, setIsSelected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // List of product categories that require additional message
  const needsMessageCategories = ["Ichimliklar", "Salatlar", "Shashlik"];

  const handleAdd = () => {
    if (!selectedTableId) {
      alert("Iltimos, avval stol tanlang!");
      return;
    }

    // Check if this item needs additional message
    if (needsMessageCategories.includes(item.category) && !additionalMessage) {
      setShowMessageInput(true);
      return;
    }

    setIsSelected(true);
    setShowModal(true);
    setQuantity((prev) => prev + 1);
    
    addToOrder({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      additionalMessage: additionalMessage || null
    });

    // Send additional message to Telegram if exists
    if (additionalMessage) {
      sendMessageToTelegram(item, additionalMessage);
      setAdditionalMessage(""); // Reset message after sending
    }

    setTimeout(() => {
      setIsSelected(false);
      setShowModal(false);
    }, 1000);
  };

  const sendMessageToTelegram = async (item, message) => {
    setIsSending(true);
    try {
      const text = `🛒 Yangi buyurtma:\n\n📌 Stol: ${selectedTableId}\n🍽️ Mahsulot: ${item.name}\n✍️ Izoh: ${message}\n\n⏳ Vaqt: ${new Date().toLocaleString()}`;
      
      let chatId = MAIN_REPORTING_CHAT_ID;
      if (item.category === "Ichimliklar") chatId = BAR_CHAT_ID;
      else if (item.category === "Salatlar") chatId = SALATCHILAR_CHAT_ID;
      else if (item.category === "Shashlik") chatId = OSHXONA_CHAT_ID;
      
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
          }),
        }
      );
      
      if (!response.ok) {
        console.error("Telegramga xabar yuborishda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageSubmit = () => {
    setShowMessageInput(false);
    handleAdd(); // Proceed with adding after message is entered
  };

  return (
    <>
      <div className={`menu-item ${isSelected ? "selected" : ""}`}>
        <div className="image-container">
          <img src={item.image} alt={item.name} className="menu-item-image" />
        </div>
        <div className="menu-item-details">
          <h3 className="menu-item-title" data-title={item.name}>
            {item.name}
          </h3>
          <p className="category">{item.category}</p>
          <div className="price-quantity">
            <p className="menu-item-price">{formatPrice(item.price)}</p>
            {quantity > 0 && (
              <p className="menu-item-quantity">Jami: {quantity}</p>
            )}
          </div>
        </div>
        <button className="add-btn" onClick={handleAdd} disabled={isSending}>
          <FaPlus /> Qo'shish
        </button>
      </div>
      
      {showModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <FaCheckCircle className="modal-icon" />
            <p>{item.name} qo'shildi! (Jami: {quantity})</p>
          </div>
        </div>
      )}
      
      {showMessageInput && (
        <div className="message-modal">
          <div className="message-modal-content">
            <h4>{item.name} uchun qo'shimcha izoh</h4>
            <textarea
              value={additionalMessage}
              onChange={(e) => setAdditionalMessage(e.target.value)}
              placeholder="Masalan: Muzli, Achchiq, Limon bilan..."
              rows={3}
            />
            <div className="message-modal-buttons">
              <button onClick={() => setShowMessageInput(false)}>
                Bekor qilish
              </button>
              <button onClick={handleMessageSubmit} disabled={!additionalMessage}>
                <FaCommentAlt /> Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItem;