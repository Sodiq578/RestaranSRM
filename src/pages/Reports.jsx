import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

// Accordion Item
const AccordionItem = ({ order, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item">
      <div
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{index + 1}.</span>
        <span>{order.tableName}</span>
        <span>{order.waiter || "Belgilanmagan"}</span>
        <span style={{ fontWeight: '600', color: '#059669' }}>
          {formatPrice(order.total)}
        </span>
        <span className={`status-badge ${
          order.status === "To'lov qilindi"
            ? "status-paid"
            : order.status === "Qarz"
            ? "status-debt"
            : "status-pending"
        }`}>
          {order.status}
        </span>
        <span className="accordion-toggle">{isOpen ? "−" : "+"}</span>
      </div>
      {isOpen && (
        <div className="accordion-body">
          <div className="items-container">
            {order.items.map((item, idx) => (
              <span key={idx} className="item-tag">
                {item.name} × {item.quantity}
              </span>
            ))}
          </div>
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
            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Qarz yo'q</span>
          )}
        </div>
      )}
    </div>
  );
};

// Accordion Table
const AccordionTable = ({ orders }) => {
  return (
    <div className="accordion-table">
      {orders.map((order, index) => (
        <AccordionItem key={order.id} order={order} index={index} />
      ))}
    </div>
  );
};

// PaymentHistory Accordion
const PaymentAccordionItem = ({ payment, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="accordion-item">
      <div
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{index + 1}.</span>
        <span>{payment.tableName}</span>
        <span>{payment.waiter || "Belgilanmagan"}</span>
        <span style={{ fontWeight: '600', color: '#059669' }}>
          {formatPrice(payment.total)}
        </span>
        <span className={`status-badge ${
          payment.status === "To'lov qilindi"
            ? "status-paid"
            : "status-debt"
        }`}>
          {payment.status}
        </span>
        <span className="accordion-toggle">{isOpen ? "−" : "+"}</span>
      </div>
      {isOpen && (
        <div className="accordion-body">
          <p>Sana: {new Date(payment.date).toLocaleString("uz-UZ")}</p>
        </div>
      )}
    </div>
  );
};

const PaymentAccordion = ({ payments }) => {
  return (
    <div className="accordion-table">
      {payments.map((payment, index) => (
        <PaymentAccordionItem key={payment.id} payment={payment} index={index} />
      ))}
    </div>
  );
};

function Reports() {
  const { ordersHistory } = useContext(AppContext);
  const [searchWaiter, setSearchWaiter] = useState("");
  const [searchTable, setSearchTable] = useState("");
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  const filteredOrders = ordersHistory.filter((order) => {
    const matchesWaiter = searchWaiter
      ? (order.waiter || "Belgilanmagan").toLowerCase().includes(searchWaiter.toLowerCase())
      : true;
    const matchesTable = searchTable
      ? order.tableName.toLowerCase().includes(searchTable.toLowerCase())
      : true;
    return matchesWaiter && matchesTable;
  });

  const paymentHistory = ordersHistory.filter(
    (order) => order.status === "To'lov qilindi" || order.status === "Qarz"
  );

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Hisobotlar</h1>
        <p className="reports-subtitle">Barcha buyurtmalar va to'lovlar tarixi</p>
      </div>

      {/* Search */}
      <div className="search-filters">
        <div className="search-grid">
          <div className="search-group">
            <label className="search-label">Ofitsiant bo'yicha qidirish</label>
            <input
              type="text"
              value={searchWaiter}
              onChange={(e) => setSearchWaiter(e.target.value)}
              placeholder="Ofitsiant ismini kiriting"
              className="search-input"
            />
          </div>
          <div className="search-group">
            <label className="search-label">Stol bo'yicha qidirish</label>
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

      <div className="actions-toolbar">
        <button
          onClick={() => setShowPaymentHistory(!showPaymentHistory)}
          className="action-btn btn-payment-history"
        >
          {showPaymentHistory ? "Hisobotlarni Ko'rsat" : "To'lovlar Tarixini Ko'rsat"}
        </button>
      </div>

      {showPaymentHistory ? (
        <PaymentAccordion payments={paymentHistory} />
      ) : (
        <AccordionTable orders={filteredOrders} />
      )}

      <div className="results-counter">
        {showPaymentHistory 
          ? `Jami ${paymentHistory.length} ta to'lov topildi` 
          : `Jami ${filteredOrders.length} ta buyurtma topildi`
        }
      </div>
    </div>
  );
}

export default Reports;
