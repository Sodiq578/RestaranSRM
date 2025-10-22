import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import "./Reports.css";

// Format price for UZS
const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="reports-modal-overlay">
      <div className="reports-modal">
        <div className="modal-header">
          <h2 className="modal-title">Hisobotlar</h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            ×
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// ReportTable component with debt details
const ReportTable = ({ orders }) => {
  return (
    <div className="table-container">
      <table className="reports-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Stol</th>
            <th>Stol ID</th>
            <th>Ofitsiant</th>
            <th>Sana</th>
            <th>Jami</th>
            <th>Status</th>
            <th>Buyurtmalar</th>
            <th>Qarz ma'lumotlari</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id}>
              <td>{index + 1}</td>
              <td>{order.tableName}</td>
              <td>{order.tableId}</td>
              <td>
                <span className="waiter-badge">
                  {order.waiter || "Belgilanmagan"}
                </span>
              </td>
              <td>{new Date(order.date).toLocaleString("uz-UZ")}</td>
              <td style={{fontWeight: '600', color: '#059669'}}>{formatPrice(order.total)}</td>
              <td>
                <span className={`status-badge ${
                  order.status === "To'lov qilindi" 
                    ? "status-paid" 
                    : order.status === "Qarz"
                    ? "status-debt"
                    : "status-pending"
                }`}>
                  {order.status}
                </span>
              </td>
              <td>
                <div className="items-container">
                  {order.items.map((item, idx) => (
                    <span key={idx} className="item-tag">
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                {order.status === "Qarz" && order.debtDetails ? (
                  <div className="debt-details-card">
                    <div className="debt-detail-item">
                      <span className="debt-label">Summa:</span>{" "}
                      <span className="debt-value">{formatPrice(order.debtDetails.amount)}</span>
                    </div>
                    <div className="debt-detail-item">
                      <span className="debt-label">Qarzdor:</span>{" "}
                      {order.debtDetails.debtorName}
                    </div>
                    <div className="debt-detail-item">
                      <span className="debt-label">Manzil:</span>{" "}
                      {order.debtDetails.debtorAddress}
                    </div>
                    <div className="debt-detail-item">
                      <span className="debt-label">To'lov sanasi:</span>{" "}
                      {new Date(order.debtDetails.repaymentDate).toLocaleDateString("uz-UZ")}
                    </div>
                  </div>
                ) : (
                  <span style={{color: '#9ca3af', fontSize: '0.9rem'}}>Yo'q</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// PaymentHistoryTable component
const PaymentHistoryTable = ({ payments }) => {
  return (
    <div className="payment-history-section">
      <div className="table-container">
        <div className="payment-history-header">
          <h2 className="payment-history-title">To'lovlar Tarixi</h2>
        </div>
        <table className="reports-table payment-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Stol</th>
              <th>Ofitsiant</th>
              <th>Sana</th>
              <th>Jami</th>
              <th>To'lov holati</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment.id}>
                <td>{index + 1}</td>
                <td>{payment.tableName}</td>
                <td>
                  <span className="waiter-badge">
                    {payment.waiter || "Belgilanmagan"}
                  </span>
                </td>
                <td>{new Date(payment.date).toLocaleString("uz-UZ")}</td>
                <td style={{fontWeight: '600', color: '#059669'}}>{formatPrice(payment.total)}</td>
                <td>
                  <span className={`status-badge ${
                    payment.status === "To'lov qilindi" 
                      ? "status-paid" 
                      : "status-debt"
                  }`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function Reports() {
  const { ordersHistory } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchWaiter, setSearchWaiter] = useState("");
  const [searchTable, setSearchTable] = useState("");
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  // Filter orders based on search criteria
  const filteredOrders = ordersHistory.filter((order) => {
    const matchesWaiter = searchWaiter
      ? (order.waiter || "Belgilanmagan").toLowerCase().includes(searchWaiter.toLowerCase())
      : true;
    const matchesTable = searchTable
      ? order.tableName.toLowerCase().includes(searchTable.toLowerCase())
      : true;
    return matchesWaiter && matchesTable;
  });

  // Filter payment history (only completed or debt orders)
  const paymentHistory = ordersHistory.filter(
    (order) => order.status === "To'lov qilindi" || order.status === "Qarz"
  );

  // Function to export to Excel
  const exportToExcel = () => {
    const data = filteredOrders.map((order, index) => ({
      "Buyurtma #": index + 1,
      Stol: order.tableName,
      "Stol ID": order.tableId,
      Ofitsiant: order.waiter || "Belgilanmagan",
      Sana: new Date(order.date).toLocaleString("uz-UZ"),
      Jami: formatPrice(order.total),
      Status: order.status,
      Buyurtmalar: order.items
        .map((item) => `${item.name} x ${item.quantity}`)
        .join(", "),
      "Qarz summasi": order.status === "Qarz" && order.debtDetails ? formatPrice(order.debtDetails.amount) : "Yo'q",
      Qarzdor: order.status === "Qarz" && order.debtDetails ? order.debtDetails.debtorName : "Yo'q",
      "Qarzdor manzili": order.status === "Qarz" && order.debtDetails ? order.debtDetails.debtorAddress : "Yo'q",
      "To'lov sanasi": order.status === "Qarz" && order.debtDetails ? new Date(order.debtDetails.repaymentDate).toLocaleDateString("uz-UZ") : "Yo'q",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hisobotlar");

    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map((key) =>
      Math.max(
        key.length,
        ...data.map((row) => (row[key] ? row[key].toString().length : 0))
      )
    );
    worksheet["!cols"] = colWidths.map((width) => ({ wch: width + 2 }));

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Hisobotlar_${new Date().toLocaleDateString("uz-UZ")}.xlsx`);
    toast.success("Excel fayl muvaffaqiyatli yuklab olindi!");
  };

  // Function to export to Word
  const exportToWord = () => {
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .debt-details p { margin: 2px 0; font-size: 12px; }
            .debt-details strong { color: #dc3545; }
          </style>
        </head>
        <body>
          <h1>Sodiqjon Restorani - Hisobotlar (${new Date().toLocaleDateString("uz-UZ")})</h1>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Stol</th>
                <th>Stol ID</th>
                <th>Ofitsiant</th>
                <th>Sana</th>
                <th>Jami</th>
                <th>Status</th>
                <th>Buyurtmalar</th>
                <th>Qarz ma'lumotlari</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders
                .map(
                  (order, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${order.tableName}</td>
                      <td>${order.tableId}</td>
                      <td>${order.waiter || "Belgilanmagan"}</td>
                      <td>${new Date(order.date).toLocaleString("uz-UZ")}</td>
                      <td>${formatPrice(order.total)}</td>
                      <td>${order.status}</td>
                      <td>${order.items
                        .map((item) => `${item.name} x ${item.quantity}`)
                        .join(", ")}</td>
                      <td>${
                        order.status === "Qarz" && order.debtDetails
                          ? `
                            <div class="debt-details">
                              <p><strong>Summa:</strong> ${formatPrice(order.debtDetails.amount)}</p>
                              <p><strong>Qarzdor:</strong> ${order.debtDetails.debtorName}</p>
                              <p><strong>Manzil:</strong> ${order.debtDetails.debtorAddress}</p>
                              <p><strong>To'lov sanasi:</strong> ${new Date(order.debtDetails.repaymentDate).toLocaleDateString("uz-UZ")}</p>
                            </div>
                          `
                          : "Yo'q"
                      }</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(
      [
        new Uint8Array([0xEF, 0xBB, 0xBF]), // UTF-8 BOM for proper encoding
        htmlContent,
      ],
      { type: "application/msword" }
    );
    saveAs(blob, `Hisobotlar_${new Date().toLocaleDateString("uz-UZ")}.doc`);
    toast.success("Word fayl muvaffaqiyatli yuklab olindi!");
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Hisobotlar</h1>
        <p className="reports-subtitle">Barcha buyurtmalar va to'lovlar tarixi</p>
      </div>

      {/* Search Filters */}
      <div className="search-filters">
        <h2 className="search-filters-title">Qidiruv Filtrlari</h2>
        <div className="search-grid">
          <div className="search-group">
            <label className="search-label">Ofitsiant bo'yicha qidirish</label>
            <div className="search-input-wrapper">
              <svg className="search-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                value={searchWaiter}
                onChange={(e) => setSearchWaiter(e.target.value)}
                placeholder="Ofitsiant ismini kiriting"
                className="search-input"
              />
            </div>
          </div>
          <div className="search-group">
            <label className="search-label">Stol bo'yicha qidirish</label>
            <div className="search-input-wrapper">
              <svg className="search-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                placeholder="Stol nomini kiriting"
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="actions-toolbar">
        <button
          onClick={() => setIsModalOpen(true)}
          className="action-btn btn-full-report"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          To'liq Hisobot
        </button>
        <button
          onClick={exportToExcel}
          className="action-btn btn-excel"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel'ga Eksport
        </button>
        <button
          onClick={exportToWord}
          className="action-btn btn-word"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Word'ga Eksport
        </button>
        <button
          onClick={() => setShowPaymentHistory(!showPaymentHistory)}
          className="action-btn btn-payment-history"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {showPaymentHistory ? "Hisobotlarni Ko'rsat" : "To'lovlar Tarixini Ko'rsat"}
        </button>
      </div>

      {/* Conditional Rendering: Report Table or Payment History */}
      {showPaymentHistory ? (
        <PaymentHistoryTable payments={paymentHistory} />
      ) : (
        <ReportTable orders={filteredOrders} />
      )}

      {/* Results Counter */}
      <div className="results-counter">
        {showPaymentHistory 
          ? `Jami ${paymentHistory.length} ta to'lov topildi` 
          : `Jami ${filteredOrders.length} ta buyurtma topildi`
        }
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ReportTable orders={filteredOrders} />
      </Modal>
    </div>
  );
}

export default Reports;