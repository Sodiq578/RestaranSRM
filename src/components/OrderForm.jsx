import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

function OrderForm({ tableId, openPayment }) {
  const { tables, updateOrder, removeFromOrder } = useContext(AppContext);
  const table = tables.find((t) => t.id === tableId);
  const orders = table ? table.orders : [];
  const total = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "15px" }}>Buyurtma</h2>
      {orders.length === 0 ? (
        <p style={{ color: "#777", textAlign: "center" }}>Buyurtma yo‘q</p>
      ) : (
        <>
          {orders.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid #eee",
                marginBottom: "10px",
              }}
            >
              <span>
                {item.name} - {(item.price * item.quantity).toLocaleString()} so‘m
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateOrder(tableId, index, parseInt(e.target.value))}
                  style={{ width: "60px" }}
                />
                <button
                  className="delete"
                  onClick={() => removeFromOrder(tableId, index)}
                >
                  O‘chirish
                </button>
              </div>
            </div>
          ))}
          <h3 style={{ marginTop: "15px" }}>Jami: {total.toLocaleString()} so‘m</h3>
          <button
            onClick={openPayment}
            style={{ width: "100%", marginTop: "20px" }}
            disabled={orders.length === 0}
          >
            To‘lovga o‘tish
          </button>
        </>
      )}
    </div>
  );
}

export default OrderForm;