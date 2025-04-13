import React, { useContext, useState } from "react";
import MenuItem from "../components/MenuItem";
import OrderForm from "../components/OrderForm";
import PaymentModal from "../components/PaymentModal";
import { AppContext } from "../context/AppContext";

function Home() {
  const { tables, selectTable, selectedTableId, menu } = useContext(AppContext);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const selectedTable = tables.find((table) => table.id === selectedTableId);
  const categories = ["all", ...new Set(menu.map((item) => item.category))];
  const filteredMenu = selectedCategory === "all"
    ? menu
    : menu.filter((item) => item.category === selectedCategory);

  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "28px",
        }}
      >
        Restoran Kassa
      </h1>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "15px" }}>Stollar</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {tables.map((table) => (
            <div
              key={table.id}
              onClick={() => selectTable(table.id)}
              style={{
                padding: "15px",
                background: table.orders.length > 0 ? "#ff9999" : "#99ccff",
                color: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                cursor: "pointer",
                width: "120px",
                textAlign: "center",
                transition: "all 0.2s",
                border: selectedTableId === table.id ? "2px solid #007bff" : "none",
              }}
            >
              {table.name}
              {table.orders.length > 0 && (
                <span style={{ marginLeft: "5px", fontSize: "12px" }}>
                  ({table.orders.length})
                </span>
              )}
              {table.waiter && (
                <div style={{ fontSize: "12px", marginTop: "5px" }}>
                  Ofitsiant: {table.waiter}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
        <div style={{ width: "50%" }}>
          <h2 style={{ marginBottom: "15px" }}>Menyu</h2>
          <div style={{ marginBottom: "15px" }}>
            <label>Kategoriya: </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: "5px", marginLeft: "10px", borderRadius: "5px" }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "Hammasi" : cat}
                </option>
              ))}
            </select>
          </div>
          {filteredMenu.length === 0 ? (
            <p style={{ textAlign: "center", color: "#777" }}>Menyu bo‘sh</p>
          ) : (
            <>
              <h3 style={{ marginBottom: "10px" }}>Eng ko‘p sotilganlar</h3>
              {filteredMenu
                .filter((item) => item.isBestSeller)
                .map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))}
              <h3 style={{ marginBottom: "10px", marginTop: "20px" }}>Barcha taomlar</h3>
              {filteredMenu.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </>
          )}
        </div>
        <div style={{ width: "50%" }}>
          {selectedTable ? (
            <>
              <h2 style={{ marginBottom: "15px" }}>{selectedTable.name} buyurtmalari</h2>
              <OrderForm
                tableId={selectedTableId}
                openPayment={() => setShowPayment(true)}
              />
            </>
          ) : (
            <p style={{ textAlign: "center", color: "#777" }}>
              Iltimos, stol tanlang
            </p>
          )}
        </div>
      </div>
      {showPayment && selectedTableId && (
        <PaymentModal
          tableId={selectedTableId}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

export default Home;