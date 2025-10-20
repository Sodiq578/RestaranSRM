import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

const TableList = () => {
  const {
    tables,
    selectTable,
    user,
    ordersHistory,
    generateReceiptPDF,
    confirmPayment,
    markAsDebt,
  } = useContext(AppContext);

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [debtDetails, setDebtDetails] = useState({
    amount: "",
    debtorName: "",
    debtorAddress: "",
    repaymentDate: "",
  });
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleGenerateReceipt = (tableId) => {
    const order = ordersHistory.find(
      (o) => o.tableId === tableId && (o.status === "To'lov kutilmoqda" || o.status === "Qarz")
    );
    if (order) {
      generateReceiptPDF(order);
    } else {
      alert("Chek chiqarish uchun buyurtma topilmadi!");
    }
  };

  const openDebtModal = (tableId) => {
    const order = ordersHistory.find(
      (o) => o.tableId === tableId && o.status === "To'lov kutilmoqda"
    );
    if (!order) {
      alert("Qarz belgilash uchun buyurtma topilmadi!");
      return;
    }
    setSelectedTableId(tableId);
    setDebtDetails({ amount: order.total, debtorName: "", debtorAddress: "", repaymentDate: "" });
    setIsDebtModalOpen(true);
  };

  const handleDebtSubmit = (e) => {
    e.preventDefault();
    if (
      !debtDetails.amount ||
      !debtDetails.debtorName ||
      !debtDetails.debtorAddress ||
      !debtDetails.repaymentDate
    ) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    markAsDebt(selectedTableId, { ...debtDetails });
    setIsDebtModalOpen(false);
    setDebtDetails({ amount: "", debtorName: "", debtorAddress: "", repaymentDate: "" });
    setSelectedTableId(null);
  };

  const filteredTables = tables.filter((table) => {
    const matchesStatus = filterStatus ? table.status === filterStatus : true;
    const matchesSearch = table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (table.waiter && table.waiter.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-center text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        🍽️ Sodiqjon Restorani — Stollar
      </h2>

      {/* Filter and Search Bar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Barcha holatlar</option>
          <option value="Bo'sh">Bo'sh</option>
          <option value="Zakaz qo'shildi">Zakaz qo'shildi</option>
          <option value="Tayyorlashga yuborildi">Tayyorlashga yuborildi</option>
          <option value="To'lov kutilmoqda">To'lov kutilmoqda</option>
          <option value="Qarz">Qarz</option>
        </select>
        <input
          type="text"
          placeholder="Stol yoki ofitsiant bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            className={`border rounded-lg p-4 cursor-pointer transition-transform hover:scale-105
              ${table.status === "Bo'sh" ? "bg-green-100" : ""}
              ${table.status === "Zakaz qo'shildi" ? "bg-yellow-100" : ""}
              ${table.status === "Tayyorlashga yuborildi" ? "bg-blue-100" : ""}
              ${table.status === "To'lov kutilmoqda" ? "bg-orange-100" : ""}
              ${table.status === "Qarz" ? "bg-red-100" : ""}`}
            onClick={() => selectTable(table.id)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{table.name}</h3>
              <span
                className={`text-sm font-medium px-2 py-1 rounded
                  ${table.status === "To'lov kutilmoqda" ? "bg-orange-500 text-white" : ""}
                  ${table.status === "Zakaz qo'shildi" ? "bg-yellow-500 text-white" : ""}
                  ${table.status === "Tayyorlashga yuborildi" ? "bg-blue-500 text-white" : ""}
                  ${table.status === "Bo'sh" ? "bg-green-500 text-white" : ""}
                  ${table.status === "Qarz" ? "bg-red-500 text-white" : ""}`}
              >
                {table.status}
              </span>
            </div>
            <p className="text-sm">
              Ofitsiant: <strong>{table.waiter || "Belgilanmagan"}</strong>
            </p>
            {(table.status === "To'lov kutilmoqda" || table.status === "Qarz") && (
              <div className="mt-2 flex flex-col gap-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReceipt(table.id);
                  }}
                >
                  🧾 Chek chiqarish
                </button>
                {table.status === "To'lov kutilmoqda" && (
                  <>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmPayment(table.id);
                      }}
                    >
                      ✅ To‘lovni tasdiqlash
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDebtModal(table.id);
                      }}
                    >
                      💳 Qarz sifatida belgilash
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Debt Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Qarz ma'lumotlari</h2>
            <form onSubmit={handleDebtSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Qarz summasi (UZS)</label>
                <input
                  type="number"
                  value={debtDetails.amount}
                  onChange={(e) => setDebtDetails({ ...debtDetails, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Qarzdor ismi</label>
                <input
                  type="text"
                  value={debtDetails.debtorName}
                  onChange={(e) => setDebtDetails({ ...debtDetails, debtorName: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Qarzdor manzili</label>
                <input
                  type="text"
                  value={debtDetails.debtorAddress}
                  onChange={(e) => setDebtDetails({ ...debtDetails, debtorAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">To'lov sanasi</label>
                <input
                  type="date"
                  value={debtDetails.repaymentDate}
                  onChange={(e) => setDebtDetails({ ...debtDetails, repaymentDate: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDebtModalOpen(false)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableList;