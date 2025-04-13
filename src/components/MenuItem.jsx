import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

function MenuItem({ item }) {
  const { addToOrder } = useContext(AppContext);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px",
        background: "#fff",
        borderRadius: "8px",
        margin: "10px 0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "transform 0.2s",
        border: item.isBestSeller ? "2px solid #ffd700" : "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div>
        <span style={{ fontWeight: "bold" }}>{item.name}</span>
        <span style={{ color: "#555", marginLeft: "10px" }}>
          ({item.category}) - {item.price.toLocaleString()} so‘m
        </span>
        {item.isBestSeller && (
          <span style={{ color: "#ffd700", marginLeft: "10px" }}>⭐ Eng ko‘p sotilgan</span>
        )}
      </div>
      <button onClick={() => addToOrder(item)}>Qo‘shish</button>
    </div>
  );
}

export default MenuItem;