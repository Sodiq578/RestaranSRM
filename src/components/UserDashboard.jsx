// src/components/UserDashboard.jsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { 
  FaUser, FaEnvelope, FaUserTag, FaCalendarAlt, 
  FaClipboardList, FaMoneyBillWave, FaChair, 
  FaBell, FaSignOutAlt, FaEdit, FaLock,
  FaClock, FaStar, FaArrowRight, FaHistory,
  FaCrown, FaUtensils, FaCheckCircle, FaTimesCircle,
  FaStore, FaPhone, FaMapMarkerAlt, FaGlobe
} from "react-icons/fa";
import { MdAccessTime, MdPerson } from "react-icons/md";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { 
    user, 
    tables, 
    ordersHistory, 
    kitchenOrders,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    sendSystemNotification
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    return user || JSON.parse(localStorage.getItem("currentUser") || "{}");
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: currentUser.name || "",
    email: currentUser.email || "",
    phone: currentUser.phone || "",
    address: currentUser.address || "",
    profilePicture: currentUser.profilePicture || ""
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Statistika
  const today = new Date().toLocaleDateString("uz-UZ");
  const todayOrders = ordersHistory.filter(
    (order) => new Date(order.date).toLocaleDateString("uz-UZ") === today
  );
  
  const totalOrders = todayOrders.length;
  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const activeTables = tables.filter(t => t.status !== "Bo'sh").length;
  const totalTables = tables.length;
  const pendingKitchenOrders = kitchenOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  // Unread notifications count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // So'nggi buyurtmalar
  const recentOrders = [...ordersHistory]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name: editData.name,
      email: editData.email,
      phone: editData.phone,
      address: editData.address,
      profilePicture: editData.profilePicture
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setShowEditModal(false);
    sendSystemNotification("✅ Profil yangilandi", "Ma'lumotlaringiz muvaffaqiyatli yangilandi!", "success");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotificationClick = (id) => {
    markNotificationAsRead(id);
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <FaCrown className="role-icon admin" />,
      waiter: <FaUtensils className="role-icon waiter" />,
      kitchen: <FaStore className="role-icon kitchen" />,
      bar: <FaGlobe className="role-icon bar" />
    };
    return icons[role] || <FaUser className="role-icon" />;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "#4f46e5",
      waiter: "#22c55e",
      kitchen: "#f59e0b",
      bar: "#8b5cf6"
    };
    return colors[role] || "#6b7280";
  };

  const getStatusBadge = (status) => {
    const map = {
      "Yangi": { color: "#3b82f6", bg: "#dbeafe", icon: <FaClock /> },
      "Tayyor": { color: "#22c55e", bg: "#dcfce7", icon: <FaCheckCircle /> },
      "To'lov kutilmoqda": { color: "#f59e0b", bg: "#fef3c7", icon: <FaClock /> },
      "To'lov qilindi": { color: "#22c55e", bg: "#dcfce7", icon: <FaCheckCircle /> },
      "Qarz": { color: "#dc2626", bg: "#fee2e2", icon: <FaTimesCircle /> },
    };
    return map[status] || { color: "#6b7280", bg: "#f3f4f6", icon: <FaClock /> };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="ud-wrapper">
      {/* ===== HEADER ===== */}
      <div className="ud-header">
        <div className="ud-header-left">
          <h1 className="ud-title">👤 Mening profilim</h1>
          <span className="ud-role" style={{ backgroundColor: getRoleColor(currentUser.role) }}>
            {getRoleIcon(currentUser.role)}
            {currentUser.role === "admin" ? "Admin" :
             currentUser.role === "waiter" ? "Ofitsiant" :
             currentUser.role === "kitchen" ? "Oshxona" :
             currentUser.role === "bar" ? "Bar" : "Foydalanuvchi"}
          </span>
        </div>
        <div className="ud-header-right">
          <button 
            className="ud-notif-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell />
            {unreadCount > 0 && <span className="ud-notif-badge">{unreadCount}</span>}
          </button>
          <button className="ud-edit-btn" onClick={() => setShowEditModal(true)}>
            <FaEdit /> Tahrirlash
          </button>
          <button className="ud-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Chiqish
          </button>
        </div>
      </div>

      {/* ===== NOTIFICATION PANEL ===== */}
      {showNotifications && (
        <div className="ud-notif-panel">
          <div className="ud-notif-header">
            <h4>🔔 Bildirishnomalar</h4>
            {notifications.length > 0 && (
              <button onClick={clearNotifications} className="ud-notif-clear">
                Barchasini o'qish
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="ud-notif-empty">Hech qanday bildirishnoma yo'q</p>
          ) : (
            <div className="ud-notif-list">
              {notifications.slice(0, 10).map((n) => (
                <div 
                  key={n.id} 
                  className={`ud-notif-item ${n.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(n.id)}
                >
                  <span className="ud-notif-icon">
                    {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : '🔔'}
                  </span>
                  <div className="ud-notif-content">
                    <p>{n.message}</p>
                    <small>{new Date(n.createdAt).toLocaleString('uz-UZ')}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== PROFILE CARD ===== */}
      <div className="ud-card ud-profile-card">
        <div className="ud-profile-avatar">
          {currentUser.profilePicture ? (
            <img src={currentUser.profilePicture} alt="Profile" />
          ) : (
            <div className="ud-avatar-placeholder">
              {currentUser.name?.[0] || "U"}
            </div>
          )}
          <div className="ud-profile-status" style={{ backgroundColor: getRoleColor(currentUser.role) }} />
        </div>
        <div className="ud-profile-info">
          <h2>{currentUser.name || "Foydalanuvchi"}</h2>
          <p className="ud-profile-email"><FaEnvelope /> {currentUser.email || "Email kiritilmagan"}</p>
          {currentUser.phone && <p className="ud-profile-phone"><FaPhone /> {currentUser.phone}</p>}
          {currentUser.address && <p className="ud-profile-address"><FaMapMarkerAlt /> {currentUser.address}</p>}
          <p className="ud-profile-joined">
            <FaCalendarAlt /> Qo'shilgan: {new Date().toLocaleDateString('uz-UZ')}
          </p>
        </div>
      </div>

      {/* ===== STATISTICS ===== */}
      <div className="ud-stats">
        <div className="ud-stat revenue">
          <div className="ud-stat-icon"><FaMoneyBillWave /></div>
          <div className="ud-stat-info">
            <span className="ud-stat-label">Bugungi tushum</span>
            <span className="ud-stat-value">{formatPrice(totalRevenue)}</span>
          </div>
        </div>
        <div className="ud-stat orders">
          <div className="ud-stat-icon"><FaClipboardList /></div>
          <div className="ud-stat-info">
            <span className="ud-stat-label">Bugungi buyurtmalar</span>
            <span className="ud-stat-value">{totalOrders} ta</span>
          </div>
        </div>
        <div className="ud-stat tables">
          <div className="ud-stat-icon"><FaChair /></div>
          <div className="ud-stat-info">
            <span className="ud-stat-label">Faol stollar</span>
            <span className="ud-stat-value">{activeTables}/{totalTables}</span>
          </div>
        </div>
        <div className="ud-stat kitchen">
          <div className="ud-stat-icon"><FaUtensils /></div>
          <div className="ud-stat-info">
            <span className="ud-stat-label">Oshxonada</span>
            <span className="ud-stat-value">{pendingKitchenOrders} ta</span>
          </div>
        </div>
      </div>

      {/* ===== RECENT ORDERS ===== */}
      <div className="ud-section">
        <div className="ud-section-header">
          <h3><FaHistory /> So'nggi buyurtmalar</h3>
          <button className="ud-section-more" onClick={() => navigate('/orders')}>
            Barchasi <FaArrowRight />
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <p className="ud-empty">Hozircha buyurtmalar mavjud emas</p>
        ) : (
          <div className="ud-order-list">
            {recentOrders.map((order, index) => {
              const status = getStatusBadge(order.status);
              return (
                <div key={index} className="ud-order-item">
                  <div className="ud-order-left">
                    <span className="ud-order-table">{order.tableName}</span>
                    <span className="ud-order-items">
                      {order.items.map(item => item.name).join(", ")}
                    </span>
                  </div>
                  <div className="ud-order-right">
                    <span className="ud-order-total">{formatPrice(order.total)}</span>
                    <span className="ud-order-status" style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.icon} {order.status}
                    </span>
                    <span className="ud-order-time">
                      <MdAccessTime /> {new Date(order.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="ud-section ud-quick-actions">
        <h3>⚡ Tezkor amallar</h3>
        <div className="ud-actions-grid">
          <button className="ud-action" onClick={() => navigate('/')}>
            <FaChair /> Stollar
          </button>
          <button className="ud-action" onClick={() => navigate('/orders')}>
            <FaHistory /> Buyurtmalar
          </button>
          <button className="ud-action" onClick={() => navigate('/kitchen')}>
            <FaUtensils /> Oshxona
          </button>
          <button className="ud-action" onClick={() => setShowEditModal(true)}>
            <FaEdit /> Profil
          </button>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && (
        <div className="ud-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="ud-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ud-modal-header">
              <h3><FaEdit /> Profilni tahrirlash</h3>
              <button className="ud-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div className="ud-form-group">
                <label>Ism</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  required
                />
              </div>
              <div className="ud-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="ud-form-group">
                <label>Telefon</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                />
              </div>
              <div className="ud-form-group">
                <label>Manzil</label>
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  placeholder="Manzilingiz"
                />
              </div>
              <div className="ud-form-group">
                <label>Profil rasmi</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {editData.profilePicture && (
                  <img src={editData.profilePicture} alt="Preview" className="ud-preview" />
                )}
              </div>
              <div className="ud-modal-actions">
                <button type="button" className="ud-btn-cancel" onClick={() => setShowEditModal(false)}>
                  Bekor qilish
                </button>
                <button type="submit" className="ud-btn-save">
                  <FaEdit /> Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;