import React, { useState, useEffect } from 'react';
import { FaUtensils, FaFire, FaCheckCircle, FaClock, FaPlay, FaStop, FaHistory, FaTrash, FaEye } from 'react-icons/fa';
import './KitchenDashboard.css';

const KitchenDashboard = () => {
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('preparing');
  const [timers, setTimers] = useState({});

  // Buyurtmalarni yuklash
  useEffect(() => {
    const loadOrders = () => {
      const savedPreparing = localStorage.getItem('kitchenPreparingOrders');
      const savedReady = localStorage.getItem('kitchenReadyOrders');
      const savedCompleted = localStorage.getItem('kitchenCompletedOrders');

      setPreparingOrders(savedPreparing ? JSON.parse(savedPreparing) : []);
      setReadyOrders(savedReady ? JSON.parse(savedReady) : []);
      setCompletedOrders(savedCompleted ? JSON.parse(savedCompleted) : []);
    };

    loadOrders();
    
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

  // Tayyorlashni boshlash
  const startPreparation = (order) => {
    const updatedOrder = {
      ...order,
      status: 'preparing',
      startTime: new Date().toISOString()
    };

    const updatedPreparing = preparingOrders.map(o => 
      o.kitchenId === order.kitchenId ? updatedOrder : o
    );

    setPreparingOrders(updatedPreparing);
    localStorage.setItem('kitchenPreparingOrders', JSON.stringify(updatedPreparing));
  };

  // Tayyor bo'ldi
  const markAsReady = (order) => {
    const readyTime = new Date();
    const startTime = new Date(order.startTime);
    const preparationTime = Math.round((readyTime - startTime) / 60000);

    const completedOrder = {
      ...order,
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
  };

  // Buyurtmani yakunlash
  const completeOrder = (order) => {
    // Ready dan o'chirish
    const updatedReady = readyOrders.filter(o => o.kitchenId !== order.kitchenId);
    setReadyOrders(updatedReady);
    localStorage.setItem('kitchenReadyOrders', JSON.stringify(updatedReady));

    // Completed ga qo'shish
    const updatedCompleted = [...completedOrders, { ...order, completedTime: new Date().toISOString() }];
    setCompletedOrders(updatedCompleted);
    localStorage.setItem('kitchenCompletedOrders', JSON.stringify(updatedCompleted));
  };

  // Buyurtmani o'chirish
  const deleteOrder = (order, listType) => {
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
  };

  // Barcha buyurtmalarni o'chirish
  const clearAllOrders = () => {
    if (window.confirm('Barcha buyurtmalarni o\'chirishni tasdiqlaysizmi?')) {
      setPreparingOrders([]);
      setReadyOrders([]);
      setCompletedOrders([]);
      localStorage.removeItem('kitchenPreparingOrders');
      localStorage.removeItem('kitchenReadyOrders');
      localStorage.removeItem('kitchenCompletedOrders');
    }
  };

  // Buyurtma tafsilotlarini ko'rsatish
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  // Modalni yopish
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Umumiy statistika
  const totalOrders = preparingOrders.length + readyOrders.length + completedOrders.length;
  const totalPreparingTime = preparingOrders.reduce((total, order) => {
    return total + (timers[order.kitchenId] || 0);
  }, 0);
  const avgPreparingTime = preparingOrders.length > 0 ? Math.round(totalPreparingTime / preparingOrders.length) : 0;

  return (
    <div className="kitchen-dashboard">
      {/* Header */}
      <div className="kitchen-header">
        <h1><FaUtensils /> Oshxona Boshqaruvi</h1>
        <div className="kitchen-stats">
          <div className="stat-card">
            <div className="stat-value">{preparingOrders.length}</div>
            <div className="stat-label">Tayyorlanmoqda</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{readyOrders.length}</div>
            <div className="stat-label">Tayyor</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completedOrders.length}</div>
            <div className="stat-label">Yakunlangan</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalOrders}</div>
            <div className="stat-label">Jami</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="kitchen-tabs">
        <button 
          className={`tab-btn ${activeTab === 'preparing' ? 'active' : ''}`}
          onClick={() => setActiveTab('preparing')}
        >
          <FaFire /> Tayyorlanmoqda ({preparingOrders.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ready' ? 'active' : ''}`}
          onClick={() => setActiveTab('ready')}
        >
          <FaCheckCircle /> Tayyor ({readyOrders.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <FaHistory /> Yakunlangan ({completedOrders.length})
        </button>
        <button 
          className="clear-all-btn"
          onClick={clearAllOrders}
        >
          <FaTrash /> Tozalash
        </button>
      </div>

      {/* Content */}
      <div className="kitchen-content">
        {/* Tayyorlanmoqda bo'limi */}
        {activeTab === 'preparing' && (
          <div className="orders-section">
            <h2>🔥 Tayyorlanayotgan Buyurtmalar</h2>
            {preparingOrders.length === 0 ? (
              <div className="empty-state">
                <FaUtensils size={48} />
                <h3>Hozircha tayyorlanayotgan buyurtmalar yo'q</h3>
                <p>Yangi buyurtmalar shu yerda ko'rinadi</p>
              </div>
            ) : (
              <div className="orders-grid">
                {preparingOrders.map(order => (
                  <div key={order.kitchenId} className="order-card preparing">
                    <div className="order-header">
                      <div className="order-info">
                        <div className="order-id">#{order.kitchenId}</div>
                        <div className="table-name">{order.tableName}</div>
                      </div>
                      <div className="order-timer">
                        <FaClock /> {timers[order.kitchenId] || 0} daqiqa
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                          {item.notes && (
                            <span className="item-notes">({item.notes})</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="order-time">
                      <strong>Qabul qilindi:</strong> {new Date(order.date).toLocaleTimeString('uz-UZ')}
                    </div>

                    <div className="order-actions">
                      <button 
                        className="btn-ready"
                        onClick={() => markAsReady(order)}
                      >
                        <FaCheckCircle /> Tayyor
                      </button>
                      <button 
                        className="btn-details"
                        onClick={() => showOrderDetails(order)}
                      >
                        <FaEye /> Batafsil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tayyor bo'limi */}
        {activeTab === 'ready' && (
          <div className="orders-section">
            <h2>✅ Tayyor Buyurtmalar</h2>
            {readyOrders.length === 0 ? (
              <div className="empty-state">
                <FaCheckCircle size={48} />
                <h3>Hozircha tayyor buyurtmalar yo'q</h3>
                <p>Tayyor bo'lgan buyurtmalar shu yerda ko'rinadi</p>
              </div>
            ) : (
              <div className="orders-grid">
                {readyOrders.map(order => (
                  <div key={order.kitchenId} className="order-card ready">
                    <div className="order-header">
                      <div className="order-info">
                        <div className="order-id">#{order.kitchenId}</div>
                        <div className="table-name">{order.tableName}</div>
                      </div>
                      <div className="prep-time">
                        {order.preparationTime} daqiqa
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="more-items">+{order.items.length - 3} ta boshqa</div>
                      )}
                    </div>

                    <div className="order-time">
                      <strong>Tayyor bo'ldi:</strong> {new Date(order.readyTime).toLocaleTimeString('uz-UZ')}
                    </div>

                    <div className="order-actions">
                      <button 
                        className="btn-complete"
                        onClick={() => completeOrder(order)}
                      >
                        <FaCheckCircle /> Yakunlash
                      </button>
                      <button 
                        className="btn-details"
                        onClick={() => showOrderDetails(order)}
                      >
                        <FaEye /> Batafsil
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => deleteOrder(order, 'ready')}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Yakunlangan bo'limi */}
        {activeTab === 'completed' && (
          <div className="orders-section">
            <h2>📋 Yakunlangan Buyurtmalar</h2>
            {completedOrders.length === 0 ? (
              <div className="empty-state">
                <FaHistory size={48} />
                <h3>Hozircha yakunlangan buyurtmalar yo'q</h3>
                <p>Yakunlangan buyurtmalar tarixi shu yerda ko'rinadi</p>
              </div>
            ) : (
              <div className="orders-grid">
                {completedOrders.slice(0, 20).map(order => (
                  <div key={order.kitchenId} className="order-card completed">
                    <div className="order-header">
                      <div className="order-info">
                        <div className="order-id">#{order.kitchenId}</div>
                        <div className="table-name">{order.tableName}</div>
                      </div>
                      <div className="prep-time">
                        {order.preparationTime} daqiqa
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="more-items">+{order.items.length - 2} ta boshqa</div>
                      )}
                    </div>

                    <div className="order-time">
                      <strong>Yakunlandi:</strong> {new Date(order.completedTime).toLocaleTimeString('uz-UZ')}
                    </div>

                    <div className="order-actions">
                      <button 
                        className="btn-details"
                        onClick={() => showOrderDetails(order)}
                      >
                        <FaEye /> Batafsil
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => deleteOrder(order, 'completed')}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Buyurtma Tafsilotlari</h3>
              <button className="close-btn" onClick={closeOrderDetails}>×</button>
            </div>
            
            <div className="order-details">
              <div className="detail-row">
                <strong>Buyurtma ID:</strong>
                <span>#{selectedOrder.kitchenId}</span>
              </div>
              
              <div className="detail-row">
                <strong>Stol:</strong>
                <span>{selectedOrder.tableName}</span>
              </div>
              
              <div className="detail-row">
                <strong>Holati:</strong>
                <span className={`status status-${selectedOrder.status}`}>
                  {selectedOrder.status === 'preparing' ? '🔥 Tayyorlanmoqda' : 
                   selectedOrder.status === 'ready' ? '✅ Tayyor' : '📋 Yakunlangan'}
                </span>
              </div>
              
              <div className="detail-row">
                <strong>Qabul qilindi:</strong>
                <span>{new Date(selectedOrder.date).toLocaleString('uz-UZ')}</span>
              </div>

              {selectedOrder.startTime && (
                <div className="detail-row">
                  <strong>Boshlangan vaqt:</strong>
                  <span>{new Date(selectedOrder.startTime).toLocaleTimeString('uz-UZ')}</span>
                </div>
              )}

              {selectedOrder.readyTime && (
                <div className="detail-row">
                  <strong>Tayyor bo'ldi:</strong>
                  <span>{new Date(selectedOrder.readyTime).toLocaleTimeString('uz-UZ')}</span>
                </div>
              )}

              {selectedOrder.preparationTime && (
                <div className="detail-row">
                  <strong>Tayyorlanish vaqti:</strong>
                  <span>{selectedOrder.preparationTime} daqiqa</span>
                </div>
              )}

              <div className="items-section">
                <h4>Buyurtma Mahsulotlari:</h4>
                <div className="items-list">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-detail">
                      <div className="item-main">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <div className="item-secondary">
                        {item.notes && (
                          <span className="item-notes">Eslatma: {item.notes}</span>
                        )}
                        <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="total-section">
                <div className="total-amount">
                  <strong>Umumiy summa:</strong>
                  <strong>{formatPrice(selectedOrder.totalAmount || 0)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;