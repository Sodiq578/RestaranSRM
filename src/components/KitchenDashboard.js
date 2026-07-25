import React, { useState, useEffect } from 'react';
import {
  FaUtensils,
  FaFire,
  FaCheckCircle,
  FaClock,
  FaPlay,
  FaStop,
  FaHistory,
  FaTrash,
  FaEye,
  FaHourglassHalf,
  FaTable,
  FaUserTie,
  FaMoneyBillWave,
  FaSpinner,
  FaRedo,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import OrderDetailModal from '../components/OrderDetailModal';
import { toast } from 'react-toastify';
import './KitchenDashboard.css';

const KitchenDashboard = () => {
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('preparing');
  const [timers, setTimers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTable, setFilterTable] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Buyurtmalarni yuklash
  useEffect(() => {
    const loadOrders = () => {
      try {
        const savedPreparing = localStorage.getItem('kitchenPreparingOrders');
        const savedReady = localStorage.getItem('kitchenReadyOrders');
        const savedCompleted = localStorage.getItem('kitchenCompletedOrders');

        setPreparingOrders(savedPreparing ? JSON.parse(savedPreparing) : []);
        setReadyOrders(savedReady ? JSON.parse(savedReady) : []);
        setCompletedOrders(savedCompleted ? JSON.parse(savedCompleted) : []);
      } catch (error) {
        console.error('Buyurtmalarni yuklashda xatolik:', error);
        toast.error('Buyurtmalarni yuklashda xatolik!');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
    
    // Har 3 sekundda yangilab turish
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // Taymerlarni yangilash
  useEffect(() => {
    const timerInterval = setInterval(() => {
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

    return () => clearInterval(timerInterval);
  }, [preparingOrders]);

  // Status tarixini qo'shish
  const addStatusHistory = (order, newStatus) => {
    const statusHistory = order.statusHistory || [];
    statusHistory.push({
      status: newStatus,
      time: new Date().toISOString()
    });
    return { ...order, statusHistory };
  };

  // Tayyorlashni boshlash
  const startPreparation = (order) => {
    const updatedOrder = addStatusHistory(order, 'preparing');
    const finalOrder = {
      ...updatedOrder,
      status: 'preparing',
      startTime: new Date().toISOString()
    };

    const updatedPreparing = preparingOrders.map(o => 
      o.kitchenId === order.kitchenId ? finalOrder : o
    );

    setPreparingOrders(updatedPreparing);
    localStorage.setItem('kitchenPreparingOrders', JSON.stringify(updatedPreparing));
    toast.success('🔥 Tayyorlash boshlandi!');
  };

  // Tayyor bo'ldi
  const markAsReady = (order) => {
    const readyTime = new Date();
    const startTime = new Date(order.startTime);
    const preparationTime = Math.round((readyTime - startTime) / 60000);

    const updatedOrder = addStatusHistory(order, 'ready');
    const completedOrder = {
      ...updatedOrder,
      status: 'ready',
      readyTime: readyTime.toISOString(),
      preparationTime: preparationTime
    };

    // Preparing dan o'chirish
    const updatedPreparing = preparingOrders.filter(o => o.kitchenId !== order.kitchenId);
    setPreparingOrders(updatedPreparing);
    localStorage.setItem('kitchenPreparingOrders', JSON.stringify(updatedPreparing));

    // Ready ga qo'shish
    const updatedReady = [...readyOrders, completedOrder];
    setReadyOrders(updatedReady);
    localStorage.setItem('kitchenReadyOrders', JSON.stringify(updatedReady));
    
    toast.success(`✅ Tayyor! (${preparationTime} daqiqa)`);
  };

  // Buyurtmani yakunlash
  const completeOrder = (order) => {
    const updatedOrder = addStatusHistory(order, 'completed');
    const finalOrder = {
      ...updatedOrder,
      status: 'completed',
      completedTime: new Date().toISOString()
    };

    // Ready dan o'chirish
    const updatedReady = readyOrders.filter(o => o.kitchenId !== order.kitchenId);
    setReadyOrders(updatedReady);
    localStorage.setItem('kitchenReadyOrders', JSON.stringify(updatedReady));

    // Completed ga qo'shish
    const updatedCompleted = [...completedOrders, finalOrder];
    setCompletedOrders(updatedCompleted);
    localStorage.setItem('kitchenCompletedOrders', JSON.stringify(updatedCompleted));
    
    toast.success('📋 Buyurtma yakunlandi!');
  };

  // Buyurtmani o'chirish
  const deleteOrder = (order, listType) => {
    if (!window.confirm('Buyurtmani o\'chirishni tasdiqlaysizmi?')) return;

    if (listType === 'preparing') {
      const updatedOrders = preparingOrders.filter(o => o.kitchenId !== order.kitchenId);
      setPreparingOrders(updatedOrders);
      localStorage.setItem('kitchenPreparingOrders', JSON.stringify(updatedOrders));
    } else if (listType === 'ready') {
      const updatedOrders = readyOrders.filter(o => o.kitchenId !== order.kitchenId);
      setReadyOrders(updatedOrders);
      localStorage.setItem('kitchenReadyOrders', JSON.stringify(updatedOrders));
    } else if (listType === 'completed') {
      const updatedOrders = completedOrders.filter(o => o.kitchenId !== order.kitchenId);
      setCompletedOrders(updatedOrders);
      localStorage.setItem('kitchenCompletedOrders', JSON.stringify(updatedOrders));
    }
    
    toast.success('🗑️ Buyurtma o\'chirildi!');
  };

  // Barcha buyurtmalarni tozalash
  const clearAllOrders = () => {
    if (window.confirm('Barcha buyurtmalarni o\'chirishni tasdiqlaysizmi?')) {
      setPreparingOrders([]);
      setReadyOrders([]);
      setCompletedOrders([]);
      localStorage.removeItem('kitchenPreparingOrders');
      localStorage.removeItem('kitchenReadyOrders');
      localStorage.removeItem('kitchenCompletedOrders');
      toast.success('🗑️ Barcha buyurtmalar tozalandi!');
    }
  };

  // Status o'zgartirish (modaldan)
  const handleStatusChange = (order, newStatus) => {
    if (newStatus === 'preparing') {
      startPreparation(order);
    } else if (newStatus === 'ready') {
      markAsReady(order);
    } else if (newStatus === 'completed') {
      completeOrder(order);
    }
  };

  // Order detail modal
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const closeOrderDetails = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Filter orders
  const getFilteredOrders = (orders) => {
    return orders.filter(order => {
      const matchesSearch = 
        order.tableName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.kitchenId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.waiter?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTable = filterTable === 'all' || order.tableName === filterTable;
      
      return matchesSearch && matchesTable;
    });
  };

  // Unique table names for filter
  const allTableNames = [...new Set([
    ...preparingOrders.map(o => o.tableName),
    ...readyOrders.map(o => o.tableName),
    ...completedOrders.map(o => o.tableName)
  ])].filter(Boolean);

  // Statistics
  const totalOrders = preparingOrders.length + readyOrders.length + completedOrders.length;
  const totalPreparingTime = preparingOrders.reduce((total, order) => {
    return total + (timers[order.kitchenId] || 0);
  }, 0);
  const avgPreparingTime = preparingOrders.length > 0 
    ? Math.round(totalPreparingTime / preparingOrders.length) 
    : 0;
  const totalRevenue = [...preparingOrders, ...readyOrders, ...completedOrders]
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

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
          <button className="kd-clear-all-btn" onClick={clearAllOrders}>
            <FaTrash /> Barchasini tozalash
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="kd-stats-row">
          <div className="kd-stat-card preparing">
            <div className="kd-stat-icon">
              <FaFire />
            </div>
            <div className="kd-stat-info">
              <span className="kd-stat-value">{preparingOrders.length}</span>
              <span className="kd-stat-label">Tayyorlanmoqda</span>
            </div>
          </div>
          <div className="kd-stat-card ready">
            <div className="kd-stat-icon">
              <FaCheckCircle />
            </div>
            <div className="kd-stat-info">
              <span className="kd-stat-value">{readyOrders.length}</span>
              <span className="kd-stat-label">Tayyor</span>
            </div>
          </div>
          <div className="kd-stat-card completed">
            <div className="kd-stat-icon">
              <FaHistory />
            </div>
            <div className="kd-stat-info">
              <span className="kd-stat-value">{completedOrders.length}</span>
              <span className="kd-stat-label">Yakunlangan</span>
            </div>
          </div>
          <div className="kd-stat-card total">
            <div className="kd-stat-icon">
              <FaUtensils />
            </div>
            <div className="kd-stat-info">
              <span className="kd-stat-value">{totalOrders}</span>
              <span className="kd-stat-label">Jami</span>
            </div>
          </div>
          <div className="kd-stat-card revenue">
            <div className="kd-stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="kd-stat-info">
              <span className="kd-stat-value">{formatPrice(totalRevenue)}</span>
              <span className="kd-stat-label">Umumiy summa</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEARCH & FILTER BAR ===== */}
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
        {/* ===== PREPARING TAB ===== */}
        {activeTab === 'preparing' && (
          <div className="kd-section">
            {getFilteredOrders(preparingOrders).length === 0 ? (
              <div className="kd-empty">
                <div className="kd-empty-icon-wrap">
                  <FaFire />
                </div>
                <h3>Tayyorlanayotgan buyurtmalar yo'q</h3>
                <p>Yangi buyurtmalar shu yerda ko'rinadi</p>
              </div>
            ) : (
              <div className="kd-orders-grid">
                {getFilteredOrders(preparingOrders).map(order => (
                  <div key={order.kitchenId} className="kd-order-card preparing">
                    {/* Card Header */}
                    <div className="kd-card-header">
                      <div className="kd-card-id-wrap">
                        <span className="kd-card-id">#{order.kitchenId}</span>
                        <span className="kd-card-table">
                          <FaTable /> {order.tableName}
                        </span>
                      </div>
                      <div className="kd-card-timer">
                        <FaClock /> 
                        {timers[order.kitchenId] !== undefined 
                          ? `${timers[order.kitchenId]} daq` 
                          : 'Kutilmoqda...'}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="kd-card-body">
                      <div className="kd-card-items">
                        {order.items?.slice(0, 4).map((item, index) => (
                          <div key={index} className="kd-card-item">
                            <span className="kd-item-name">{item.name}</span>
                            <span className="kd-item-qty">×{item.quantity}</span>
                            {item.notes && (
                              <span className="kd-item-notes" title={item.notes}>
                                ({item.notes.length > 15 ? item.notes.slice(0, 15) + '...' : item.notes})
                              </span>
                            )}
                          </div>
                        ))}
                        {order.items?.length > 4 && (
                          <div className="kd-card-more">
                            +{order.items.length - 4} ta boshqa
                          </div>
                        )}
                      </div>
                      
                      <div className="kd-card-info">
                        <span><FaUserTie /> {order.waiter || '—'}</span>
                        <span>{new Date(order.date).toLocaleTimeString('uz-UZ')}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="kd-card-footer">
                      {!order.startTime ? (
                        <button 
                          className="kd-btn-start"
                          onClick={() => startPreparation(order)}
                        >
                          <FaPlay /> Boshlash
                        </button>
                      ) : (
                        <button 
                          className="kd-btn-ready"
                          onClick={() => markAsReady(order)}
                        >
                          <FaCheckCircle /> Tayyor
                        </button>
                      )}
                      <button 
                        className="kd-btn-detail"
                        onClick={() => showOrderDetails(order)}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="kd-btn-delete"
                        onClick={() => deleteOrder(order, 'preparing')}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {/* Status bar */}
                    <div className={`kd-card-status ${order.startTime ? 'active' : 'pending'}`}>
                      {order.startTime ? '🔥 Tayyorlanmoqda' : '⏳ Kutishda'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== READY TAB ===== */}
        {activeTab === 'ready' && (
          <div className="kd-section">
            {getFilteredOrders(readyOrders).length === 0 ? (
              <div className="kd-empty">
                <div className="kd-empty-icon-wrap green">
                  <FaCheckCircle />
                </div>
                <h3>Tayyor buyurtmalar yo'q</h3>
                <p>Tayyor bo'lgan buyurtmalar shu yerda ko'rinadi</p>
              </div>
            ) : (
              <div className="kd-orders-grid">
                {getFilteredOrders(readyOrders).map(order => (
                  <div key={order.kitchenId} className="kd-order-card ready">
                    <div className="kd-card-header">
                      <div className="kd-card-id-wrap">
                        <span className="kd-card-id">#{order.kitchenId}</span>
                        <span className="kd-card-table">
                          <FaTable /> {order.tableName}
                        </span>
                      </div>
                      <div className="kd-card-prep-time">
                        <FaClock /> {order.preparationTime} daq
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
                          <div className="kd-card-more">
                            +{order.items.length - 3} ta boshqa
                          </div>
                        )}
                      </div>
                      
                      <div className="kd-card-info">
                        <span>Tayyor: {new Date(order.readyTime).toLocaleTimeString('uz-UZ')}</span>
                      </div>
                    </div>

                    <div className="kd-card-footer">
                      <button 
                        className="kd-btn-complete"
                        onClick={() => completeOrder(order)}
                      >
                        <FaHistory /> Yakunlash
                      </button>
                      <button 
                        className="kd-btn-detail"
                        onClick={() => showOrderDetails(order)}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="kd-btn-delete"
                        onClick={() => deleteOrder(order, 'ready')}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="kd-card-status ready-status">
                      ✅ Tayyor
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== COMPLETED TAB ===== */}
        {activeTab === 'completed' && (
          <div className="kd-section">
            {getFilteredOrders(completedOrders).length === 0 ? (
              <div className="kd-empty">
                <div className="kd-empty-icon-wrap purple">
                  <FaHistory />
                </div>
                <h3>Yakunlangan buyurtmalar yo'q</h3>
                <p>Yakunlangan buyurtmalar tarixi shu yerda</p>
              </div>
            ) : (
              <div className="kd-orders-grid">
                {getFilteredOrders(completedOrders).slice(0, 30).map(order => (
                  <div key={order.kitchenId} className="kd-order-card completed">
                    <div className="kd-card-header">
                      <div className="kd-card-id-wrap">
                        <span className="kd-card-id">#{order.kitchenId}</span>
                        <span className="kd-card-table">
                          <FaTable /> {order.tableName}
                        </span>
                      </div>
                      <div className="kd-card-prep-time">
                        <FaClock /> {order.preparationTime} daq
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
                          <div className="kd-card-more">
                            +{order.items.length - 2} ta boshqa
                          </div>
                        )}
                      </div>
                      
                      <div className="kd-card-info">
                        <span>Yakunlandi: {new Date(order.completedTime).toLocaleTimeString('uz-UZ')}</span>
                      </div>
                      
                      <div className="kd-card-total">
                        Jami: {formatPrice(order.totalAmount || 0)}
                      </div>
                    </div>

                    <div className="kd-card-footer">
                      <button 
                        className="kd-btn-detail"
                        onClick={() => showOrderDetails(order)}
                      >
                        <FaEye /> Batafsil
                      </button>
                      <button 
                        className="kd-btn-delete"
                        onClick={() => deleteOrder(order, 'completed')}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="kd-card-status completed-status">
                      📋 Yakunlangan
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== ORDER DETAIL MODAL ===== */}
      {isDetailModalOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={closeOrderDetails}
          onPrint={(order) => {
            console.log('Print order:', order);
            toast.info('Chop etish funksiyasi');
          }}
          onDelete={(order) => {
            const listType = order.status === 'completed' ? 'completed' 
              : order.status === 'ready' ? 'ready' 
              : 'preparing';
            deleteOrder(order, listType);
            closeOrderDetails();
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default KitchenDashboard;