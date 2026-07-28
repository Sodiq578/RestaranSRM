import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { FaPlus, FaSearch } from "react-icons/fa";
import "./TableList.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const TableList = ({ onSelectTable }) => {
  const { tables, selectedTableId } = useContext(AppContext);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const statuses = [
    { key: "all", label: "Barchasi" },
    { key: "Bo'sh", label: "Bo'sh" },
    { key: "Band", label: "Band" },
    { key: "Band qilingan", label: "Band qilingan" },
    { key: "Tozalanmoqda", label: "Tozalanmoqda" },
  ];

  const filteredTables = tables.filter((table) => {
    const matchStatus = filter === "all" || table.status === filter;
    const matchSearch =
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (table.waiter && table.waiter.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const getStatusClass = (status) => {
    const map = {
      "Bo'sh": "status-free",
      Band: "status-occupied",
      "Band qilingan": "status-reserved",
      Tozalanmoqda: "status-cleaning",
    };
    return map[status] || "";
  };

  const getStatusIcon = (status) => {
    const map = {
      "Bo'sh": "🟢",
      Band: "🔴",
      "Band qilingan": "🟡",
      Tozalanmoqda: "🟣",
    };
    return map[status] || "⚪";
  };

  const handleTableClick = (tableId) => {
    if (onSelectTable) {
      onSelectTable(tableId);
    }
  };

  return (
    <div className="table-list-wrapper">
      <div className="table-list-header">
        <h2>🍽️ Stollar</h2>
        <p className="table-list-subtitle">Restoran stollarini boshqarish</p>
      </div>

      <div className="table-filter-tabs">
        {statuses.map((s) => (
          <button
            key={s.key}
            className={`filter-tab ${filter === s.key ? "active" : ""}`}
            onClick={() => setFilter(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="table-search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Stol nomi yoki ofitsiant bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="tables-grid-container">
        {filteredTables.map((table) => {
          const total = table.orders?.reduce((sum, o) => sum + o.price * o.quantity, 0) || 0;
          const orderCount = table.orders?.length || 0;
          const isSelected = selectedTableId === table.id;
          const seats = table.seats || 4;

          return (
            <div
              key={table.id}
              className={`table-card ${getStatusClass(table.status)} ${isSelected ? "selected" : ""}`}
              onClick={() => handleTableClick(table.id)}
            >
              <div className="table-card-header">
                <span className="table-name">{table.name}</span>
                <span className={`table-status-badge ${getStatusClass(table.status)}`}>
                  {getStatusIcon(table.status)} {table.status}
                </span>
              </div>

              <div className="table-card-body">
                <div className="table-detail">
                  <span className="detail-label">O'rindiqlar</span>
                  <span className="detail-value">{seats}</span>
                </div>
                {total > 0 && (
                  <div className="table-detail">
                    <span className="detail-label">Narxi</span>
                    <span className="detail-value">{formatPrice(total)}</span>
                  </div>
                )}
                {orderCount > 0 && (
                  <div className="table-detail">
                    <span className="detail-label">Buyurtmalar</span>
                    <span className="detail-value">{orderCount} ta</span>
                  </div>
                )}
                {table.waiter && (
                  <div className="table-detail">
                    <span className="detail-label">Ofitsiant</span>
                    <span className="detail-value">{table.waiter}</span>
                  </div>
                )}
              </div>

              <div className="table-card-actions">
                {table.status === "Bo'sh" && (
                  <button className="btn-action btn-free" onClick={(e) => e.stopPropagation()}>
                    Band qilish
                  </button>
                )}
                {table.status === "Band" && (
                  <>
                    <button className="btn-action btn-order" onClick={(e) => e.stopPropagation()}>
                      Buyurtma
                    </button>
                    <button className="btn-action btn-pay" onClick={(e) => e.stopPropagation()}>
                      Hisob
                    </button>
                  </>
                )}
                {table.status === "Band qilingan" && (
                  <button className="btn-action btn-reserve" onClick={(e) => e.stopPropagation()}>
                    Qabul qilish
                  </button>
                )}
                {table.status === "Tozalanmoqda" && (
                  <button className="btn-action btn-clean" onClick={(e) => e.stopPropagation()}>
                    Tozalash
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div className="table-card add-new">
          <button className="add-new-btn">
            <FaPlus />
            <span>Yangi stol</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableList;