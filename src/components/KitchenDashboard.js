// src/components/KitchenDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  FaUtensils,
  FaFire,
  FaCheckCircle,
  FaClock,
  FaPlay,
  FaHistory,
  FaTrash,
  FaEye,
  FaTable,
  FaUserTie,
  FaMoneyBillWave,
  FaSpinner,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import './KitchenDashboard.css';

const KitchenDashboard = () => {
  const { 
    kitchenOrders, 
    ordersHistory, 
    markOrderAsReady,
    completeOrder,
    confirmPayment,
    generateReceiptPDF
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('preparing');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTable, setFilterTable] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Taymerlar
  const [timers, setTimers] = useState({});

  // Tayyorlanmoqda va Tayyor buyurtmalarni kitchenOrders dan filterlaymiz
  const preparingOrders = kitchenOrders.filter(order => order.status === 'preparing');
  const readyOrders = kitchenOrders.filter(order => order.status === 'ready');

  // Yakunlangan buyurtmalar – ordersHistory dan olamiz (to'langan yoki to'lov kutilayotgan)
  const completedOrders = ordersHistory
    .filter(order => order.status === "To'lov qilindi" || order.status === "To'lov kutilmoqda")
    .slice(0, 50);

  // Taymerlarni yangilash (faqat tayyorlanayotganlar uchun)
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      preparingOrders.forEach(order => {
        if (order.startTime) {
          const startTime = new Date(order.startTime);
          const now = new Date();
          const diffMinutes = Math.round((now - startTime) / 60000);
          newTimers[order.kitchenId] = diffMinutes;
        }
      });
      setTimers(newTimers);
    }, 1000);
    return () => clearInterval(interval);
  }, [preparingOrders]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Filter
  const getFilteredOrders = (orders) => {
    return orders.filter(order => {
      const matchesSearch = 
        (order.tableName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.kitchenId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.waiter || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTable = filterTable === 'all' || order.tableName === filterTable;
      
      return matchesSearch && matchesTable;
    });
  };

  // Unique table names
  const allTableNames = [...new Set([
    ...preparingOrders.map(o => o.tableName),
    ...readyOrders.map(o => o.tableName),
    ...completedOrders.map(o => o.tableName)
  ])].filter(Boolean);

  // Mark as ready
  const handleMarkAsReady = async (order) => {
    if (!order.kitchenId) {
      toast.error('Buyurtma ID topilmadi!');
      return;
    }
    await markOrderAsReady(order.kitchenId);
  };

  // Complete order (payment)
  const handleCompleteOrder = async (order) => {
    if (!order.tableId) {
      toast.error('Stol ID topilmadi!');
      return;
    }
    await completeOrder(order.tableId, true);
  };

  // Show details
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const closeOrderDetails = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  // Statistics
  const totalPreparingTime = preparingOrders.reduce((total, order) => {
    return total + (timers[order.kitchenId] || 0);
  }, 0);
  const avgPreparingTime = preparingOrders.length > 0 
    ? Math.round(totalPreparingTime / preparingOrders.length) 
    : 0;
  const totalRevenue = [...preparingOrders, ...readyOrders, ...completedOrders]
    .reduce((sum, order) => sum + (order.total || 0), 0);

  if (isLoading) {
    return (
      <div className="kd-loading">
        <FaSpinner className="kd-spinner" />
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="kd-dashboard">
      {/* ===== HEADER ===== */}
      <div className="kd-header">
        <div className="kd-header-top">
          <div className="kd-header-title">
            <div className="kd-header-icon-wrap">
              <FaUtensils />
            </div>
            <div>
              <h1>Oshxona Boshqaruvi</h1>
              <p>Buyurtmalarni kuzatish va boshqarish</p>
            </div>
          </div>
          <button className="kd-clear-all-btn" onClick={() => toast.info('Bu funksiya faqat admin uchun')}>
            <FaTrash /> Barchasini tozalash
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="kd-stats-row">
          <div className="kd-stat-card preparing">
            <div className="kd-stat-icon"><FaFire /></div>
            <div className="kd-stat-info">
              <span className="kd-stat-value">{preparingOrders.length}</span>
              <span className="kd-stat-label">Tayyorlanmoqda</span>
            </div>
          </div>
          <div className="kd-stat-card ready">
            <div className="kd-stat-icon"><FaCheckCircle /></div>
            <div className="kd-stat-info">
              <span className="kd-stat-value">{readyOrders.length}</span>
              <span className="kd-stat-label">Tayyor</span>
            </div>
          </div>
          <div className="kd-stat-card completed">
            <div className="kd-stat-icon"><FaHistory /></div>
            <div className="kd-stat-info">
              <span className="kd-stat-value">{completedOrders.length}</span>
              <span className="kd-stat-label">Yakunlangan</span>
            </div>
          </div>
          <div className="kd-stat-card total">
            <div className="kd-stat-icon"><FaUtensils /></div>
            <div className="kd-stat-info">
              <span className="kd-stat-value">{kitchenOrders.length + completedOrders.length}</span>
              <span className="kd-stat-label">Jami</span>
            </div>
          </div>
          <div className="kd-stat-card revenue">
            <div className="kd-stat-icon"><FaMoneyBillWave /></div>
            <div className="kd-stat-info">
              <span className="kd-stat-value">{formatPrice(totalRevenue)}</span>
              <span className="kd-stat-label">Umumiy summa</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEARCH & FILTER ===== */}
      <div className="kd-toolbar">
        <div className="kd-search-wrap">
          <FaSearch className="kd-search-icon" />
          <input
            type="text"
            placeholder="Stol, ID yoki ofitsiant qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="kd-search-input"
          />
          {searchQuery && (
            <button className="kd-search-clear" onClick={() => setSearchQuery('')}>
              <FaTimes />
            </button>
          )}
        </div>
        <select
          value={filterTable}
          onChange={(e) => setFilterTable(e.target.value)}
          className="kd-filter-select"
        >
          <option value="all">Barcha stollar</option>
          {allTableNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* ===== TABS ===== */}
      <div className="kd-tabs">
        <button 
          className={`kd-tab-btn ${activeTab === 'preparing' ? 'active' : ''}`}
          onClick={() => setActiveTab('preparing')}
        >
          <FaFire /> Tayyorlanmoqda
          {preparingOrders.length > 0 && (
            <span className="kd-tab-badge">{preparingOrders.length}</span>
          )}
        </button>
        <button 
          className={`kd-tab-btn ${activeTab === 'ready' ? 'active' : ''}`}
          onClick={() => setActiveTab('ready')}
        >
          <FaCheckCircle /> Tayyor
          {readyOrders.length > 0 && (
            <span className="kd-tab-badge green">{readyOrders.length}</span>
          )}
        </button>
        <button 
          className={`kd-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <FaHistory /> Yakunlangan
          {completedOrders.length > 0 && (
            <span className="kd-tab-badge purple">{completedOrders.length}</span>
          )}
        </button>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="kd-content">
        {/* PREPARING */}
        {activeTab === 'preparing' && (
          <div className="kd-section">
            {getFilteredOrders(preparingOrders).length === 0 ? (
              <div className="kd-empty">
                <div className="kd-empty-icon-wrap"><FaFire /></div>
                <h3>Tayyorlanayotgan buyurtmalar yo'q</h3>
                <p>Yangi buyurtmalar shu yerda ko'rinadi</p>
              </div>
            ) : (
              <div className="kd-orders-grid">
                {getFilteredOrders(preparingOrders).map(order => (
                  <div key={order.kitchenId} className="kd-order-card preparing">
                    <div className="kd-card-header">
                      <div className="kd-card-id-wrap">
                        <span className="kd-card-id">#{order.kitchenId}</span>
                        <span className="kd-card-table"><FaTable /> {order.tableName}</span>
                      </div>
                      <div className="kd-card-timer">
                        <FaClock /> 
                        {timers[order.kitchenId] !== undefined 
                          ? `${timers[order.kitchenId]} daq` 
                          : 'Kutilmoqda...'}
                      </div>
                    </div>
                    <div className="kd-card-body">
                      <div className="kd-card-items">
                        {order.items?.slice(0, 4).map((item, index) => (
                          <div key={index} className="kd-card-item">
                            <span className="kd-item-name">{item.name}</span>
                            <span className="kd-item-qty">×{item.quantity}</span>
                          </div>
                        ))}
                        {order.items?.length > 4 && (
                          <div className="kd-card-more">+{order.items.length - 4} ta boshqa</div>
                        )}
                      </div>
                      <div className="kd-card-info">
                        <span><FaUserTie /> {order.waiter || '—'}</span>
                        <span>{new Date(order.date).toLocaleTimeString('uz-UZ')}</span>
                      </div>
                    </div>
                    <div className="kd-card-footer">
                      <button className="kd-btn-ready" onClick={() => handleMarkAsReady(order)}>
                        <FaCheckCircle /> Tayyor
                      </button>
                      <button className="kd-btn-detail" onClick={() => showOrderDetails(order)}>
                        <FaEye />
                      </button>
                    </div>
                    <div className="kd-card-status active">🔥 Tayyorlanmoqda</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* READY */}
        {activeTab === 'ready' && (
          <div className="kd-section">
            {getFilteredOrders(readyOrders).length === 0 ? (
              <div className="kd-empty">
                <div className="kd-empty-icon-wrap green"><FaCheckCircle /></div>
                <h3>Tayyor buyurtmalar yo'q</h3>
                <p>Tayyor bo'lgan buyurtmalar shu yerda</p>
              </div>
            ) : (
              <div className="kd-orders-grid">
                {getFilteredOrders(readyOrders).map(order => (
                  <div key={order.kitchenId} className="kd-order-card ready">
                    <div className="kd-card-header">
                      <div className="kd-card-id-wrap">
                        <span className="kd-card-id">#{order.kitchenId}</span>
                        <span className="kd-card-table"><FaTable /> {order.tableName}</span>
                      </div>
                      <div className="kd-card-prep-time">
                        <FaClock /> {order.preparationTime || 0} daq
                      </div>
                    </div>
                    <div className="kd-card-body">
                      <div className="kd-card-items">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="kd-card-item">
                            <span className="kd-item-name">{item.name}</span>
                            <span className="kd-item-qty">×{item.quantity}</span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="kd-card-more">+{order.items.length - 3} ta boshqa</div>
                        )}
                      </div>
                      <div className="kd-card-info">
                        <span>Tayyor: {new Date(order.readyTime).toLocaleTimeString('uz-UZ')}</span>
                      </div>
                    </div>
                    <div className="kd-card-footer">
                      <button className="kd-btn-complete" onClick={() => handleCompleteOrder(order)}>
                        <FaHistory /> Yakunlash
                      </button>
                      <button className="kd-btn-detail" onClick={() => showOrderDetails(order)}>
                        <FaEye />
                      </button>
                    </div>
                    <div className="kd-card-status ready-status">✅ Tayyor</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMPLETED */}
        {activeTab === 'completed' && (
          <div className="kd-section">
            {getFilteredOrders(completedOrders).length === 0 ? (
              <div className="kd-empty">
                <div className="kd-empty-icon-wrap purple"><FaHistory /></div>
                <h3>Yakunlangan buyurtmalar yo'q</h3>
                <p>Yakunlanganlar tarixi shu yerda</p>
              </div>
            ) : (
              <div className="kd-orders-grid">
                {getFilteredOrders(completedOrders).slice(0, 30).map(order => (
                  <div key={order.id} className="kd-order-card completed">
                    <div className="kd-card-header">
                      <div className="kd-card-id-wrap">
                        <span className="kd-card-id">#{order.id.toString().slice(-6)}</span>
                        <span className="kd-card-table"><FaTable /> {order.tableName}</span>
                      </div>
                      <div className="kd-card-prep-time">
                        <FaClock /> {new Date(order.date).toLocaleTimeString('uz-UZ')}
                      </div>
                    </div>
                    <div className="kd-card-body">
                      <div className="kd-card-items">
                        {order.items?.slice(0, 2).map((item, index) => (
                          <div key={index} className="kd-card-item">
                            <span className="kd-item-name">{item.name}</span>
                            <span className="kd-item-qty">×{item.quantity}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div className="kd-card-more">+{order.items.length - 2} ta boshqa</div>
                        )}
                      </div>
                      <div className="kd-card-info">
                        <span>Status: {order.status}</span>
                      </div>
                      <div className="kd-card-total">
                        Jami: {formatPrice(order.total)}
                      </div>
                    </div>
                    <div className="kd-card-footer">
                      <button className="kd-btn-detail" onClick={() => showOrderDetails(order)}>
                        <FaEye /> Batafsil
                      </button>
                      <button className="kd-btn-print" onClick={() => generateReceiptPDF(order)}>
                        🖨️
                      </button>
                    </div>
                    <div className="kd-card-status completed-status">📋 Yakunlangan</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== ORDER DETAIL MODAL ===== */}
      {isDetailModalOpen && selectedOrder && (
        <div className="kd-modal-overlay" onClick={closeOrderDetails}>
          <div className="kd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h3>Buyurtma #{selectedOrder.kitchenId || selectedOrder.id?.toString().slice(-6)}</h3>
              <button className="kd-modal-close" onClick={closeOrderDetails}>✕</button>
            </div>
            <div className="kd-modal-body">
              <div><strong>Stol:</strong> {selectedOrder.tableName}</div>
              <div><strong>Ofitsiant:</strong> {selectedOrder.waiter || '—'}</div>
              <div><strong>Vaqt:</strong> {new Date(selectedOrder.date).toLocaleString('uz-UZ')}</div>
              <div><strong>Status:</strong> {selectedOrder.status}</div>
              <hr />
              <div className="kd-modal-items">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="kd-modal-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="kd-modal-total">
                  <strong>Jami:</strong> {formatPrice(selectedOrder.total)}
                </div>
              </div>
            </div>
            <div className="kd-modal-footer">
              <button className="kd-modal-btn-close" onClick={closeOrderDetails}>Yopish</button>
              {selectedOrder.status === 'preparing' && (
                <button className="kd-modal-btn-ready" onClick={() => { handleMarkAsReady(selectedOrder); closeOrderDetails(); }}>
                  ✅ Tayyor
                </button>
              )}
              {selectedOrder.status === 'ready' && (
                <button className="kd-modal-btn-complete" onClick={() => { handleCompleteOrder(selectedOrder); closeOrderDetails(); }}>
                  📋 Yakunlash
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;