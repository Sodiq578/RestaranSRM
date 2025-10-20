import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

const formatPrice = (price) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

function DebtManagement() {
  const { ordersHistory } = useContext(AppContext);
  const debtOrders = ordersHistory.filter((order) => order.status === "Qarz");

  return (
    <div className="p-6">
      <h1 className="text-center text-3xl font-bold mb-6">Qarzlar Boshqaruvi</h1>
      {debtOrders.length === 0 ? (
        <div className="empty-state">
          <p>Hozircha qarzlar yo'q</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">#</th>
                <th className="py-2 px-4 border-b text-left">Stol</th>
                <th className="py-2 px-4 border-b text-left">Sana</th>
                <th className="py-2 px-4 border-b text-left">Jami</th>
                <th className="py-2 px-4 border-b text-left">Qarz ma'lumotlari</th>
              </tr>
            </thead>
            <tbody>
              {debtOrders.map((order, index) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{order.tableName}</td>
                  <td className="py-2 px-4 border-b">{new Date(order.date).toLocaleString("uz-UZ")}</td>
                  <td className="py-2 px-4 border-b">{formatPrice(order.total)}</td>
                  <td className="py-2 px-4 border-b">
                    <div className="debt-details">
                      <p><strong>Summa:</strong> {formatPrice(order.debtDetails.amount)}</p>
                      <p><strong>Qarzdor:</strong> {order.debtDetails.debtorName}</p>
                      <p><strong>Manzil:</strong> {order.debtDetails.debtorAddress}</p>
                      <p><strong>To'lov sanasi:</strong> {new Date(order.debtDetails.repaymentDate).toLocaleDateString("uz-UZ")}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DebtManagement;