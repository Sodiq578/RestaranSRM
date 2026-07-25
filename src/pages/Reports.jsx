import React, { useContext, useState, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaUserTie,
  FaTable,
  FaFilter,
  FaRedo,
  FaFileExcel,
  FaFilePdf,
  FaHistory,
  FaChartBar,
  FaMoneyBillWave,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUtensils,
  FaPrint
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "./Reports.css";

// Format price
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
    <div className="rpt-accordion-item">
      <div
        className="rpt-accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="rpt-accordion-main">
          <span className="rpt-accordion-num">{index + 1}.</span>
          <span className="rpt-accordion-table"><FaTable /> {order.tableName}</span>
          <span className="rpt-accordion-waiter"><FaUserTie /> {order.waiter || "Belgilanmagan"}</span>
          <span className="rpt-accordion-total">{formatPrice(order.total)}</span>
          <span className={`rpt-status-badge ${
            order.status === "To'lov qilindi" ? "rpt-status-paid" :
            order.status === "Qarz" ? "rpt-status-debt" : "rpt-status-pending"
          }`}>
            {order.status === "To'lov qilindi" && <FaCheckCircle />}
            {order.status === "Qarz" && <FaExclamationTriangle />}
            {order.status !== "To'lov qilindi" && order.status !== "Qarz" && <FaClock />}
            {order.status}
          </span>
        </div>
        <div className="rpt-accordion-actions">
          <span className="rpt-accordion-date">
            <FaCalendarAlt /> {new Date(order.date).toLocaleDateString("uz-UZ")}
          </span>
          <span className="rpt-accordion-toggle">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>
      </div>
      
      {isOpen && (
        <div className="rpt-accordion-body">
          <div className="rpt-items-section">
            <h4 className="rpt-items-title"><FaUtensils /> Buyurtma mahsulotlari</h4>
            <div className="rpt-items-grid">
              {order.items.map((item, idx) => (
                <span key={idx} className="rpt-item-tag">
                  <span className="rpt-item-name">{item.name}</span>
                  <span className="rpt-item-qty">×{item.quantity}</span>
                  <span className="rpt-item-price">{formatPrice(item.price * item.quantity)}</span>
                </span>
              ))}
            </div>
          </div>
          
          {order.status === "Qarz" && order.debtDetails ? (
            <div className="rpt-debt-card">
              <h4 className="rpt-debt-title"><FaExclamationTriangle /> Qarz ma'lumotlari</h4>
              <div className="rpt-debt-grid">
                <div className="rpt-debt-item">
                  <span className="rpt-debt-label">Summa:</span>
                  <span className="rpt-debt-value">{formatPrice(order.debtDetails.amount)}</span>
                </div>
                <div className="rpt-debt-item">
                  <span className="rpt-debt-label">Qarzdor:</span>
                  <span className="rpt-debt-value">{order.debtDetails.debtorName}</span>
                </div>
                <div className="rpt-debt-item">
                  <span className="rpt-debt-label">Manzil:</span>
                  <span className="rpt-debt-value">{order.debtDetails.debtorAddress}</span>
                </div>
                <div className="rpt-debt-item">
                  <span className="rpt-debt-label">To'lov sanasi:</span>
                  <span className="rpt-debt-value">{new Date(order.debtDetails.repaymentDate).toLocaleDateString("uz-UZ")}</span>
                </div>
              </div>
            </div>
          ) : order.status !== "Qarz" && (
            <div className="rpt-no-debt">
              <FaCheckCircle /> Qarz mavjud emas
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Accordion Table
const AccordionTable = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="rpt-empty">
        <FaClipboardList className="rpt-empty-icon" />
        <h3>Buyurtmalar topilmadi</h3>
        <p>Qidiruv natijalari bo'yicha buyurtma mavjud emas</p>
      </div>
    );
  }

  return (
    <div className="rpt-accordion-table">
      {orders.map((order, index) => (
        <AccordionItem key={order.id} order={order} index={index} />
      ))}
    </div>
  );
};

// Payment Accordion Item
const PaymentAccordionItem = ({ payment, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="rpt-accordion-item">
      <div
        className="rpt-accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="rpt-accordion-main">
          <span className="rpt-accordion-num">{index + 1}.</span>
          <span className="rpt-accordion-table"><FaTable /> {payment.tableName}</span>
          <span className="rpt-accordion-waiter"><FaUserTie /> {payment.waiter || "Belgilanmagan"}</span>
          <span className="rpt-accordion-total">{formatPrice(payment.total)}</span>
          <span className={`rpt-status-badge ${
            payment.status === "To'lov qilindi" ? "rpt-status-paid" : "rpt-status-debt"
          }`}>
            {payment.status === "To'lov qilindi" ? <FaCheckCircle /> : <FaExclamationTriangle />}
            {payment.status}
          </span>
        </div>
        <div className="rpt-accordion-actions">
          <span className="rpt-accordion-date">
            <FaCalendarAlt /> {new Date(payment.date).toLocaleDateString("uz-UZ")}
          </span>
          <span className="rpt-accordion-toggle">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>
      </div>
      
      {isOpen && (
        <div className="rpt-accordion-body">
          <div className="rpt-payment-info">
            <div className="rpt-payment-row">
              <FaCalendarAlt />
              <span>To'lov sanasi: {new Date(payment.date).toLocaleString("uz-UZ")}</span>
            </div>
            <div className="rpt-payment-row">
              <FaMoneyBillWave />
              <span>Summa: {formatPrice(payment.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentAccordion = ({ payments }) => {
  if (payments.length === 0) {
    return (
      <div className="rpt-empty">
        <FaMoneyBillWave className="rpt-empty-icon" />
        <h3>To'lovlar topilmadi</h3>
        <p>Hozircha to'lov tarixi mavjud emas</p>
      </div>
    );
  }

  return (
    <div className="rpt-accordion-table">
      {payments.map((payment, index) => (
        <PaymentAccordionItem key={payment.id} payment={payment} index={index} />
      ))}
    </div>
  );
};

// Main Reports Component
function Reports() {
  const { ordersHistory } = useContext(AppContext);
  const [searchWaiter, setSearchWaiter] = useState("");
  const [searchTable, setSearchTable] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return ordersHistory.filter((order) => {
      const matchesWaiter = searchWaiter
        ? (order.waiter || "Belgilanmagan").toLowerCase().includes(searchWaiter.toLowerCase())
        : true;
      const matchesTable = searchTable
        ? order.tableName.toLowerCase().includes(searchTable.toLowerCase())
        : true;
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesDate = dateFilter
        ? new Date(order.date).toISOString().split("T")[0] === dateFilter
        : true;
      
      return matchesWaiter && matchesTable && matchesStatus && matchesDate;
    });
  }, [ordersHistory, searchWaiter, searchTable, statusFilter, dateFilter]);

  // Payment history
  const paymentHistory = useMemo(() => {
    return ordersHistory.filter(
      (order) => order.status === "To'lov qilindi" || order.status === "Qarz"
    );
  }, [ordersHistory]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const paid = filteredOrders.filter(o => o.status === "To'lov qilindi").length;
    const debt = filteredOrders.filter(o => o.status === "Qarz").length;
    const pending = filteredOrders.filter(o => o.status !== "To'lov qilindi" && o.status !== "Qarz").length;
    const totalAmount = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    return { total, paid, debt, pending, totalAmount };
  }, [filteredOrders]);

  // Reset filters
  const handleReset = () => {
    setSearchWaiter("");
    setSearchTable("");
    setStatusFilter("all");
    setDateFilter("");
  };

  // Excel export
  const exportToExcel = () => {
    try {
      const data = filteredOrders.map(order => ({
        "Sana": new Date(order.date).toLocaleDateString("uz-UZ"),
        "Stol": order.tableName,
        "Ofitsiant": order.waiter || "Belgilanmagan",
        "Mahsulotlar": order.items.map(i => `${i.name} x${i.quantity}`).join(", "),
        "Jami": order.total,
        "Holat": order.status,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Hisobotlar");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Hisobot_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("✅ Excel fayl muvaffaqiyatli yaratildi!");
    } catch (error) {
      toast.error("❌ Excel export qilishda xatolik!");
    }
  };

  return (
    <div className="rpt-container">
      {/* Header */}
      <div className="rpt-header">
        <div className="rpt-header-left">
          <div className="rpt-header-icon">
            <FaChartBar />
          </div>
          <div>
            <h1 className="rpt-title">Hisobotlar</h1>
            <p className="rpt-subtitle">Barcha buyurtmalar va to'lovlar tarixi</p>
          </div>
        </div>
        <div className="rpt-header-actions">
          <button className="rpt-btn-export" onClick={exportToExcel}>
            <FaFileExcel /> Excel
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="rpt-stats-row">
        <div className="rpt-stat-card">
          <div className="rpt-stat-icon total">
            <FaClipboardList />
          </div>
          <div className="rpt-stat-info">
            <span className="rpt-stat-value">{stats.total}</span>
            <span className="rpt-stat-label">Jami buyurtmalar</span>
          </div>
        </div>
        <div className="rpt-stat-card">
          <div className="rpt-stat-icon paid">
            <FaCheckCircle />
          </div>
          <div className="rpt-stat-info">
            <span className="rpt-stat-value">{stats.paid}</span>
            <span className="rpt-stat-label">To'langan</span>
          </div>
        </div>
        <div className="rpt-stat-card">
          <div className="rpt-stat-icon debt">
            <FaExclamationTriangle />
          </div>
          <div className="rpt-stat-info">
            <span className="rpt-stat-value">{stats.debt}</span>
            <span className="rpt-stat-label">Qarzlar</span>
          </div>
        </div>
        <div className="rpt-stat-card">
          <div className="rpt-stat-icon pending">
            <FaClock />
          </div>
          <div className="rpt-stat-info">
            <span className="rpt-stat-value">{stats.pending}</span>
            <span className="rpt-stat-label">Kutilmoqda</span>
          </div>
        </div>
        <div className="rpt-stat-card">
          <div className="rpt-stat-icon amount">
            <FaMoneyBillWave />
          </div>
          <div className="rpt-stat-info">
            <span className="rpt-stat-value">{formatPrice(stats.totalAmount)}</span>
            <span className="rpt-stat-label">Umumiy summa</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar - YONMA-YON */}
      <div className="rpt-toolbar">
        <div className="rpt-search-row">
          <div className="rpt-search-group">
            <FaSearch className="rpt-search-icon" />
            <input
              type="text"
              value={searchWaiter}
              onChange={(e) => setSearchWaiter(e.target.value)}
              placeholder="Ofitsiant qidirish..."
              className="rpt-search-input"
            />
            {searchWaiter && (
              <button className="rpt-search-clear" onClick={() => setSearchWaiter("")}>
                <FaTimes />
              </button>
            )}
          </div>
          
          <div className="rpt-search-group">
            <FaSearch className="rpt-search-icon" />
            <input
              type="text"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              placeholder="Stol qidirish..."
              className="rpt-search-input"
            />
            {searchTable && (
              <button className="rpt-search-clear" onClick={() => setSearchTable("")}>
                <FaTimes />
              </button>
            )}
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rpt-filter-select"
          >
            <option value="all">Barcha holatlar</option>
            <option value="To'lov qilindi">To'langan</option>
            <option value="Qarz">Qarz</option>
            <option value="To'lov kutilmoqda">Kutilmoqda</option>
          </select>
          
          <div className="rpt-date-group">
            <FaCalendarAlt className="rpt-date-icon" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rpt-date-input"
            />
          </div>
        </div>
        
        <div className="rpt-toolbar-actions">
          <button className="rpt-btn-reset" onClick={handleReset}>
            <FaRedo /> Tozalash
          </button>
          <button
            className={`rpt-btn-toggle ${showPaymentHistory ? "active" : ""}`}
            onClick={() => setShowPaymentHistory(!showPaymentHistory)}
          >
            {showPaymentHistory ? (
              <><FaChartBar /> Hisobotlar</>
            ) : (
              <><FaHistory /> To'lovlar tarixi</>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="rpt-content">
        {showPaymentHistory ? (
          <PaymentAccordion payments={paymentHistory} />
        ) : (
          <AccordionTable orders={filteredOrders} />
        )}
      </div>

      {/* Results Counter */}
      <div className="rpt-results-counter">
        <FaClipboardList />
        {showPaymentHistory
          ? `Jami ${paymentHistory.length} ta to'lov topildi`
          : `Jami ${filteredOrders.length} ta buyurtma topildi`
        }
      </div>
    </div>
  );
}

export default Reports;