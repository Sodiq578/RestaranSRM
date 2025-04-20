import React, { useContext, useState, useEffect, useRef } from "react";
import MenuItem from "../components/MenuItem";
import OrderForm from "../components/OrderForm";
import { AppContext } from "../context/AppContext";
import {
  FaTable,
  FaBook,
  FaStar,
  FaList,
  FaShoppingCart,
  FaUserTie,
  FaBoxOpen,
  FaTh,
  FaTimes,
  FaCreditCard,
  FaPrint,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdAccessTime, MdPerson } from "react-icons/md";
import jsPDF from "jspdf";
import logo from "../assets/logo1.png";
import "./Home.css";

// Narxlarni so‘mda formatlash
const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// PaymentModal komponenti
const PaymentModal = ({ tableId, onClose }) => {
  const { tables } = useContext(AppContext);
  const selectedTable = tables.find((table) => table.id === tableId);
  const total = selectedTable.orders.reduce(
    (sum, order) => sum + order.price * order.quantity,
    0
  );

  const saveAsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    if (logo) {
      doc.addImage(logo, "PNG", pageWidth / 2 - 25, y, 50, 30);
    }
    y += 40;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("SODIQJON RESTORANI", pageWidth / 2, y, { align: "center" });
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Navoiy ko'chasi 123, Toshkent, O'zbekiston",
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 5;
    doc.text("Telefon: +998 90 123 45 67", pageWidth / 2, y, {
      align: "center",
    });
    y += 5;
    doc.text("STIR: 123456789", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("TAVSIF", 20, y);
    doc.text("MIQDOR", 140, y);
    doc.text("JAMI", 170, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    selectedTable.orders.forEach((order, index) => {
      const splitName = doc.splitTextToSize(`${index + 1}. ${order.name}`, 80);
      doc.text(splitName, 20, y);
      doc.text(`x${order.quantity}`, 140, y);
      doc.text(formatPrice(order.price * order.quantity), 170, y);
      y += Math.max(10, splitName.length * 5);
      if (index < selectedTable.orders.length - 1) y += 2;
    });

    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, pageWidth - 15, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("JAMI:", 140, y);
    doc.text(formatPrice(total), 170, y);
    y += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`To'lov turi: Naqd`, 20, y);
    y += 7;
    doc.text(
      `Chek raqami: #${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      20,
      y
    );
    y += 7;
    doc.text(`Sana: ${new Date().toLocaleString("uz-UZ")}`, 20, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 150);
    doc.text("RAHMAT! YANA KELING!", pageWidth / 2, y, { align: "center" });
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "Shikoyatlar uchun: +998 90 987 65 43",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, pageWidth - 15, y);
    y += 5;

    doc.setFontSize(8);
    doc.text(
      "© 2025 Sodiqjon Restorani. Barcha huquqlar himoyalangan.",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    doc.save(
      `Chek_${selectedTable.name}_${new Date().toISOString().slice(0, 10)}.pdf`
    );
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
            <div className="restaurant-address">
              Navoiy ko'chasi 123, Toshkent
            </div>
            <div className="receipt-meta">
              <span>Stol: {selectedTable.name}</span>
              <span>Sana: {new Date().toLocaleString("uz-UZ")}</span>
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
                <span className="item-name">
                  {index + 1}. {order.name}
                </span>
                <span className="item-quantity">x{order.quantity}</span>
                <span className="item-price">
                  {formatPrice(order.price * order.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="receipt-total">
            <div className="total-line">
              <span>Jami:</span>
              <span>{formatPrice(total)}</span>
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
};

function Home() {
  const { tables, selectTable, selectedTableId, menu, addToOrder } = useContext(AppContext);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("barcha");
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("uz-UZ")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [activeSection, setActiveSection] = useState("tables");
  const [isTablesOpen, setIsTablesOpen] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const tablesRef = useRef(null);
  const ordersRef = useRef(null);
  const menuRef = useRef(null);

  // Real vaqtni yangilash
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("uz-UZ"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tashqariga bosilganda qidiruv takliflarni yopish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Qidiruv uchun hotkey
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current.focus();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Faol bo'limni aniqlash uchun IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (tablesRef.current) observer.observe(tablesRef.current);
    if (ordersRef.current) observer.observe(ordersRef.current);
    if (menuRef.current) observer.observe(menuRef.current);

    return () => {
      if (tablesRef.current) observer.unobserve(tablesRef.current);
      if (ordersRef.current) observer.unobserve(ordersRef.current);
      if (menuRef.current) observer.unobserve(menuRef.current);
    };
  }, []);

  // Stol tanlanmagan bo'lsa stollar bo'limini avto ochish
  useEffect(() => {
    if (!selectedTableId) {
      setIsTablesOpen(true);
    }
  }, [selectedTableId]);

  const selectedTable = tables.find((table) => table.id === selectedTableId);
  const categories = ["barcha", ...new Set(menu.map((item) => item.category))];

  // Qidiruv takliflari uchun menyuni filtrlash
  const suggestionItems = menu.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Menyu elementlarini qidiruv va kategoriya bo'yicha filtrlash
  const filteredMenu = menu
    .filter((item) =>
      selectedCategory === "barcha" ? true : item.category === selectedCategory
    )
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Qidiruv maydonidagi o'zgarishlarni boshqarish
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    setHighlightedIndex(-1);
  };

  // Taklif tanlashni boshqarish
  const handleSuggestionClick = (item) => {
    setSearchQuery(item.name);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    if (!selectedTableId) {
      alert("Iltimos, avval stolni tanlang!");
      setIsTablesOpen(true);
      if (tablesRef.current) {
        tablesRef.current.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    addToOrder({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
    if (ordersRef.current) {
      ordersRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Qidiruvni tozalash
  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    searchInputRef.current.focus();
  };

  // Klaviatura navigatsiyasi
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestionItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestionItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestionItems[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  // Bo'limga o'tish
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  // Stol tanlash
  const handleSelectTable = (tableId) => {
    selectTable(tableId);
    if (ordersRef.current) {
      scrollToSection(ordersRef);
    }
  };

  // Stollar bo'limini ochish/yopish
  const toggleTablesSection = () => {
    setIsTablesOpen((prev) => !prev);
  };

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

      {/* Bo'lim navigatsiyasi */}
      <nav className="section-nav">
        <button
          className={`nav-btn ${activeSection === "tables" ? "active" : ""}`}
          onClick={() => scrollToSection(tablesRef)}
        >
          <FaTable className="nav-icon" /> Stollar
        </button>
        <button
          className={`nav-btn ${activeSection === "orders" ? "active" : ""}`}
          onClick={() => scrollToSection(ordersRef)}
        >
          <FaShoppingCart className="nav-icon" /> Buyurtmalar
        </button>
        <button
          className={`nav-btn ${activeSection === "menu" ? "active" : ""}`}
          onClick={() => scrollToSection(menuRef)}
        >
          <FaBook className="nav-icon" /> Menyu
        </button>
      </nav>

      {/* Stollar va Buyurtmalar yonma-yon */}
      <div className="tables-orders-container">
        {/* Stollar bo'limi */}
        <section className="tables-section" id="tables" ref={tablesRef}>
          <div className="section-header">
            <h2>
              <FaTable className="section-icon" /> Stollar
              <span className="section-badge">{tables.length} jami</span>
            </h2>
            <button className="toggle-btn" onClick={toggleTablesSection}>
              {isTablesOpen ? (
                <FaChevronUp className="toggle-icon" />
              ) : (
                <FaChevronDown className="toggle-icon" />
              )}
              {isTablesOpen ? "Yopish" : "Ochish"}
            </button>
          </div>
          <div className={`tables-grid ${isTablesOpen ? "open" : "closed"}`}>
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => handleSelectTable(table.id)}
                className={`table-card ${
                  selectedTableId === table.id ? "active" : ""
                } ${table.orders.length > 0 ? "occupied" : "available"}`}
              >
                <div className="table-number">{table.name}</div>
                {table.orders.length > 0 && (
                  <span className="order-count">
                    {table.orders.length}{" "}
                    {table.orders.length === 1 ? "buyurtma" : "buyurtmalar"}
                  </span>
                )}
                {table.waiter && (
                  <div className="waiter-info">
                    <FaUserTie className="waiter-icon" /> {table.waiter}
                  </div>
                )}
                {table.orders.length > 0 && (
                  <div className="table-total">
                    {formatPrice(
                      table.orders.reduce(
                        (sum, order) => sum + order.price * order.quantity,
                        0
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Buyurtmalar bo'limi */}
        <section className="orders-section" id="orders" ref={ordersRef}>
          {selectedTable ? (
            <>
              <div className="section-header">
                <h2>
                  <FaShoppingCart className="section-icon" />{" "}
                  {selectedTable.name} Buyurtmalari
                  <span className="section-badge">
                    {selectedTable.orders.length} ta element
                  </span>
                </h2>
              </div>
              <OrderForm
                tableId={selectedTableId}
                openPayment={() => setShowPayment(true)}
              />
            </>
          ) : (
            <div className="empty-state">
              <FaTh className="empty-icon" />
              <p>Iltimos, stolni tanlang</p>
              <small>Yuqoridagi ro'yxatdan istalgan stolni bosing</small>
            </div>
          )}
        </section>
      </div>

      {/* Menyu bo'limi */}
      <section className="menu-section" id="menu" ref={menuRef}>
        <div className="section-header">
          <h2>
            <FaBook className="section-icon" /> Menyu
            <span>{filteredMenu.length} ta element</span>
          </h2>
          <div className="menu-controls">
            <div className="search-bar" ref={searchRef}>
         
              <input
                type="text"
                placeholder="Ovqat qidirish... (/)"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="search-input"
                autoComplete="off"
                ref={searchInputRef}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={handleClearSearch}>
                  <FaTimes className="clear-icon" />
                </button>
              )}
              {showSuggestions && suggestionItems.length > 0 && (
                <ul className="suggestions-list">
                  {suggestionItems.map((item, index) => (
                    <li
                      key={item.id}
                      className={`suggestion-item ${
                        index === highlightedIndex ? "highlighted" : ""
                      }`}
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="suggestion-image"
                        />
                      )}
                      <div className="suggestion-details">
                        <span className="suggestion-name">
                          {item.name} ({item.category})
                        </span>
                        <span className="suggestion-price">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="category-filter">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "barcha"
                      ? "Barcha kategoriyalar"
                      : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
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
                  <span className="subsection-badge">Eng ko'p sotilganlar</span>
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
                <span className="subsection-badge">
                  {filteredMenu.length} ta mavjud
                </span>
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

      {/* Floating Action Button */}
      <div className="fab-container">
        <button className="fab-btn main-fab">
          <FaPlus className="fab-icon" />
        </button>
        <div className="fab-actions">
          <button
            className="fab-action-btn"
            onClick={() => scrollToSection(menuRef)}
          >
            <FaBook className="fab-action-icon" /> Menyuga o'tish
          </button>
          <button className="fab-action-btn" onClick={toggleTablesSection}>
            {isTablesOpen ? (
              <FaChevronUp className="fab-action-icon" />
            ) : (
              <FaChevronDown className="fab-action-icon" />
            )}
            Stollarni {isTablesOpen ? "yopish" : "ochish"}
          </button>
        </div>
      </div>

      {/* To'lov modal oynasi */}
      {showPayment && selectedTableId && (
        <PaymentModal
          tableId={selectedTableId}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

export default Home;