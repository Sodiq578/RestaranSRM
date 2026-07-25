import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import MenuItem from "../components/MenuItem";
import OrderForm from "../components/OrderForm";
import { AppContext } from "../context/AppContext";
import {
  FaTable,
  FaBook,
  FaStar,
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
  FaPaperPlane,
  FaComment,
  FaMoneyCheckAlt,
  FaSearch,
  FaBars,
  FaHome,
  FaUtensils,
  FaList,
  FaClock,
  FaCheckCircle,
  FaSpinner
} from "react-icons/fa";
import "./Home.css";

// ==================== UTILS ====================
const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// ==================== PAYMENT MODAL ====================
const PaymentModal = ({ tableId, onClose, sendToTelegram, completeOrder, generateReceiptPDF, markAsDebt, confirmPayment }) => {
  const { tables, ordersHistory } = useContext(AppContext);
  const selectedTable = tables.find((table) => table.id === tableId) || { orders: [], name: "-" };
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debtDetails, setDebtDetails] = useState({
    amount: selectedTable.orders.reduce((sum, order) => sum + order.price * order.quantity, 0),
    debtorName: "",
    debtorAddress: "",
    repaymentDate: "",
  });

  const total = selectedTable.orders.reduce((sum, order) => sum + order.price * order.quantity, 0);

  const handleDebtSubmit = async (e) => {
    e.preventDefault();
    if (!debtDetails.debtorName || !debtDetails.debtorAddress || !debtDetails.repaymentDate) {
      toast.error("Iltimos, barcha qarz maydonlarini to'ldiring!");
      return;
    }
    setIsProcessing(true);
    try {
      await completeOrder(tableId);
      await markAsDebt(tableId, debtDetails);
      toast.success("✅ Buyurtma qarz sifatida belgilandi!");
      onClose();
    } catch (error) {
      toast.error("❌ Xatolik: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateReceipt = async () => {
    const order = ordersHistory.find(
      (o) => o.tableId === tableId && (o.status === "To'lov kutilmoqda" || o.status === "Qarz")
    ) || {
      id: Date.now(),
      items: selectedTable.orders,
      total,
      date: new Date(),
      tableId,
      tableName: selectedTable.name,
      waiter: selectedTable.waiter,
      status: "To'lov kutilmoqda",
    };
    setIsProcessing(true);
    try {
      await generateReceiptPDF(order);
      toast.success("✅ Chek muvaffaqiyatli yaratildi!");
      onClose();
    } catch (error) {
      toast.error("❌ Xatolik: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      await completeOrder(tableId, true);
      toast.success("✅ To'lov tasdiqlandi!");
      onClose();
    } catch (error) {
      toast.error("❌ Xatolik: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <FaCreditCard />
          </div>
          <div className="modal-header-text">
            <h2>{selectedTable.name} - To'lov</h2>
            <p>Buyurtmani yakunlash</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={isProcessing}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="receipt-card">
            <div className="receipt-header">
              <div className="receipt-logo">🍽️ SODIQJON</div>
              <div className="receipt-subtitle">RESTORANI</div>
              <div className="receipt-divider"></div>
              <div className="receipt-info-row">
                <span>Stol: {selectedTable.name}</span>
                <span>{new Date().toLocaleString("uz-UZ")}</span>
              </div>
            </div>

            <div className="receipt-items-list">
              {selectedTable.orders.map((order, index) => (
                <div key={index} className="receipt-item-row">
                  <span className="receipt-item-num">{index + 1}.</span>
                  <span className="receipt-item-name">{order.name}</span>
                  <span className="receipt-item-qty">×{order.quantity}</span>
                  <span className="receipt-item-price">{formatPrice(order.price * order.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="receipt-divider thick"></div>
            
            <div className="receipt-total-row">
              <span>JAMI:</span>
              <span className="receipt-total-amount">{formatPrice(total)}</span>
            </div>

            <div className="receipt-footer-text">
              <p>RAHMAT! YANA KELING!</p>
              <small>+998 90 123 45 67</small>
            </div>
          </div>

          {!showDebtForm ? (
            <div className="modal-actions-grid">
              <button className="action-btn primary" onClick={handleGenerateReceipt} disabled={isProcessing}>
                <FaPrint /> Chek chop etish
              </button>
              <button className="action-btn success" onClick={handleConfirmPayment} disabled={isProcessing}>
                <FaCheckCircle /> To'lov qilish
              </button>
              <button className="action-btn warning" onClick={() => setShowDebtForm(true)} disabled={isProcessing}>
                <FaMoneyCheckAlt /> Qarzga berish
              </button>
              <button className="action-btn info" onClick={() => sendToTelegram(selectedTable, selectedTable.orders)} disabled={isProcessing}>
                <FaPaperPlane /> Oshxonaga
              </button>
            </div>
          ) : (
            <form onSubmit={handleDebtSubmit} className="debt-form">
              <h4>📝 Qarz ma'lumotlari</h4>
              <div className="input-group">
                <label>Qarz summasi</label>
                <input type="number" value={debtDetails.amount} onChange={(e) => setDebtDetails({ ...debtDetails, amount: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Qarzdor ismi</label>
                <input type="text" value={debtDetails.debtorName} onChange={(e) => setDebtDetails({ ...debtDetails, debtorName: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Manzili</label>
                <input type="text" value={debtDetails.debtorAddress} onChange={(e) => setDebtDetails({ ...debtDetails, debtorAddress: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>To'lov sanasi</label>
                <input type="date" value={debtDetails.repaymentDate} onChange={(e) => setDebtDetails({ ...debtDetails, repaymentDate: e.target.value })} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowDebtForm(false)}>Bekor qilish</button>
                <button type="submit" className="btn-save" disabled={isProcessing}>
                  {isProcessing ? <FaSpinner className="spin" /> : "Saqlash"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== MESSAGE MODAL ====================
const MessageModal = ({ onClose, sendTelegramMessage }) => {
  const [recipient, setRecipient] = useState("kitchen");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const recipientOptions = [
    { value: "kitchen", label: "🍳 Oshxona", chatId: "-4686557731" },
    { value: "bar", label: "🍹 Bar", chatId: "-4646692596" },
    { value: "salad", label: "🥗 Salatchilar", chatId: "-4753754534" },
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Xabar matni bo'sh bo'lmasligi kerak!");
      return;
    }
    const selected = recipientOptions.find((opt) => opt.value === recipient);
    const formattedMessage = `<b>📩 Operator xabari</b>\n📝 ${message}\n🕒 ${new Date().toLocaleString("uz-UZ")}\n👤 Admin`;
    setIsSending(true);
    try {
      await sendTelegramMessage(formattedMessage, selected.chatId);
      toast.success("✅ Xabar yuborildi!");
      onClose();
    } catch (error) {
      toast.error("❌ Xatolik: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <FaComment />
          </div>
          <div className="modal-header-text">
            <h2>Xabar yuborish</h2>
            <p>Oshxona yoki bar ga</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="input-group">
            <label>Qabul qiluvchi</label>
            <select value={recipient} onChange={(e) => setRecipient(e.target.value)} className="custom-select">
              {recipientOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Xabar matni</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Xabaringizni yozing..." rows="4" />
          </div>
          <div className="form-actions">
            <button className="btn-cancel" onClick={onClose}>Yopish</button>
            <button className="btn-save" onClick={handleSendMessage} disabled={isSending}>
              {isSending ? <FaSpinner className="spin" /> : <><FaPaperPlane /> Yuborish</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN HOME COMPONENT ====================
export default function Home() {
  const {
    tables,
    selectTable,
    selectedTableId,
    menu,
    addToOrder,
    sendTelegramMessage,
    completeOrder,
    generateReceiptPDF,
    markAsDebt,
    confirmPayment,
    sendOrdersToPreparation,
  } = useContext(AppContext);

  const [showPayment, setShowPayment] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("barcha");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [activeSection, setActiveSection] = useState("tables");
  const [isTablesOpen, setIsTablesOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString("uz-UZ"));

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const tablesRef = useRef(null);
  const ordersRef = useRef(null);
  const menuRef = useRef(null);

  const selectedTable = tables.find((table) => table.id === selectedTableId);
  const categories = ["barcha", ...new Set(menu.map((item) => item.category))];

  const suggestionItems = menu.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMenu = menu
    .filter((item) => selectedCategory === "barcha" || item.category === selectedCategory)
    .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const scrollToSection = useCallback((ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString("uz-UZ")), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sections = [
      { ref: tablesRef, name: "tables" },
      { ref: ordersRef, name: "orders" },
      { ref: menuRef, name: "menu" },
    ];
    const onScroll = () => {
      const offsets = sections.map((s) => ({
        name: s.name,
        top: Math.abs(s.ref.current?.getBoundingClientRect().top || Infinity),
      }));
      offsets.sort((a, b) => a.top - b.top);
      if (offsets[0]) setActiveSection(offsets[0].name);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && !e.target.matches("input, textarea, select")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (showSuggestions) {
        if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, suggestionItems.length - 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, 0)); }
        if (e.key === "Enter" && highlightedIndex >= 0) { e.preventDefault(); handleSuggestionClick(suggestionItems[highlightedIndex]); }
        if (e.key === "Escape") setShowSuggestions(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSuggestions, highlightedIndex, suggestionItems]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (item) => {
    setSearchQuery(item.name);
    setShowSuggestions(false);
    if (!selectedTableId) {
      toast.error("⚠️ Iltimos, avval stolni tanlang!");
      return;
    }
    addToOrder({ id: item.id, name: item.name, price: item.price, quantity: 1 });
    setTimeout(() => scrollToSection(ordersRef), 250);
  };

  const handleSelectTable = (id) => {
    selectTable(id);
    setTimeout(() => scrollToSection(ordersRef), 200);
  };

  const sendToTelegram = async (table, orders) => {
    if (!table || !orders || orders.length === 0) {
      toast.error("Buyurtma bo'sh!");
      return;
    }
    const total = orders.reduce((sum, order) => sum + order.price * order.quantity, 0);
    const orderId = `ORD${Date.now().toString().slice(-6)}`;
    const message = `
🆕 <b>YANGI BUYURTMA</b>
📋 <b>ID:</b> ${orderId}
🍽️ <b>Stol:</b> ${table.name}
👨‍🍳 <b>Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
🕒 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
💰 <b>Jami:</b> ${formatPrice(total)}

<b>📋 Buyurtmalar:</b>
${orders.map(order => `• ${order.name} ×${order.quantity}${order.comment ? ` (${order.comment})` : ''}`).join('\n')}`;

    try {
      await sendTelegramMessage(message, "-4646692596");
      await sendOrdersToPreparation(table.id);
      toast.success("✅ Buyurtma Oshxonaga yuborildi!");
    } catch (error) {
      toast.error("❌ Xatolik: " + error.message);
    }
  };

  return (
    <div className="app">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-inner">
          <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <FaBars />
          </button>
          <div className="header-brand">
            <span className="brand-icon">🍽️</span>
            <div className="brand-text">
              <h1>SODIQJON</h1>
              <span>Restorani</span>
            </div>
          </div>
          <div className="header-info">
            <div className="time-badge">
              <FaClock />
              <span>{currentTime}</span>
            </div>
            {selectedTable && (
              <div className="active-table-badge">
                <FaTable />
                <span>{selectedTable.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== MOBILE SIDEBAR ===== */}
      <div className={`mobile-sidebar ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)}>
        <div className="sidebar-content" onClick={(e) => e.stopPropagation()}>
          <div className="sidebar-header">
            <span className="brand-icon">🍽️</span>
            <h2>SODIQJON</h2>
            <button onClick={() => setMobileMenuOpen(false)}><FaTimes /></button>
          </div>
          <nav className="sidebar-nav">
            <button className={activeSection === "tables" ? "active" : ""} onClick={() => scrollToSection(tablesRef)}>
              <FaTable /> Stollar
            </button>
            <button className={activeSection === "orders" ? "active" : ""} onClick={() => scrollToSection(ordersRef)}>
              <FaShoppingCart /> Buyurtmalar
            </button>
            <button className={activeSection === "menu" ? "active" : ""} onClick={() => scrollToSection(menuRef)}>
              <FaBook /> Menyu
            </button>
            <button onClick={() => { setShowMessageModal(true); setMobileMenuOpen(false); }}>
              <FaComment /> Xabar yuborish
            </button>
          </nav>
        </div>
      </div>

      {/* ===== DESKTOP NAVIGATION ===== */}
      <nav className="desktop-nav">
        <div className="nav-inner">
          <button className={`nav-item ${activeSection === "tables" ? "active" : ""}`} onClick={() => scrollToSection(tablesRef)}>
            <FaTable /> <span>Stollar</span>
          </button>
          <button className={`nav-item ${activeSection === "orders" ? "active" : ""}`} onClick={() => scrollToSection(ordersRef)}>
            <FaShoppingCart /> <span>Buyurtmalar</span>
          </button>
          <button className={`nav-item ${activeSection === "menu" ? "active" : ""}`} onClick={() => scrollToSection(menuRef)}>
            <FaBook /> <span>Menyu</span>
          </button>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        {/* Tables & Orders Row */}
        <div className="content-row">
          {/* Tables Section */}
          <section className="card tables-card" ref={tablesRef}>
            <div className="card-header">
              <h3><FaTable /> Stollar</h3>
              <div className="card-header-actions">
                <span className="badge">{tables.length} ta</span>
                <button className="icon-btn" onClick={() => setIsTablesOpen(!isTablesOpen)}>
                  {isTablesOpen ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
            </div>
            <div className={`card-body ${isTablesOpen ? "expanded" : "collapsed"}`}>
              <div className="tables-grid">
                {tables.map((table) => {
                  const tableTotal = table.orders.reduce((sum, o) => sum + o.price * o.quantity, 0);
                  return (
                    <div
                      key={table.id}
                      className={`table-card ${selectedTableId === table.id ? "active" : ""} ${table.orders.length > 0 ? "busy" : "free"}`}
                      onClick={() => handleSelectTable(table.id)}
                    >
                      <div className="table-card-top">
                        <span className="table-name">{table.name}</span>
                        {table.orders.length > 0 && <span className="table-badge">{table.orders.length}</span>}
                      </div>
                      {table.waiter && (
                        <div className="table-waiter">
                          <FaUserTie /> {table.waiter}
                        </div>
                      )}
                      {table.orders.length > 0 && (
                        <div className="table-amount">{formatPrice(tableTotal)}</div>
                      )}
                      <div className={`table-status ${table.orders.length > 0 ? "busy" : "free"}`}>
                        {table.orders.length > 0 ? "Band" : "Bo'sh"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Orders Section */}
          <section className="card orders-card" ref={ordersRef}>
            <div className="card-header">
              <h3><FaShoppingCart /> Buyurtmalar</h3>
              {selectedTable && (
                <span className="badge accent">{selectedTable.name}</span>
              )}
            </div>
            <div className="card-body">
              {selectedTable ? (
                <OrderForm
                  tableId={selectedTableId}
                  openPayment={() => setShowPayment(true)}
                  onSendToKitchen={() => sendToTelegram(selectedTable, selectedTable.orders)}
                />
              ) : (
                <div className="empty-block">
                  <div className="empty-icon">
                    <FaTh />
                  </div>
                  <h4>Stol tanlanmagan</h4>
                  <p>Iltimos, chap tomondan stolni tanlang</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Menu Section */}
        <section className="card menu-card" ref={menuRef}>
          <div className="card-header">
            <h3><FaBook /> Menyu</h3>
            <span className="badge">{filteredMenu.length} ta</span>
          </div>
          
          <div className="menu-toolbar">
            <div className="search-box" ref={searchRef}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Taom qidirish... ( / )"
                value={searchQuery}
                onChange={handleSearchChange}
                ref={searchInputRef}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              />
              {showSuggestions && (
                <div className="suggestions-dropdown">
                  {suggestionItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`suggestion-item ${index === highlightedIndex ? "highlighted" : ""}`}
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item.image && <img src={item.image} alt={item.name} />}
                      <div className="suggestion-info">
                        <span className="suggestion-name">{item.name}</span>
                        <span className="suggestion-cat">{item.category}</span>
                      </div>
                      <span className="suggestion-price">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <select
              className="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "barcha" ? "📋 Barcha" : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="card-body">
            {filteredMenu.length === 0 ? (
              <div className="empty-block">
                <div className="empty-icon"><FaBoxOpen /></div>
                <h4>Hech narsa topilmadi</h4>
                <p>Boshqa kategoriya tanlang yoki qidiruv so'zini o'zgartiring</p>
              </div>
            ) : (
              <>
                {filteredMenu.some((item) => item.isBestSeller) && (
                  <div className="menu-section-block">
                    <h4 className="section-title">
                      <FaStar className="star-icon" /> Mashhur taomlar
                    </h4>
                    <div className="menu-grid featured">
                      {filteredMenu.filter((item) => item.isBestSeller).map((item) => (
                        <MenuItem key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
                <div className="menu-section-block">
                  <h4 className="section-title">
                    <FaList /> Barcha taomlar
                  </h4>
                  <div className="menu-grid">
                    {filteredMenu.map((item) => (
                      <MenuItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* ===== FAB BUTTON ===== */}
      <div className="fab-wrapper">
        <button className="fab-main">
          <FaPlus />
        </button>
        <div className="fab-menu">
          <button className="fab-item" onClick={() => setShowMessageModal(true)}>
            <FaComment /> Xabar
          </button>
          <button className="fab-item" onClick={() => scrollToSection(menuRef)}>
            <FaUtensils /> Menyu
          </button>
          <button className="fab-item" onClick={() => setIsTablesOpen(!isTablesOpen)}>
            {isTablesOpen ? <FaChevronUp /> : <FaChevronDown />}
            {isTablesOpen ? "Yopish" : "Ochish"}
          </button>
        </div>
      </div>

      {/* ===== MODALS ===== */}
      {showPayment && selectedTableId && (
        <PaymentModal
          tableId={selectedTableId}
          onClose={() => setShowPayment(false)}
          sendToTelegram={sendToTelegram}
          completeOrder={completeOrder}
          generateReceiptPDF={generateReceiptPDF}
          markAsDebt={markAsDebt}
          confirmPayment={confirmPayment}
        />
      )}

      {showMessageModal && (
        <MessageModal
          onClose={() => setShowMessageModal(false)}
          sendTelegramMessage={sendTelegramMessage}
        />
      )}
    </div>
  );
}
