// src/components/OrdersHistory.jsx
import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import "./OrdersHistory.css";

const OrdersHistory = () => {
  const { ordersHistory } = useContext(AppContext);

  if (!ordersHistory || ordersHistory.length === 0) {
    return (
      <div className="orders-history-empty">
        <p>📭 Hech qanday buyurtma mavjud emas</p>
      </div>
    );
  }

  // Xavfsiz ID formatlash
  const formatOrderId = (id) => {
    if (!id) return "#000000";
    // Agar id string bo'lmasa, stringga o'tkazamiz
    const idStr = String(id);
    // Agar id qisqa bo'lsa, to'liq ko'rsatamiz
    if (idStr.length <= 6) return `#${idStr.padStart(6, '0')}`;
    // Aks holda oxirgi 6 ta belgini olamiz
    return `#${idStr.slice(-6)}`;
  };

  // Xavfsiz sana formatlash
  const formatDate = (date) => {
    if (!date) return "Noma'lum";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Noma'lum";
      return d.toLocaleString("uz-UZ");
    } catch (error) {
      return "Noma'lum";
    }
  };

  // Xavfsiz narx formatlash
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0 so'm";
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="orders-history">
      <h2>📋 Buyurtmalar Tarixi</h2>
      <div className="orders-history-list">
        {ordersHistory.map((order, index) => (
          <div key={order.id || index} className="orders-history-item">
            <div className="orders-history-header">
              <span className="orders-history-id">
                {formatOrderId(order.id)}
              </span>
              <span className="orders-history-status">
                {order.status || "Noma'lum"}
              </span>
            </div>
            <div className="orders-history-body">
              <p><strong>Stol:</strong> {order.tableName || "Noma'lum"}</p>
              <p><strong>Buyurtma:</strong> {order.items?.map(i => i.name).join(", ") || "Bo'sh"}</p>
              <p><strong>Narxi:</strong> {formatPrice(order.total)}</p>
              <p><strong>Vaqt:</strong> {formatDate(order.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersHistory;