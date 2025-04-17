import React, { useContext, useState, useEffect } from "react";
import MenuItem from "../components/MenuItem";
import OrderForm from "../components/OrderForm";
import { AppContext } from "../context/AppContext";
import { FaTable, FaBook, FaStar, FaList, FaShoppingCart, FaUserTie, FaBoxOpen, FaTh, FaTimes, FaCreditCard } from "react-icons/fa";
import { MdAccessTime, MdPerson } from "react-icons/md";
import jsPDF from "jspdf";
import logo from "../assets/logo1.png"; // Logo rasm
import "./Home.css";
import { FaPrint } from "react-icons/fa";


function Home() {
  const { tables, selectTable, selectedTableId, menu } = useContext(AppContext);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Real vaqtni yangilash
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
            {currentTime}
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
              <span  >{filteredMenu.length} ta element</span>
              
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

  const saveAsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header with logo and restaurant info
    doc.addImage(logo, "PNG", pageWidth/2 - 25, y, 50, 30);
    y += 40;

    // Restaurant info with better styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("SODIQJON RESTORANI", pageWidth/2, y, { align: "center" });
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Navoiy ko'chasi 123, Toshkent, O'zbekiston", pageWidth/2, y, { align: "center" });
    y += 5;
    doc.text("Telefon: +998 90 123 45 67", pageWidth/2, y, { align: "center" });
    y += 5;
    doc.text("Instagram: @sodiqjon_restorani", pageWidth/2, y, { align: "center" });
    y += 10;

    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, pageWidth - 15, y);
    y += 10;

    // Receipt title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("TAVSIF", 20, y);
    doc.text("MIQDOR", 140, y);
    doc.text("JAMI", 170, y);
    y += 8;

    // Order items
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    selectedTable.orders.forEach((order, index) => {
      // Item name with proper wrapping
      const splitName = doc.splitTextToSize(`${index + 1}. ${order.name}`, 80);
      doc.text(splitName, 20, y);
      
      // Quantity and price
      doc.text(`x${order.quantity}`, 140, y);
      doc.text(`$${(order.price * order.quantity).toFixed(2)}`, 170, y);
      
      // Adjust y position based on name length
      y += Math.max(10, splitName.length * 5);
      
      // Add small gap between items
      if (index < selectedTable.orders.length - 1) {
        y += 2;
      }
    });

    // Total section
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, pageWidth - 15, y);
    y += 10;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("JAMI:", 140, y);
    doc.text(`$${total}`, 170, y);
    y += 15;

    // Payment details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`To'lov turi: Naqd`, 20, y);
    y += 7;
    doc.text(`Chek raqami: #${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, 20, y);
    y += 7;
    doc.text(`Sana: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, y);
    y += 15;

    // Thank you message
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 150);
    doc.text("RAHMAT! YANA KELING!", pageWidth/2, y, { align: "center" });
    y += 7;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Har qanday shikoyat uchun: +998 90 987 65 43", pageWidth/2, y, { align: "center" });

    // Footer line
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, pageWidth - 15, y);
    y += 5;
    
    doc.setFontSize(8);
    doc.text("© 2023 Sodiqjon Restorani. Barcha huquqlar himoyalangan.", pageWidth/2, y, { align: "center" });

    // Save PDF
    doc.save(`Chek_${selectedTable.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
    onClose();
  };

  return (
    <div className="payment-modal">
      <div className="payment-modal-content">
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className="modal-title">
          <FaCreditCard className="modal-icon" /> {selectedTable.name} uchun to'lov
        </h2>
        
        <div className="receipt-preview">
          <div className="receipt-header">
            <div className="restaurant-name">SODIQJON RESTORANI</div>
            <div className="restaurant-address">Navoiy ko'chasi 123, Toshkent</div>
            <div className="receipt-meta">
              <span>Stol: {selectedTable.name}</span>
              <span>Sana: {new Date().toLocaleDateString()}</span>
              <span>Vaqt: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="receipt-items">
            <div className="receipt-item header">
              <span className="item-name">Mahsulot</span>
              <span className="item-quantity">Soni</span>
              <span className="item-price">Narxi</span>
            </div>
            
            {selectedTable.orders.map((order, index) => (
              <div key={index} className="receipt-item">
                <span className="item-name">{index + 1}. {order.name}</span>
                <span className="item-quantity">x{order.quantity}</span>
                <span className="item-price">${(order.price * order.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="receipt-total">
            <div className="total-line">
              <span>Jami:</span>
              <span>${total}</span>
            </div>
          </div>
          
          <div className="receipt-footer">
            <div className="thank-you">RAHMAT! YANA KELING!</div>
            <div className="contact-info">Telefon: +998 90 123 45 67</div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-primary print-btn" onClick={saveAsPDF}>
            <FaPrint /> Chekni chop etish
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            <FaTimes /> Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;