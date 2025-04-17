import React, { useContext, useState } from "react";
import MenuItem from "../components/MenuItem";
import OrderForm from "../components/OrderForm";
import { AppContext } from "../context/AppContext";
import { FaTable, FaBook, FaStar, FaList, FaShoppingCart, FaUserTie, FaBoxOpen, FaTh, FaTimes, FaCreditCard } from "react-icons/fa";
import { MdAccessTime, MdPerson } from "react-icons/md";
import "./Home.css";

function Home() {
  const { tables, selectTable, selectedTableId, menu } = useContext(AppContext);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const selectedTable = tables.find((table) => table.id === selectedTableId);
  const categories = ["all", ...new Set(menu.map((item) => item.category))];
  const filteredMenu = selectedCategory === "all"
    ? menu
    : menu.filter((item) => item.category === selectedCategory);

  return (
    <div className="home-container">
      <header className="app-header">
        <h1>Restoran POS Tizimi</h1>
        <div className="header-info">
          <span className="time-display">
            <MdAccessTime className="header-icon" />
            {new Date().toLocaleTimeString()}
          </span>
          <span className="user-info">
            <MdPerson className="header-icon" />
            Operator: Admin
          </span>
        </div>
      </header>

      {/* Stollar bo‘limi */}
      <section className="tables-section">
        <h2>
          <FaTable className="section-icon" /> Stollar
          <span className="section-badge">{tables.length} jami</span>
        </h2>
        <div className="tables-grid">
          {tables.map((table) => (
            <div
              key={table.id}
              onClick={() => selectTable(table.id)}
              className={`table-card ${selectedTableId === table.id ? "active" : ""} ${
                table.orders.length > 0 ? "occupied" : "available"
              }`}
            >
              <div className="table-number">{table.name}</div>
              {table.orders.length > 0 && (
                <span className="order-count">
                  {table.orders.length} {table.orders.length === 1 ? "buyurtma" : "buyurtmalar"}
                </span>
              )}
              {table.waiter && (
                <div className="waiter-info">
                  <FaUserTie className="waiter-icon" /> {table.waiter}
                </div>
              )}
              {table.orders.length > 0 && (
                <div className="table-total">
                  ${table.orders.reduce((sum, order) => sum + order.price * order.quantity, 0).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Asosiy kontent */}
      <main className="main-content">
        {/* Menyu bo‘limi */}
        <section className="menu-section">
  <div className="section-header">
    <h2>
      <FaBook className="section-icon" /> Menyu
      <span className="section-badge">{filteredMenu.length} ta element</span>
    </h2>
    <div className="category-filter">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="category-select"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat === "all" ? "Barcha kategoriyalar" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>
    </div>
  </div>

  {filteredMenu.length === 0 ? (
    <div className="empty-state">
      <FaBoxOpen className="empty-icon" />
      <p>Menyu elementlari topilmadi</p>
    </div>
  ) : (
    <>
      {filteredMenu.some((item) => item.isBestSeller) && (
        <div className="menu-subsection">
          <h3>
            <FaStar className="subsection-icon" /> Mashhur taomlar
            <span className="subsection-badge">Eng ko‘p sotilganlar</span>
          </h3>
          <div className="menu-grid highlight">
            {filteredMenu
              .filter((item) => item.isBestSeller)
              .map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
          </div>
        </div>
      )}

      <div className="menu-subsection">
        <h3>
          <FaList className="subsection-icon" /> Barcha elementlar
          <span className="subsection-badge">{filteredMenu.length} ta mavjud</span>
        </h3>
        <div className="menu-grid">
          {filteredMenu.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  )}
</section>

        {/* Buyurtmalar bo‘limi */}
        <section className="orders-section">
          {selectedTable ? (
            <>
              <div className="section-header">
                <h2>
                  
                  <FaShoppingCart className="section-icon" /> {selectedTable.name} Buyurtmalari
                  <span className="section-badge">{selectedTable.orders.length} ta element</span>
                </h2>
                {selectedTable.orders.length > 0 && (
                  <button className="payment-button" onClick={() => setShowPayment(true)}>
                    <FaCreditCard className="button-icon" /> To‘lovni amalga oshirish
                  </button>
                )}
              </div>
              <OrderForm tableId={selectedTableId} openPayment={() => setShowPayment(true)} />
            </>
          ) : (
            <div className="empty-state">
              <FaTh className="empty-icon" />
              <p>Iltimos, stolni tanlang</p>
              <small>Yuqoridagi ro‘yxatdan istalgan stolni bosing</small>
            </div>
          )}
        </section>
      </main>

      {/* To‘lov modal oynasi */}
      {showPayment && selectedTableId && (
        <PaymentModal tableId={selectedTableId} onClose={() => setShowPayment(false)} />
      )}
    </div>
  );
}

// To‘lov modal komponenti (Chek ko‘rinishi bilan)
function PaymentModal({ tableId, onClose }) {
  const { tables } = useContext(AppContext);
  const selectedTable = tables.find((table) => table.id === tableId);
  const total = selectedTable.orders.reduce((sum, order) => sum + order.price * order.quantity, 0).toFixed(2);

  return (
    <div className="payment-modal">
      <div className="payment-modal-content">
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className="modal-title">
          <FaCreditCard className="modal-icon" /> {selectedTable.name} uchun chek
        </h2>
        <div className="receipt">
          <div className="receipt-header">
            <h3>Buyurtma detallari</h3>
            <span>Stol: {selectedTable.name}</span>
            <span>Vaqt: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="receipt-items">
            {selectedTable.orders.map((order, index) => (
              <div key={index} className="receipt-item">
                <span className="item-name">{order.name}</span>
                <span className="item-quantity">x{order.quantity}</span>
                <span className="item-price">${(order.price * order.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="receipt-footer">
            <div className="receipt-total">
              <span>Jami:</span>
              <span>${total}</span>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="confirm-button">To‘lovni tasdiqlash</button>
          <button className="cancel-button" onClick={onClose}>
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

