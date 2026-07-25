import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import './OrdersHistory.css';

// ==================== FORMAT PRICE ====================
const formatPrice = (price) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// ==================== ORDER DETAIL MODAL ====================
const OrderDetailModal = ({ order, onClose, onPrint }) => {
  // HOOK DOIMO CHAQIRILADI
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!order) return null;

  const getStatusIcon = (status) => {
    switch(status) {
      case "To'lov qilindi": return "✅";
      case "To'lov kutilmoqda": return "⏳";
      case "Qarz": return "⚠️";
      case "Tayyorlashga yuborildi": return "📤";
      default: return "❓";
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "To'lov qilindi": return { bg: '#d1fae5', color: '#065f46', dot: '#10b981' };
      case "To'lov kutilmoqda": return { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' };
      case "Qarz": return { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' };
      case "Tayyorlashga yuborildi": return { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' };
      default: return { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };
    }
  };

  const statusStyle = getStatusColor(order.status);

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="detail-modal-header">
          <div className="detail-modal-header-left">
            <div className="detail-modal-icon" style={{ background: statusStyle.bg, color: statusStyle.color }}>
              <span>{getStatusIcon(order.status)}</span>
            </div>
            <div className="detail-modal-title-wrap">
              <h2 className="detail-modal-title">
                Buyurtma #{order.id?.toString().slice(-6)}
              </h2>
              <span className="detail-modal-status" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                <span className="status-dot" style={{ background: statusStyle.dot }}></span>
                {getStatusIcon(order.status)} {order.status}
              </span>
            </div>
          </div>
          <button className="detail-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="detail-modal-body">
          
          {/* Asosiy ma'lumotlar */}
          <div className="detail-section">
            <h3 className="detail-section-title">📋 Asosiy ma'lumotlar</h3>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span className="detail-label">🍽️ Stol</span>
                <span className="detail-value">{order.tableName || "—"}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-label">👤 Ofitsiant</span>
                <span className="detail-value">{order.waiter || "—"}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-label">📅 Sana</span>
                <span className="detail-value">
                  {order.date ? new Date(order.date).toLocaleString('uz-UZ') : "—"}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-label">💰 Jami</span>
                <span className="detail-value total-value">{formatPrice(order.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Buyurtmalar ro'yxati */}
          <div className="detail-section">
            <h3 className="detail-section-title">🛒 Buyurtma mahsulotlari</h3>
            {order.items && order.items.length > 0 ? (
              <div className="detail-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="detail-item-card">
                    <div className="detail-item-main">
                      <span className="detail-item-num">{idx + 1}.</span>
                      <span className="detail-item-name">{item.name}</span>
                      <span className="detail-item-qty">×{item.quantity}</span>
                      <span className="detail-item-price">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    {item.comment && (
                      <div className="detail-item-comment">
                        <strong>Izoh:</strong> {item.comment}
                      </div>
                    )}
                  </div>
                ))}
                <div className="detail-items-total">
                  <span>Jami:</span>
                  <span>{formatPrice(order.total || 0)}</span>
                </div>
              </div>
            ) : (
              <div className="detail-empty">
                <p>Mahsulotlar ro'yxati bo'sh</p>
              </div>
            )}
          </div>

          {/* Qarz ma'lumotlari */}
          {order.status === 'Qarz' && order.debtDetails && (
            <div className="detail-section debt-section">
              <h3 className="detail-section-title debt-title">⚠️ Qarz ma'lumotlari</h3>
              <div className="detail-debt-grid">
                <div className="detail-debt-item">
                  <span className="debt-label">Summa</span>
                  <span className="debt-value">{formatPrice(order.debtDetails.amount)}</span>
                </div>
                <div className="detail-debt-item">
                  <span className="debt-label">Qarzdor</span>
                  <span className="debt-value">{order.debtDetails.debtorName}</span>
                </div>
                <div className="detail-debt-item">
                  <span className="debt-label">Manzil</span>
                  <span className="debt-value">{order.debtDetails.debtorAddress}</span>
                </div>
                <div className="detail-debt-item">
                  <span className="debt-label">To'lov sanasi</span>
                  <span className="debt-value">
                    {new Date(order.debtDetails.repaymentDate).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="detail-modal-footer">
          <button className="detail-btn detail-btn-close" onClick={onClose}>
            ✕ Yopish
          </button>
          {onPrint && (
            <button className="detail-btn detail-btn-print" onClick={() => onPrint(order)}>
              🖨️ Chekni chop etish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const OrdersHistory = () => {
  const { ordersHistory, generateReceiptPDF } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return ordersHistory.filter(order => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        (order.tableName || '').toLowerCase().includes(search) ||
        (order.waiter || '').toLowerCase().includes(search) ||
        (order.items || []).some(item => (item.name || '').toLowerCase().includes(search));
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      const matchesDate = !dateFilter || 
        new Date(order.date).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [ordersHistory, searchTerm, statusFilter, dateFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: ordersHistory.length,
      paid: ordersHistory.filter(o => o.status === "To'lov qilindi").length,
      pending: ordersHistory.filter(o => o.status === "To'lov kutilmoqda").length,
      debt: ordersHistory.filter(o => o.status === "Qarz").length,
    };
  }, [ordersHistory]);

  const getStatusBadge = (status) => {
    switch(status) {
      case "To'lov qilindi":
        return { icon: "✅", className: "badge-success", text: status };
      case "To'lov kutilmoqda":
        return { icon: "⏳", className: "badge-warning", text: status };
      case "Qarz":
        return { icon: "⚠️", className: "badge-danger", text: status };
      case "Tayyorlashga yuborildi":
        return { icon: "📤", className: "badge-info", text: status };
      default:
        return { icon: "❓", className: "badge-default", text: status };
    }
  };

  const handlePrint = (order) => {
    try {
      generateReceiptPDF(order);
      toast.success('✅ Chek chop etildi!');
    } catch (error) {
      toast.error('❌ Xatolik yuz berdi!');
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  };

  return (
    <div className="orders-history-page">
      
      {/* Page Header */}
      <div className="page-header-bar">
        <div className="page-header-left">
          <div className="page-header-icon">📋</div>
          <div>
            <h1 className="page-heading">Buyurtmalar Tarixi</h1>
            <p className="page-subheading">Barcha buyurtmalar ro'yxati va hisoboti</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-card-row">
        <div className="stats-mini-card">
          <div className="stats-mini-icon icon-total">📋</div>
          <div className="stats-mini-info">
            <span className="stats-mini-number">{stats.total}</span>
            <span className="stats-mini-text">Jami buyurtmalar</span>
          </div>
        </div>
        <div className="stats-mini-card">
          <div className="stats-mini-icon icon-paid">✅</div>
          <div className="stats-mini-info">
            <span className="stats-mini-number green">{stats.paid}</span>
            <span className="stats-mini-text">To'langan</span>
          </div>
        </div>
        <div className="stats-mini-card">
          <div className="stats-mini-icon icon-pending">⏳</div>
          <div className="stats-mini-info">
            <span className="stats-mini-number orange">{stats.pending}</span>
            <span className="stats-mini-text">Kutilmoqda</span>
          </div>
        </div>
        <div className="stats-mini-card">
          <div className="stats-mini-icon icon-debt">⚠️</div>
          <div className="stats-mini-info">
            <span className="stats-mini-number red">{stats.debt}</span>
            <span className="stats-mini-text">Qarzlar</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar-card">
        <div className="filters-bar-row">
          
          {/* Search */}
          <div className="filter-search-wrap">
            <span className="filter-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Stol, ofitsiant yoki taom qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-search-input"
            />
            {searchTerm && (
              <button className="filter-search-clear" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select-box"
          >
            <option value="all">📋 Barcha statuslar</option>
            <option value="To'lov kutilmoqda">⏳ To'lov kutilmoqda</option>
            <option value="To'lov qilindi">✅ To'lov qilindi</option>
            <option value="Qarz">⚠️ Qarz</option>
            <option value="Tayyorlashga yuborildi">📤 Tayyorlashga yuborildi</option>
          </select>
          
          {/* Date Filter */}
          <div className="filter-date-wrap">
            <span className="filter-date-icon">📅</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-date-input"
            />
          </div>
          
          {/* Reset Button */}
          <button className="filter-reset-btn" onClick={handleReset}>
            🔄 Tozalash
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-card">
        <div className="table-scroll-wrap">
          <table className="orders-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Stol</th>
                <th>Ofitsiant</th>
                <th>Sana</th>
                <th>Buyurtmalar</th>
                <th>Jami</th>
                <th>Status</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <tr key={order.id}>
                      <td className="td-id">#{order.id?.toString().slice(-6)}</td>
                      <td className="td-table">{order.tableName}</td>
                      <td className="td-waiter">{order.waiter || '—'}</td>
                      <td className="td-date">
                        {new Date(order.date).toLocaleString('uz-UZ')}
                      </td>
                      <td>
                        <div className="td-items-wrap">
                          {order.items?.slice(0, 2).map((item, i) => (
                            <span key={i} className="td-item-tag">
                              {item.name} ×{item.quantity}
                            </span>
                          ))}
                          {order.items?.length > 2 && (
                            <span className="td-more">+{order.items.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="td-total">{formatPrice(order.total)}</td>
                      <td>
                        <span className={`td-status-badge ${badge.className}`}>
                          {badge.icon} {badge.text}
                        </span>
                      </td>
                      <td>
                        <div className="td-actions">
                          <button 
                            className="td-btn td-btn-view"
                            onClick={() => setSelectedOrder(order)}
                            title="Batafsil ko'rish"
                          >
                            👁️
                          </button>
                          <button 
                            className="td-btn td-btn-print"
                            onClick={() => handlePrint(order)}
                            title="Chek chop etish"
                          >
                            🖨️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-table-message">
                      <span style={{ fontSize: '40px' }}>🔍</span>
                      <h3>Buyurtmalar topilmadi</h3>
                      <p>Qidiruv bo'yicha hech qanday natija yo'q</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count-badge">
        📋 Jami {filteredOrders.length} ta buyurtma
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
};

export default OrdersHistory;