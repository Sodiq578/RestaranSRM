import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import "./MenuItem.css";

function MenuItem({ item }) {
  const { addToOrder } = useContext(AppContext);

  return (
    <div className={`menu-item ${item.isBestSeller ? "best-seller" : ""}`}>
      <div className="menu-item-content">
        <h3 className="menu-item-name">{item.name}</h3>
        <p className="menu-item-info">
          {item.category} - {item.price.toLocaleString()} so‘m
        </p>
        {item.isBestSeller && (
          <span className="best-seller-badge">🌟 Eng ko‘p sotilgan</span>
        )}
      </div>
      <button className="add-button" onClick={() => addToOrder(item)}>
        Qo‘shish
      </button>
    </div>
  );
}

export default MenuItem;