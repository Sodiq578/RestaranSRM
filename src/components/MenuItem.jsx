import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { FaPlus } from "react-icons/fa";
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
  const { addToOrder, selectedTableId } = useContext(AppContext);

  const handleAdd = () => {
    if (!selectedTableId) {
      alert("Iltimos, avval stol tanlang!");
      return;
    }
    addToOrder({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
  };

  return (
    <div className="menu-item">
      <div className="menu-item-details">
        <h3>{item.name}</h3>
        <p>{item.category}</p>
        <p className="price">{formatPrice(item.price)}</p>
      </div>
      <button className="add-btn" onClick={handleAdd}>
        <FaPlus /> Qo'shish
      </button>
    </div>
  );
};

export default MenuItem;