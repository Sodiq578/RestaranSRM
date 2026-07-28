// src/components/NotificationBell.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FaBell, FaTimes, FaCheckCircle, FaUtensils, FaClock } from 'react-icons/fa';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const getIcon = (type) => {
    switch(type) {
      case 'ready': return <FaCheckCircle className="notif-icon ready" />;
      case 'new_order': return <FaUtensils className="notif-icon new" />;
      case 'pending': return <FaClock className="notif-icon pending" />;
      default: return <FaBell className="notif-icon default" />;
    }
  };

  const getTime = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 60000);
    if (diff < 1) return 'Hozir';
    if (diff < 60) return `${diff} daqiqa oldin`;
    if (diff < 1440) return `${Math.floor(diff / 60)} soat oldin`;
    return `${Math.floor(diff / 1440)} kun oldin`;
  };

  const handleNotificationClick = (id) => { markNotificationAsRead(id); };

  return (
    <div className="notification-bell-container">
      <button className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span className="notification-title">📨 Xabarlar</span>
            {notifications.length > 0 && <button className="clear-all-btn" onClick={() => clearNotifications()}><FaTimes /> Hammasini o'chirish</button>}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications"><FaBell className="empty-icon" /><p>Xabarlar yo'q</p></div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`} onClick={() => handleNotificationClick(notif.id)}>
                  {getIcon(notif.type)}
                  <div className="notification-content"><div className="notification-message">{notif.message}</div><div className="notification-time">{getTime(notif.createdAt)}</div></div>
                  {!notif.read && <span className="unread-dot"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;