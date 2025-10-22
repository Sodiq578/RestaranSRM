import React, { useContext, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
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
  FaPaperPlane,
  FaComment,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdAccessTime, MdPerson } from "react-icons/md";
import "./Home.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// PaymentModal with debt marking
const PaymentModal = ({ tableId, onClose, sendToTelegram, completeOrder, generateReceiptPDF, markAsDebt, confirmPayment }) => {
  const { tables, ordersHistory } = useContext(AppContext);
  const selectedTable = tables.find((table) => table.id === tableId) || { orders: [], name: "-" };
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [debtDetails, setDebtDetails] = useState({
    amount: selectedTable.orders.reduce((sum, order) => sum + order.price * order.quantity, 0),
    debtorName: "",
    debtorAddress: "",
    repaymentDate: "",
  });

  const total = selectedTable.orders.reduce(
    (sum, order) => sum + order.price * order.quantity,
    0
  );

  const handleDebtSubmit = async (e) => {
    e.preventDefault();
    if (!debtDetails.amount || !debtDetails.debtorName || !debtDetails.debtorAddress || !debtDetails.repaymentDate) {
      toast.error("Iltimos, barcha qarz maydonlarini to'ldiring!");
      return;
    }
    try {
      await completeOrder(tableId); // Move to ordersHistory with "To'lov kutilmoqda"
      await markAsDebt(tableId, debtDetails);
      toast.success("Buyurtma qarz sifatida belgilandi!");
      setShowDebtForm(false);
      onClose();
    } catch (error) {
      toast.error("Qarz belgilashda xato: " + error.message);
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
    try {
      await generateReceiptPDF(order);
      toast.success("Chek muvaffaqiyatli yaratildi!");
      onClose();
    } catch (error) {
      toast.error("Chek yaratishda xato: " + error.message);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await completeOrder(tableId, true); // Complete with payment confirmed
      toast.success("To'lov tasdiqlandi!");
      onClose();
    } catch (error) {
      toast.error("To'lov tasdiqlashda xato: " + error.message);
    }
  };

  return (
    <div className=" payment-modal">
      <div className="payment-modal-content">
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className="modal-title">
          <FaCreditCard /> {selectedTable.name} uchun to'lov
        </h2>

        <div className="receipt-preview">
          <div className="receipt-header">
            <div className="restaurant-name">SODIQJON RESTORANI</div>
            <div className="restaurant-address">Navoiy ko'chasi 123, Toshkent</div>
            <div className="receipt-meta">
              <span>Stol: {selectedTable.name}</span>
              <span>Sana: {new Date().toLocaleString("uz-UZ")}</span>
            </div>
          </div>

          <div className="receipt-items">
            {selectedTable.orders.map((order, index) => (
              <div key={index} className="receipt-item">
                <span className="item-name">{index + 1}. {order.name}</span>
                <span className="item-quantity">x{order.quantity}</span>
                <span className="item-price">{formatPrice(order.price * order.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="receipt-total">
            <span>Jami:</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div className="receipt-footer">
            <div className="thank-you">RAHMAT! YANA KELING!</div>
            <div className="contact-info">Telefon: +998 90 123 45 67</div>
          </div>
        </div>

        {!showDebtForm ? (
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleGenerateReceipt}>
              <FaPrint /> Chekni chop etish
            </button>
            <button className="btn btn-primary" onClick={handleConfirmPayment}>
              <FaCreditCard /> To'lovni tasdiqlash
            </button>
            <button className="btn btn-danger" onClick={() => setShowDebtForm(true)}>
              <FaMoneyCheckAlt /> Qarz sifatida belgilash
            </button>
            <button
              className="btn btn-primary"
              onClick={() => sendToTelegram(selectedTable, selectedTable.orders)}
            >
              <FaPaperPlane /> Tayyorlashga yuborish
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              <FaTimes /> Yopish
            </button>
          </div>
        ) : (
          <form onSubmit={handleDebtSubmit} className="debt-form">
            <div className="form-group">
              <label htmlFor="debtAmount">Qarz summasi (UZS)</label>
              <input
                id="debtAmount"
                type="number"
                value={debtDetails.amount}
                onChange={(e) => setDebtDetails({ ...debtDetails, amount: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="debtorName">Qarzdor ismi</label>
              <input
                id="debtorName"
                type="text"
                value={debtDetails.debtorName}
                onChange={(e) => setDebtDetails({ ...debtDetails, debtorName: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="debtorAddress">Qarzdor manzili</label>
              <input
                id="debtorAddress"
                type="text"
                value={debtDetails.debtorAddress}
                onChange={(e) => setDebtDetails({ ...debtDetails, debtorAddress: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="repaymentDate">To'lov sanasi</label>
              <input
                id="repaymentDate"
                type="date"
                value={debtDetails.repaymentDate}
                onChange={(e) => setDebtDetails({ ...debtDetails, repaymentDate: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDebtForm(false)}>
                Bekor qilish
              </button>
              <button type="submit" className="btn btn-primary">
                Saqlash
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// MessageModal with toast notifications
const MessageModal = ({ onClose, sendTelegramMessage }) => {
  const [recipient, setRecipient] = useState("kitchen");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const recipientOptions = [
    { value: "kitchen", label: "Oshxona", chatId: "-4686557731" },
    { value: "bar", label: "Bar", chatId: "-4646692596" },
    { value: "salad", label: "Salatchilar", chatId: "-4753754534" },
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Xabar matni bo'sh bo'lmasligi kerak!");
      return;
    }

    const selectedRecipient = recipientOptions.find(
      (opt) => opt.value === recipient
    );
    const formattedMessage = `<b>📩 Operator tomonidan xabar</b>\n📝 Xabar: ${message}\n🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}\n👤 Yuboruvchi: Admin`;

    setIsSending(true);
    try {
      await sendTelegramMessage(formattedMessage, selectedRecipient.chatId);
      toast.success("Xabar muvaffaqiyatli yuborildi!");
      setMessage("");
      onClose();
    } catch (error) {
      toast.error("Xabar yuborishda xato: " + (error?.message || error));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="message-modal">
      <div className="message-modal-content">
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className="modal-title">
          <FaComment /> Xabar yuborish
        </h2>
        <div className="message-form">
          <label htmlFor="recipient">Qabul qiluvchi:</label>
          <select
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="form-input"
          >
            {recipientOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label htmlFor="message">Xabar:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Xabaringizni kiriting..."
            rows="5"
            className="form-input"
          />
          <div className="modal-actions">
            <button
              className="btn btn-primary"
              onClick={handleSendMessage}
              disabled={isSending}
            >
              <FaPaperPlane /> {isSending ? "Yuborilmoqda..." : "Yuborish"}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              <FaTimes /> Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  } = useContext(AppContext);

  const [showPayment, setShowPayment] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("barcha");
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("uz-UZ")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [activeSection, setActiveSection] = useState("tables");
  const [isTablesOpen, setIsTablesOpen] = useState(true);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const tablesRef = useRef(null);
  const ordersRef = useRef(null);
  const menuRef = useRef(null);

  // Scroll function
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("uz-UZ"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Active section observer
  useEffect(() => {
    const sections = [
      { ref: tablesRef, name: "tables" },
      { ref: ordersRef, name: "orders" },
      { ref: menuRef, name: "menu" },
    ];

    const onScroll = () => {
      const topOffsets = sections.map((s) => {
        const rect = s.ref.current?.getBoundingClientRect();
        return { name: s.name, top: rect ? Math.abs(rect.top) : Infinity };
      });
      topOffsets.sort((a, b) => a.top - b.top);
      if (topOffsets[0]) setActiveSection(topOffsets[0].name);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectedTable = tables.find((table) => table.id === selectedTableId);
  const categories = ["barcha", ...new Set(menu.map((item) => item.category))];

  const suggestionItems = menu.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMenu = menu
    .filter((item) =>
      selectedCategory === "barcha" ? true : item.category === selectedCategory
    )
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (item) => {
    setSearchQuery(item.name);
    setShowSuggestions(false);
    if (!selectedTableId) {
      toast.error("Iltimos, avval stolni tanlang!");
      return;
    }
    addToOrder({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
    setTimeout(() => scrollToSection(ordersRef), 250);
  };

  // Keyboard support for suggestions and focusing search with '/'
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (showSuggestions) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((i) => Math.min(i + 1, suggestionItems.length - 1));
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, 0));
        }
        if (e.key === "Enter" && highlightedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestionItems[highlightedIndex]);
        }
        if (e.key === "Escape") {
          setShowSuggestions(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSuggestions, highlightedIndex, suggestionItems]);

  // Scroll to orders when selecting a table
  const handleSelectTable = (id) => {
    selectTable(id);
    setTimeout(() => scrollToSection(ordersRef), 200);
  };

  const sendToTelegram = async (table, orders) => {
    const total = orders.reduce((sum, order) => sum + order.price * order.quantity, 0);
    const message = `<b>🛒 Yangi buyurtma: ${table.name}</b>\n📅 Sana: ${new Date().toLocaleString("uz-UZ")}\n📋 Buyurtmalar:\n${orders
      .map(
        (order) =>
          `- ${order.name} x ${order.quantity} (${formatPrice(order.price * order.quantity)})`
      )
      .join("\n")}\n💵 Jami: ${formatPrice(total)}\n👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}`;

    try {
      await sendTelegramMessage(message, "-4646692596");
      toast.success("Buyurtma Telegramga yuborildi!");
    } catch (error) {
      toast.error("Xatolik yuz berdi: " + (error?.message || error));
    }
  };

  return (
    <div className="home-container">
    

      <nav className="section-nav">
        <button
          className={`nav-btn ${activeSection === "tables" ? "active" : ""}`}
          onClick={() => scrollToSection(tablesRef)}
        >
          <FaTable /> Stollar
        </button>
        <button
          className={`nav-btn ${activeSection === "orders" ? "active" : ""}`}
          onClick={() => scrollToSection(ordersRef)}
        >
          <FaShoppingCart /> Buyurtmalar
        </button>
        <button
          className={`nav-btn ${activeSection === "menu" ? "active" : ""}`}
          onClick={() => scrollToSection(menuRef)}
        >
          <FaBook /> Menyu
        </button>
      </nav>

      <div className="tables-orders-container">
        <section className="tables-section" id="tables" ref={tablesRef}>
          <div className="section-header">
            <h2>
              <FaTable /> Stollar
              <span className="section-badge">{tables.length} jami</span>
            </h2>
            <button
              className="toggle-btn"
              onClick={() => setIsTablesOpen((s) => !s)}
            >
              {isTablesOpen ? <FaChevronUp /> : <FaChevronDown />}
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
                  <span className="order-count">{table.orders.length} buyurtma</span>
                )}
                {table.waiter && (
                  <div className="waiter-info">
                    <FaUserTie /> {table.waiter}
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

        <section className="orders-section" id="orders" ref={ordersRef}>
          {selectedTable ? (
            <>
              <div className="section-header">
                <h2>
                  <FaShoppingCart /> {selectedTable.name} Buyurtmalari
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
              <FaTh />
              <p>Iltimos, stolni tanlang</p>
              <small>Yuqoridagi ro'yxatdan istalgan stolni bosing</small>
            </div>
          )}
        </section>
      </div>

      <section className="menu-section" id="menu" ref={menuRef}>
        <div className="section-header">
          <h2>
            <FaBook /> Menyu
            <span>{filteredMenu.length} ta element</span>
          </h2>
          <div className="menu-controls">
            <div className="search-bar" ref={searchRef}>
              <input
                type="text"
                placeholder="Ovqat qidirish... (/)"
                value={searchQuery}
                onChange={handleSearchChange}
                ref={searchInputRef}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              />
              <FiSearch className="search-icon" />
              {showSuggestions && (
                <ul className="suggestions-list">
                  {suggestionItems.map((item, index) => (
                    <li
                      key={item.id}
                      onClick={() => handleSuggestionClick(item)}
                      className={index === highlightedIndex ? "highlighted" : ""}
                    >
                      {item.image && (
                        <img src={item.image} alt={item.name} className="suggestion-image" />
                      )}
                      <div className="suggestion-details">
                        <span className="suggestion-name">
                          {item.name} ({item.category})
                        </span>
                        <span className="suggestion-price">{formatPrice(item.price)}</span>
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
                className="form-input"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "barcha" ? "Barcha kategoriyalar" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredMenu.length === 0 ? (
          <div className="empty-state">
            <FaBoxOpen />
            <p>Menyu elementlari topilmadi</p>
          </div>
        ) : (
          <>
            {filteredMenu.some((item) => item.isBestSeller) && (
              <div className="menu-subsection">
                <h3>
                  <FaStar /> Mashhur taomlar
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
                <FaList /> Barcha elementlar
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

      <div className="fab-container">
        <button className="main-fab">
          <FaPlus />
        </button>
        <div className="fab-actions">
          <button
            className="fab-action-btn"
            onClick={() => setShowMessageModal(true)}
          >
            <FaComment /> Xabar yuborish
          </button>
          <button
            className="fab-action-btn"
            onClick={() => scrollToSection(menuRef)}
          >
            <FaBook /> Menyuga o'tish
          </button>
          <button
            className="fab-action-btn"
            onClick={() => setIsTablesOpen((s) => !s)}
          >
            {isTablesOpen ? <FaChevronUp /> : <FaChevronDown />}
            Stollarni {isTablesOpen ? "yopish" : "ochish"}
          </button>
        </div>
      </div>

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