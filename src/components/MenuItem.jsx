import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import "./MenuItem.css";

const MenuItem = ({ item }) => {
  const { addOrder, selectedTableId, tables } = useContext(AppContext);

  const handleAddToOrder = () => {
    if (!selectedTableId) {
      alert("Iltimos, avval stol tanlang!");
      return;
    }
    // Stolni tekshirish
    const table = tables.find((t) => t.id === selectedTableId);
    if (!table) {
      alert("Stol topilmadi!");
      return;
    }
    // Buyurtma ma'lumotlarini tayyorlash
    const orderData = {
      items: [
        {
          ...item,
          quantity: 1,
          comment: "",
        },
      ],
      total: item.price,
    };
    // addOrder funksiyasini chaqirish
    addOrder(selectedTableId, orderData);
  };

  return (
    <div className="menu-item">
      <div className="menu-item-media">
        {item.image ? (
          <img src={item.image} alt={item.name} className="menu-item-image" />
        ) : (
          <div className="menu-item-image menu-item-image--placeholder" />
        )}
        {item.isBestSeller && (
          <span className="menu-item-badge">⭐ Mashhur</span>
        )}
      </div>

      <div className="menu-item-info">
        <div className="menu-item-top">
          <span className="menu-item-category">{item.category}</span>
          <h3 className="menu-item-name">{item.name}</h3>
        </div>

        <div className="menu-item-bottom">
          <p className="menu-item-price">
            {item.price.toLocaleString()} <span>UZS</span>
          </p>
          <button
            className="menu-item-add"
            onClick={handleAddToOrder}
            aria-label={`${item.name} qo'shish`}
          >
            <span className="menu-item-add-icon">+</span>
            <span className="menu-item-add-label">Qo'shish</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;