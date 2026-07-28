// src/components/KitchenDashboard.jsx
import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  FaClock, FaCheckCircle, FaUtensils, FaHourglassHalf, 
  FaTimes, FaChevronDown, FaChevronUp, FaPrint, 
  FaUserTie, FaSpinner, FaCheckDouble,
  FaVolumeUp, FaVolumeMute, FaPhone, FaBell,
  FaList, FaCheck
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './KitchenDashboard.css';

const formatPrice = (price) => {
  if (price === undefined || price === null) return '0 so‘m';
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const KitchenDashboard = () => {
  const { kitchenOrders, removeKitchenOrder, markOrderAsReady, startKitchenPreparation, tables, sendTelegramMessage } = useContext(AppContext);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [notifiedReadyOrders, setNotifiedReadyOrders] = useState(new Set());
  
  const notificationSoundRef = useRef(null);
  const readySoundRef = useRef(null);
  
  useEffect(() => {
    notificationSoundRef.current = new Audio('/notification.mp3');
    notificationSoundRef.current.preload = 'auto';
    readySoundRef.current = new Audio('/tayyor.mp3');
    readySoundRef.current.preload = 'auto';
    readySoundRef.current.volume = 1.0;
    return () => {
      if (notificationSoundRef.current) { notificationSoundRef.current.pause(); notificationSoundRef.current = null; }
      if (readySoundRef.current) { readySoundRef.current.pause(); readySoundRef.current = null; }
    };
  }, []);
  
  useEffect(() => {
    const readyOrders = kitchenOrders.filter(o => o.status === 'ready');
    readyOrders.forEach(order => {
      if (!notifiedReadyOrders.has(order.id)) {
        if (soundEnabled && readySoundRef.current) {
          try { readySoundRef.current.currentTime = 0; readySoundRef.current.play().catch(() => {}); } catch (error) { console.log('Audio error:', error); }
        }
        if (vibrationEnabled && navigator.vibrate) { navigator.vibrate([300, 100, 300, 100, 300, 100, 500]); }
        toast.success(`🔔 ${order.tableName} stolidagi buyurtma TAYYOR!`);
        setNotifiedReadyOrders(prev => new Set(prev).add(order.id));
      }
    });
  }, [kitchenOrders, soundEnabled, vibrationEnabled]);
  
  useEffect(() => {
    if (kitchenOrders.length > 0) {
      const lastOrder = kitchenOrders[kitchenOrders.length - 1];
      if (lastOrder.id !== lastOrderId && lastOrder.status === 'pending') {
        setLastOrderId(lastOrder.id);
        setNotificationCount(prev => prev + 1);
        if (soundEnabled && notificationSoundRef.current) {
          try { notificationSoundRef.current.currentTime = 0; notificationSoundRef.current.play().catch(() => {}); } catch (error) { console.log('Audio error:', error); }
        }
        if (vibrationEnabled && navigator.vibrate) { navigator.vibrate([200, 100, 200, 100, 200]); }
        toast.info(`📋 Yangi buyurtma: ${lastOrder.tableName} stolidan!`);
      }
    }
  }, [kitchenOrders, soundEnabled, vibrationEnabled, lastOrderId]);
  
  const notifyWaiter = useCallback(async (order) => {
    try {
      const waiterMessage = `
🔔 <b>BUYURTMA TAYYOR!</b>
🍽️ <b>Stol:</b> ${order.tableName}
👨‍🍳 <b>Ofitsiant:</b> ${order.waiter || 'Belgilanmagan'}
📋 <b>Buyurtmalar:</b>
${order.items.map(item => `• ${item.name} x${item.quantity}`).join('\n')}
⏱️ <b>Tayyorlanish vaqti:</b> ${order.preparationTime || 'Noma\'lum'} daqiqa
🕒 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}
⚠️ <b>DIQQAT!</b> Buyurtma tayyor! Iltimos, stolga xizmat qiling!`;
      await sendTelegramMessage(waiterMessage, '-4646692596');
      if (soundEnabled && readySoundRef.current) { try { readySoundRef.current.currentTime = 0; readySoundRef.current.play().catch(() => {}); } catch (error) { console.log('Audio error:', error); } }
      if (vibrationEnabled && navigator.vibrate) { navigator.vibrate([500, 200, 500, 200, 500]); }
      toast.success(`✅ ${order.tableName} stolidagi buyurtma tayyor! Ofitsiantga xabar yuborildi.`);
    } catch (error) { console.error('Ofitsiantga xabar yuborishda xato:', error); }
  }, [soundEnabled, vibrationEnabled, sendTelegramMessage]);
  
  const handleMarkReady = async (orderId) => {
    setProcessingOrder(orderId);
    try {
      const order = kitchenOrders.find(o => o.id === orderId || o.kitchenId === orderId);
      if (!order) { toast.error('Buyurtma topilmadi!'); setProcessingOrder(null); return; }
      const startTime = order.startTime || order.sentAt;
      const preparationTime = startTime ? Math.round((new Date() - new Date(startTime)) / 60000) : 0;
      await markOrderAsReady(orderId);
      await notifyWaiter({ ...order, preparationTime: preparationTime });
      toast.success(`✅ ${order.tableName} stolidagi buyurtma tayyor deb belgilandi!`);
      setTimeout(() => { removeKitchenOrder(orderId); }, 5000);
    } catch (error) { console.error('Tayyor deb belgilashda xato:', error); toast.error('Xatolik yuz berdi: ' + error.message); } 
    finally { setProcessingOrder(null); }
  };
  
  const handleServe = (orderId) => {
    const order = kitchenOrders.find(o => o.id === orderId || o.kitchenId === orderId);
    if (order) { toast.success(`✅ ${order.tableName} stoliga xizmat qilindi!`); removeKitchenOrder(orderId); }
  };
  
  const handleNotifyWaiter = (orderId) => {
    const order = kitchenOrders.find(o => o.id === orderId || o.kitchenId === orderId);
    if (order) { notifyWaiter(order); toast.info(`📨 ${order.tableName} stolidagi buyurtma uchun ofitsiantga xabar yuborildi!`); }
  };
  
  const filteredOrders = kitchenOrders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'preparing') return order.status === 'preparing';
    if (filter === 'ready') return order.status === 'ready';
    return true;
  });
  
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const order = { pending: 0, preparing: 1, ready: 2 };
    return (order[a.status] || 3) - (order[b.status] || 3);
  });
  
  const toggleExpanded = (id) => {
    setExpandedOrders(prev => { const newSet = new Set(prev); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); return newSet; });
  };
  
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { icon: <FaHourglassHalf className="status-icon pending" />, text: 'Kutilmoqda', color: '#f59e0b', bgColor: '#fef3c7', borderColor: '#f59e0b' },
      preparing: { icon: <FaUtensils className="status-icon preparing" />, text: 'Tayyorlanmoqda', color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#3b82f6' },
      ready: { icon: <FaCheckCircle className="status-icon ready" />, text: 'TAYYOR!', color: '#22c55e', bgColor: '#f0fdf4', borderColor: '#22c55e' }
    };
    return statusMap[status] || statusMap.pending;
  };
  
  const getElapsedTime = (startTime) => {
    if (!startTime) return '0 daqiqa';
    try {
      const start = new Date(startTime);
      const now = new Date();
      const diff = Math.floor((now - start) / 60000);
      if (diff < 1) return '1 daqiqa';
      if (diff < 60) return `${diff} daqiqa`;
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      return minutes > 0 ? `${hours}s ${minutes}m` : `${hours}s`;
    } catch { return '0 daqiqa'; }
  };
  
  const handleRemoveOrder = (orderId) => {
    if (window.confirm('Buyurtmani o\'chirishni tasdiqlaysizmi?')) { removeKitchenOrder(orderId); toast.info('Buyurtma o\'chirildi'); }
  };
  
  const clearNotifications = () => setNotificationCount(0);
  const getTableInfo = (tableId) => tables.find(t => t.id === tableId);
  const readyCount = kitchenOrders.filter(o => o.status === 'ready').length;
  
  return (
    <div className="kitchen-dashboard">
      <div className="kitchen-header">
        <div className="kitchen-header-left">
          <h2>👨‍🍳 Oshxona</h2>
          <span className="order-count">{kitchenOrders.length} ta buyurtma</span>
          {readyCount > 0 && <span className="ready-count-badge"><FaCheck /> {readyCount} ta tayyor</span>}
          {notificationCount > 0 && <button className="notification-badge" onClick={clearNotifications}>{notificationCount}</button>}
        </div>
        <div className="kitchen-header-right">
          <button className={`sound-toggle ${soundEnabled ? 'on' : 'off'}`} onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Ovoz o\'chirish' : 'Ovoz yoqish'}>
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>
          <button className={`vibration-toggle ${vibrationEnabled ? 'on' : 'off'}`} onClick={() => setVibrationEnabled(!vibrationEnabled)} title={vibrationEnabled ? 'Tebranish o\'chirish' : 'Tebranish yoqish'}>
            <FaPhone />
          </button>
          <button className="print-btn" onClick={() => window.print()}><FaPrint /> Chop etish</button>
        </div>
      </div>
      
      <div className="kitchen-filters">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}><FaList /> Hammasi ({kitchenOrders.length})</button>
        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}><FaHourglassHalf /> Kutilmoqda ({kitchenOrders.filter(o => o.status === 'pending').length})</button>
        <button className={`filter-btn ${filter === 'preparing' ? 'active' : ''}`} onClick={() => setFilter('preparing')}><FaUtensils /> Tayyorlanmoqda ({kitchenOrders.filter(o => o.status === 'preparing').length})</button>
        <button className={`filter-btn ${filter === 'ready' ? 'active' : ''}`} onClick={() => setFilter('ready')}><FaCheckCircle /> Tayyor! ({kitchenOrders.filter(o => o.status === 'ready').length})</button>
      </div>
      
      <div className="kitchen-orders-grid">
        {sortedOrders.length === 0 ? (
          <div className="no-orders"><FaUtensils className="no-orders-icon" /><h3>Buyurtmalar yo'q</h3><p>Hozircha oshxonaga yuborilgan buyurtmalar mavjud emas</p></div>
        ) : (
          sortedOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const elapsedTime = getElapsedTime(order.startTime || order.sentAt);
            const table = getTableInfo(order.tableId);
            const isExpanded = expandedOrders.has(order.id);
            const isProcessing = processingOrder === order.id;
            const isReady = order.status === 'ready';
            
            return (
              <div key={order.id} className={`kitchen-order-card status-${order.status} ${isExpanded ? 'expanded' : ''} ${isReady ? 'ready-card' : ''}`} style={{ borderLeftColor: statusInfo.color }}>
                <div className="order-card-header" onClick={() => toggleExpanded(order.id)}>
                  <div className="order-card-left">
                    <div className="order-table-info">
                      <span className="table-name">{order.tableName}</span>
                      {table && table.waiter && <span className="table-waiter"><FaUserTie /> {table.waiter}</span>}
                    </div>
                    <div className="order-status-badge" style={{ background: statusInfo.bgColor, color: statusInfo.color, borderColor: statusInfo.borderColor }}>
                      {statusInfo.icon} {statusInfo.text}
                    </div>
                  </div>
                  <div className="order-card-right">
                    <span className="order-time"><FaClock /> {elapsedTime}</span>
                    <span className="order-items-count">{order.items?.length || 0} ta</span>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="order-card-details">
                    <div className="order-items-list">
                      <h4>📋 Buyurtmalar:</h4>
                      {order.items && order.items.map((item, index) => (
                        <div key={index} className="order-item-row">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">×{item.quantity}</span>
                          <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                          {item.comment && <span className="item-comment">💬 {item.comment}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="order-summary">
                      <div className="order-total"><span>Jami:</span><span>{formatPrice(order.total || order.items.reduce((sum, i) => sum + i.price * i.quantity, 0))}</span></div>
                      <div className="order-meta">
                        <span>🕒 Yuborilgan: {new Date(order.startTime || order.sentAt).toLocaleString('uz-UZ')}</span>
                        {order.estimatedReadyTime && <span>⏱️ Taxminiy tayyor: {new Date(order.estimatedReadyTime).toLocaleString('uz-UZ')}</span>}
                        {isReady && order.readyTime && <span className="ready-time">✅ Tayyor: {new Date(order.readyTime).toLocaleString('uz-UZ')}</span>}
                      </div>
                    </div>
                    <div className="order-actions-kitchen">
                      {order.status === 'pending' && <button className="btn-start-prep" onClick={() => startKitchenPreparation(order.id)} disabled={isProcessing}><FaUtensils /> Tayyorlashni boshlash</button>}
                      {order.status === 'preparing' && <button className={`btn-mark-ready ${isProcessing ? 'processing' : ''}`} onClick={() => handleMarkReady(order.id)} disabled={isProcessing}>
                        {isProcessing ? <FaSpinner className="spinner" /> : <FaCheckCircle />} {isProcessing ? '...' : 'Tayyor deb belgilash'}
                      </button>}
                      {order.status === 'ready' && <div className="ready-actions">
                        <button className="btn-serve" onClick={() => handleServe(order.id)}><FaCheckDouble /> Xizmat qilish</button>
                        <button className="btn-notify-waiter" onClick={() => handleNotifyWaiter(order.id)}><FaBell /> Ofitsiantga xabar</button>
                      </div>}
                      <button className="btn-remove-order" onClick={() => handleRemoveOrder(order.id)} disabled={isProcessing}><FaTimes /> O'chirish</button>
                    </div>
                  </div>
                )}
                
                {order.status === 'preparing' && (
                  <div className="preparing-progress">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, (Date.now() - new Date(order.startTime).getTime()) / 60000 / 30 * 100)}%` }} /></div>
                    <span className="progress-text">Tayyorlanmoqda...</span>
                  </div>
                )}
                {isReady && <div className="ready-badge"><FaBell className="ready-bell" /><span>TAYYOR!</span></div>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;