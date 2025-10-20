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
    <div className="tables-container">
      <h2 className="tables-title">🍽️ Sodiqjon Restorani — Stollar</h2>

      <div className="tables-wrapper">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`table-item ${table.status
              .replaceAll(" ", "-")
              .toLowerCase()}`}
            onClick={() => selectTable(table.id)}
          >
            <div className="table-header">
              <h3 className="table-name">{table.name}</h3>
              <span
                className={`table-status ${
                  table.status === "To'lov kutilmoqda"
                    ? "status-pending"
                    : table.status === "Zakaz qo'shildi"
                    ? "status-ordered"
                    : table.status === "Yopish"
                    ? "status-closed"
                    : "status-free"
                }`}
              >
                {table.status}
              </span>
            </div>

            <p className="table-info">
              Ofitsiant: <strong>{table.waiter || "Belgilanmagan"}</strong>
            </p>

            {table.status === "To'lov kutilmoqda" && user?.role === "admin" && (
              <div className="table-buttons">
                <button
                  className="btn btn-receipt"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReceipt(table.id);
                  }}
                >
                  🧾 Chek chiqarish
                </button>
                <button
                  className="btn btn-confirm"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmPayment(table.id);
                  }}
                >
                  ✅ To‘lovni tasdiqlash
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
