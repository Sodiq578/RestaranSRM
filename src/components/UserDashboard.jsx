import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { FaUser, FaTable, FaUtensils, FaClock, FaCheckCircle, FaHistory, FaFire } from 'react-icons/fa';
import './UserDashboard.css';

const UserDashboard = () => {
  const { ordersHistory } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('my-orders');
  const [userOrders, setUserOrders] = useState([]);
  const [kitchenOrders, setKitchenOrders] = useState([]);

  // Real-time yangilanish uchun useEffect
  useEffect(() => {
    const savedKitchenOrders = localStorage.getItem('kitchenPreparingOrders');
    const savedReadyOrders = localStorage.getItem('kitchenReadyOrders');
    
    const preparingOrders = savedKitchenOrders ? JSON.parse(savedKitchenOrders) : [];
    const readyOrders = savedReadyOrders ? JSON.parse(savedReadyOrders) : [];
    
    setKitchenOrders([...preparingOrders, ...readyOrders]);
    
    // Barcha buyurtmalarni birlashtiramiz
    const allOrders = [...ordersHistory];
    preparingOrders.forEach(kitchenOrder => {
      if (!allOrders.some(order => order.id === kitchenOrder.id)) {
        allOrders.push(kitchenOrder);
      }
    });
    readyOrders.forEach(readyOrder => {
      if (!allOrders.some(order => order.id === readyOrder.id)) {
        allOrders.push(readyOrder);
      }
    });
    
    setUserOrders(allOrders);
  }, [ordersHistory]);

  // Har 5 soniyada yangilash
  useEffect(() => {
    const interval = setInterval(() => {
      const savedKitchenOrders = localStorage.getItem('kitchenPreparingOrders');
      const savedReadyOrders = localStorage.getItem('kitchenReadyOrders');
      
      const preparingOrders = savedKitchenOrders ? JSON.parse(savedKitchenOrders) : [];
      const readyOrders = savedReadyOrders ? JSON.parse(savedReadyOrders) : [];
      
      setKitchenOrders([...preparingOrders, ...readyOrders]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Status ranglari
  const getStatusColor = (status) => {
    switch (status) {
      case 'Tayyorlashga yuborildi': return 'waiting';
      case 'preparing': return 'preparing';
      case 'ready': return 'ready';
      case 'To\'lov qilindi': return 'completed';
      case 'To\'lov kutilmoqda': return 'pending';
      case 'Qarz': return 'debt';
      default: return 'unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Tayyorlashga yuborildi': return <FaClock />;
      case 'preparing': return <FaFire />;
      case 'ready': return <FaCheckCircle />;
      case 'To\'lov qilindi': return <FaCheckCircle />;
      default: return <FaHistory />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Tayyorlashga yuborildi': return 'Kutayotgan';
      case 'preparing': return 'Tayyorlanmoqda';
      case 'ready': return 'Tayyor';
      case 'To\'lov qilindi': return 'Yakunlangan';
      case 'To\'lov kutilmoqda': return "To'lov kutilmoqda";
      case 'Qarz': return 'Qarz';
      default: return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="user-dashboard">
    

       

      <div className="dashboard-content">
        {activeTab === 'my-orders' && (
          <div className="orders-section">
            <h2>Mening Buyurtmalarim</h2>
            <div className="orders-grid">
              {userOrders.length === 0 ? (
                <div className="empty-state">
                  <FaHistory size={48} />
                  <h3>Hozircha buyurtmalar yo'q</h3>
                  <p>Sizning buyurtmalaringiz shu yerda ko'rinadi</p>
                </div>
              ) : (
                userOrders
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(order => (
                  <div key={order.id} className={`order-card status-${getStatusColor(order.status)}`}>
                    <div className="order-header">
                      <div className="order-title">
                         
                        <span className="order-id">
                          #{order.kitchenId || order.id.toString().slice(-6)}
                        </span>
                      </div>
             
                    </div>
                    
               
                    
                    {order.kitchenId && (
                      <div className="kitchen-info">
                        <strong>Oshxona ID:</strong> {order.kitchenId}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'kitchen' && (
          <div className="kitchen-section">
            <h2>Oshxona Holati</h2>
            <div className="kitchen-stats">
              <div className="kitchen-stat preparing">
                <div className="stat-value">
                  {kitchenOrders.filter(order => order.status === 'preparing').length}
                </div>
                <div className="stat-label">Tayyorlanmoqda</div>
              </div>
              <div className="kitchen-stat ready">
                <div className="stat-value">
                  {kitchenOrders.filter(order => order.status === 'ready').length}
                </div>
                <div className="stat-label">Tayyor</div>
              </div>
            </div>
            
            <div className="kitchen-orders">
              <h3>Faol Buyurtmalar</h3>
              {kitchenOrders.length === 0 ? (
                <div className="empty-state">
                  <FaUtensils size={48} />
                  <h3>Hozircha faol buyurtmalar yo'q</h3>
                  <p>Oshxonada hozircha buyurtmalar yo'q</p>
                </div>
              ) : (
                kitchenOrders
                  .sort((a, b) => {
                    // Tayyorlanayotganlarni birinchi ko'rsatish
                    if (a.status === 'preparing' && b.status !== 'preparing') return -1;
                    if (a.status !== 'preparing' && b.status === 'preparing') return 1;
                    return new Date(b.startTime || b.date) - new Date(a.startTime || a.date);
                  })
                  .map(order => (
                  <div key={order.kitchenId || order.id} className="kitchen-order">
                    <div className="kitchen-order-header">
                      <div className="table-info">
                        <span className="table-name">{order.tableName}</span>
                        <span className="kitchen-order-id">ID: {order.kitchenId || order.id.toString().slice(-6)}</span>
                      </div>
                      <span className={`status status-${order.status}`}>
                        {order.status === 'preparing' ? '🔥 Tayyorlanmoqda' : '✅ Tayyor'}
                      </span>
                    </div>
                    
                    {order.startTime && (
                      <div className="kitchen-time">
                        <strong>Boshlangan:</strong> {new Date(order.startTime).toLocaleTimeString('uz-UZ')}
                        {order.status === 'preparing' && (
                          <span className="timer">
                            ({Math.round((new Date() - new Date(order.startTime)) / 60000)} daqiqa)
                          </span>
                        )}
                      </div>
                    )}
                    
                    {order.status === 'ready' && order.readyTime && (
                      <div className="ready-info">
                        <strong>Tayyor bo'ldi:</strong> {new Date(order.readyTime).toLocaleTimeString('uz-UZ')}
                        {order.preparationTime && (
                          <span className="prep-time">
                            ({order.preparationTime} daqiqa)
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="kitchen-items">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="kitchen-item">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="more-kitchen-items">
                          +{order.items.length - 2} ta boshqa
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;