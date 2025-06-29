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
  FaPaperPlane,
  FaComment,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdAccessTime, MdPerson } from "react-icons/md";
import jsPDF from "jspdf";
import logo from "../assets/logo1.png";
import "./Home.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const PaymentModal = ({ tableId, onClose, sendToTelegram }) => {
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
    doc.text("SODIQJON RESTORANI", pageWidth / 2, y, { align: "center" });
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Navoiy ko'chasi 123, Toshkent, O'zbekiston", pageWidth / 2, y, {
      align: "center",
    });
    y += 5;
    doc.text("Telefon: +998 90 123 45 67", pageWidth / 2, y, {
      align: "center",
    });
    y += 5;
    doc.text("STIR: 123456789", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
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
    });

    y += 10;
    doc.text("JAMI:", 140, y);
    doc.text(formatPrice(total), 170, y);
    y += 15;

    doc.text(`To'lov turi: Naqd`, 20, y);
    y += 7;
    doc.text(`Chek raqami: #${Math.floor(Math.random() * 10000)}`, 20, y);
    y += 7;
    doc.text(`Sana: ${new Date().toLocaleString("uz-UZ")}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.text("RAHMAT! YANA KELING!", pageWidth / 2, y, { align: "center" });
    y += 7;

    doc.setFontSize(9);
    doc.text("Shikoyatlar uchun: +998 97 463 44 55", pageWidth / 2, y, {
      align: "center",
    });

    doc.save(`Chek_${selectedTable.name}_${new Date().toISOString()}.pdf`);
    onClose();
  };

  return (
    <div className="payment-modal">
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
              <span>Sana: ${new Date().toLocaleString("uz-UZ")}</span>
            </div>
          </div>

          <div className="receipt-items">
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
            <span>Jami:</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div className="receipt-footer">
            <div className="thank-you">RAHMAT! YANA KELING!</div>
            <div className="contact-info">Telefon: +998 90 123 45 67</div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={saveAsPDF}>
            <FaPrint /> Chekni chop etish
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
      </div>
    </div>
  );
};

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
      alert("Xabar matni bo'sh bo'lmasligi kerak!");
      return;
    }

    const selectedRecipient = recipientOptions.find(
      (opt) => opt.value === recipient
    );
    const formattedMessage = `
<b>📩 Operator tomonidan xabar</b>
📝 Xabar: ${message}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
👤 Yuboruvchi: Admin
    `;

    setIsSending(true);
    try {
      await sendTelegramMessage(formattedMessage, selectedRecipient.chatId);
      alert("Xabar muvaffaqiyatli yuborildi!");
      setMessage("");
      onClose();
    } catch (error) {
      alert("Xabar yuborishda xato: " + error.message);
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

function Home() {
  const {
    tables,
    selectTable,
    selectedTableId,
    menu,
    addToOrder,
    sendTelegramMessage,
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

  // Scroll funksiyasi
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("uz-UZ"));
    }, 1000);
    return () => clearInterval(timer);
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
  };

  const handleSuggestionClick = (item) => {
    setSearchQuery(item.name);
    setShowSuggestions(false);
    if (!selectedTableId) {
      alert("Iltimos, avval stolni tanlang!");
      return;
    }
    addToOrder({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
  };

  const sendToTelegram = async (table, orders) => {
    const message = `
🛒 Yangi buyurtma: ${table.name}
📅 Sana: ${new Date().toLocaleString("uz-UZ")}
📋 Buyurtmalar:
${orders
  .map(
    (order) =>
      `${order.name} - ${order.quantity} x ${formatPrice(order.price)}`
  )
  .join("\n")}
💵 Jami: ${formatPrice(
      orders.reduce((sum, order) => sum + order.price * order.quantity, 0)
    )}
`;

    try {
      await sendTelegramMessage(message, "-4646692596");
      alert("Buyurtma Telegramga yuborildi!");
    } catch (error) {
      alert("Xatolik yuz berdi: " + error.message);
    }
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <h1>Restoran POS Tizimi</h1>
        <div className="header-info">
          <span className="time-display">
            <MdAccessTime /> {currentTime}
          </span>
          <span className="user-info">
            <MdPerson /> Operator: Admin
          </span>
        </div>
      </header>

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
            <button className="toggle-btn" onClick={() => setIsTablesOpen(!isTablesOpen)}>
              {isTablesOpen ? <FaChevronUp /> : <FaChevronDown />}
              {isTablesOpen ? "Yopish" : "Ochish"}
            </button>
          </div>
          <div className={`tables-grid ${isTablesOpen ? "open" : "closed"}`}>
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => selectTable(table.id)}
                className={`table-card ${
                  selectedTableId === table.id ? "active" : ""
                } ${table.orders.length > 0 ? "occupied" : "available"}`}
              >
                <div className="table-number">{table.name}</div>
                {table.orders.length > 0 && (
                  <span className="order-count">
                    {table.orders.length} buyurtma
                  </span>
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
              <FiSearch />
              <input
                type="text"
                placeholder="Ovqat qidirish... (/)"
                value={searchQuery}
                onChange={handleSearchChange}
                ref={searchInputRef}
              />
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
            onClick={() => setIsTablesOpen(!isTablesOpen)}
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

export default Home;