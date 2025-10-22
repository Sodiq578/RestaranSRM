import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { FaEye, FaFilePdf } from "react-icons/fa";
import "./OrderForm.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const OrdersHistory = () => {
  const { ordersHistory, generateReceiptPDF } = useContext(AppContext);
  const [filterDate, setFilterDate] = useState("");
  const [filterTable, setFilterTable] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter orders based on date, table, and status
  const filteredOrders = ordersHistory.filter((order) => {
    const orderDate = new Date(order.date).toLocaleDateString("uz-UZ");
    const matchesDate = filterDate ? orderDate.includes(filterDate) : true;
    const matchesTable = filterTable
      ? order.tableName.toLowerCase().includes(filterTable.toLowerCase())
      : true;
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    return matchesDate && matchesTable && matchesStatus;
  });

  // Handle viewing order details
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  // Handle generating PDF for an order
  const handleGeneratePDF = (order) => {
    generateReceiptPDF(order);
  };

  return (
    <div className="orders-history">
      <h2>Buyurtmalar Tarixi</h2>

      {/* Filter Section */}
      <div className="filters">
        <div className="filter-group">
          <label>Sana bo'yicha filter:</label>
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Stol bo'yicha filter:</label>
          <input
            type="text"
            placeholder="Stol nomi"
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Status bo'yicha filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Barchasi</option>
            <option value="To'lov qilindi">To'lov qilindi</option>
            <option value="To'lov kutilmoqda">To'lov kutilmoqda</option>
            <option value="Qarz">Qarz</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <p className="no-orders">Buyurtmalar tarixi mavjud emas</p>
        ) : (
          <>
            <div className="order-item header">
              <span>ID</span>
              <span>Stol</span>
              <span>Sana</span>
              <span>Jami</span>
              <span>Status</span>
              <span>Amallar</span>
            </div>
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-item">
                <span>{order.id}</span>
                <span>{order.tableName} (ID: {order.tableId})</span>
                <span>{new Date(order.date).toLocaleString("uz-UZ")}</span>
                <span>{formatPrice(order.total)}</span>
                <span>{order.status}</span>
                <span className="actions">
                  <button
                    className="btn btn-info"
                    onClick={() => handleViewDetails(order)}
                  >
                    <FaEye /> Ko'rish
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGeneratePDF(order)}
                  >
                    <FaFilePdf /> PDF
                  </button>
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <h3>Buyurtma Tafsilotlari (ID: {selectedOrder.id})</h3>
            <p><strong>Stol:</strong> {selectedOrder.tableName} (ID: {selectedOrder.tableId})</p>
            <p><strong>Ofitsiant:</strong> {selectedOrder.waiter || "Belgilanmagan"}</p>
            <p><strong>Sana:</strong> {new Date(selectedOrder.date).toLocaleString("uz-UZ")}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <h4>Buyurtmalar:</h4>
            <ul>
              {selectedOrder.items.map((item, index) => (
                <li key={index}>
                  {item.name} x {item.quantity} = {formatPrice(item.price * item.quantity)}
                  {item.category && ` (${item.category})`}
                </li>
              ))}
            </ul>
            <p><strong>Jami:</strong> {formatPrice(selectedOrder.total)}</p>
            {selectedOrder.status === "Qarz" && selectedOrder.debtDetails && (
              <div className="debt-details">
                <h4>Qarz Ma'lumotlari:</h4>
                <p><strong>Summa:</strong> {formatPrice(selectedOrder.debtDetails.amount)}</p>
                <p><strong>Qarzdor:</strong> {selectedOrder.debtDetails.debtorName}</p>
                <p><strong>Manzil:</strong> {selectedOrder.debtDetails.debtorAddress}</p>
                <p><strong>To'lov sanasi:</strong> {new Date(selectedOrder.debtDetails.repaymentDate).toLocaleDateString("uz-UZ")}</p>
              </div>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedOrder(null)}
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;