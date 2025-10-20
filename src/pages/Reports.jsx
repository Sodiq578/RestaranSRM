// src/components/Reports.jsx
import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-[95vw] max-h-[95vh] overflow-auto p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Hisobotlar</h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 font-bold text-xl"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ReportTable component with debt details
const ReportTable = ({ orders }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">#</th>
            <th className="py-2 px-4 border-b text-left">Stol</th>
            <th className="py-2 px-4 border-b text-left">Stol ID</th>
            <th className="py-2 px-4 border-b text-left">Ofitsiant</th>
            <th className="py-2 px-4 border-b text-left">Sana</th>
            <th className="py-2 px-4 border-b text-left">Jami</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Buyurtmalar</th>
            <th className="py-2 px-4 border-b text-left">Qarz ma'lumotlari</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{index + 1}</td>
              <td className="py-2 px-4 border-b">{order.tableName}</td>
              <td className="py-2 px-4 border-b">{order.tableId}</td>
              <td className="py-2 px-4 border-b">{order.waiter || "Belgilanmagan"}</td>
              <td className="py-2 px-4 border-b">{new Date(order.date).toLocaleString("uz-UZ")}</td>
              <td className="py-2 px-4 border-b">{formatPrice(order.total)}</td>
              <td className="py-2 px-4 border-b">{order.status}</td>
              <td className="py-2 px-4 border-b">
                {order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}
              </td>
              <td className="py-2 px-4 border-b">
                {order.status === "Qarz" && order.debtDetails ? (
                  <div className="debt-details">
                    <p><strong>Summa:</strong> {formatPrice(order.debtDetails.amount)}</p>
                    <p><strong>Qarzdor:</strong> {order.debtDetails.debtorName}</p>
                    <p><strong>Manzil:</strong> {order.debtDetails.debtorAddress}</p>
                    <p><strong>To'lov sanasi:</strong> {new Date(order.debtDetails.repaymentDate).toLocaleDateString("uz-UZ")}</p>
                  </div>
                ) : (
                  "Yo'q"
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
    <div className="overflow-x-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">To'lovlar Tarixi</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">#</th>
            <th className="py-2 px-4 border-b text-left">Stol</th>
            <th className="py-2 px-4 border-b text-left">Ofitsiant</th>
            <th className="py-2 px-4 border-b text-left">Sana</th>
            <th className="py-2 px-4 border-b text-left">Jami</th>
            <th className="py-2 px-4 border-b text-left">To'lov holati</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{index + 1}</td>
              <td className="py-2 px-4 border-b">{payment.tableName}</td>
              <td className="py-2 px-4 border-b">{payment.waiter || "Belgilanmagan"}</td>
              <td className="py-2 px-4 border-b">{new Date(payment.date).toLocaleString("uz-UZ")}</td>
              <td className="py-2 px-4 border-b">{formatPrice(payment.total)}</td>
              <td className="py-2 px-4 border-b">{payment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-center text-3xl font-bold mb-6 text-gray-800">Hisobotlar</h1>

      {/* Search Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ofitsiant bo'yicha qidirish</label>
          <input
            type="text"
            value={searchWaiter}
            onChange={(e) => setSearchWaiter(e.target.value)}
            placeholder="Ofitsiant ismini kiriting"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Stol bo'yicha qidirish</label>
          <input
            type="text"
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            placeholder="Stol nomini kiriting"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end mb-6 space-x-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          To'liq Hisobot
        </button>
        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Excel'ga Eksport
        </button>
        <button
          onClick={exportToWord}
          className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
        >
          Word'ga Eksport
        </button>
        <button
          onClick={() => setShowPaymentHistory(!showPaymentHistory)}
          className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
        >
          {showPaymentHistory ? "Hisobotlarni Ko'rsat" : "To'lovlar Tarixini Ko'rsat"}
        </button>
      </div>

      {/* Conditional Rendering: Report Table or Payment History */}
      {showPaymentHistory ? (
        <PaymentHistoryTable payments={paymentHistory} />
      ) : (
        <ReportTable orders={filteredOrders} />
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ReportTable orders={filteredOrders} />
      </Modal>
    </div>
  );
}

export default Reports;