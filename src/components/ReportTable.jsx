import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import "./TableList.css";

const TableList = () => {
  const {
    tables,
    selectTable,
    user,
    ordersHistory,
    generateReceiptPDF,
    confirmPayment,
  } = useContext(AppContext);

  const handleGenerateReceipt = (tableId) => {
    const order = ordersHistory.find(
      (o) => o.tableId === tableId && o.status === "To'lov kutilmoqda"
    );
    if (order) {
      generateReceiptPDF(order);
    }
  };

  return (
    <div className="table-list">
      <h2>Sodiqjon Restorani - Stollar</h2>
      <div className="tables-grid">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`table-card ${
              table.status === "To'lov kutilmoqda" ? "pending" : ""
            } ${
              table.status === "Zakaz qo'shildi"
                ? "ordered"
                : table.status === "Yopish"
                ? "closed"
                : "free"
            }`}
            onClick={() => selectTable(table.id)}
          >
            <h3>{table.name}</h3>
            <p>Status: {table.status}</p>
            <p>Ofitsiant: {table.waiter || "Belgilanmagan"}</p>
            {table.status === "To'lov kutilmoqda" && user?.role === "admin" && (
              <div className="table-actions">
                <button
                  className="receipt-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReceipt(table.id);
                  }}
                >
                  Chek chiqarish
                </button>
                <button
                  className="confirm-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmPayment(table.id);
                  }}
                >
                  To'lovni tasdiqlash
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableList;