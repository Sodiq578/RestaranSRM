import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FaSearch, FaFilter, FaPrint, FaEye, FaTimes } from 'react-icons/fa';
import './OrdersHistory.css';

const OrdersHistory = () => {
  const { ordersHistory, generateReceiptPDF } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = ordersHistory.filter(order => {
    const matchesSearch = order.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.waiter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesDate = !dateFilter || new Date(order.date).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const statusOptions = [
    { value: 'all', label: 'Barchasi' },
    { value: 'To\'lov kutilmoqda', label: 'To\'lov kutilmoqda' },
    { value: 'To\'lov qilindi', label: 'To\'lov qilindi' },
    { value: 'Qarz', label: 'Qarz' },
    { value: 'Tayyorlashga yuborildi', label: 'Tayyorlashga yuborildi' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'To\'lov kutilmoqda': { class: 'warning', text: 'To\'lov kutilmoqda' },
      'To\'lov qilindi': { class: 'success', text: 'To\'lov qilindi' },
      'Qarz': { class: 'danger', text: 'Qarz' },
      'Tayyorlashga yuborildi': { class: 'info', text: 'Tayyorlashga yuborildi' }
    };
    
    const config = statusConfig[status] || { class: 'secondary', text: status };
    return <span className={`badge badge-${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="orders-history">
      <div className="page-header">
        <h1>Buyurtmalar Tarixi</h1>
        <p>Barcha buyurtmalarning to'liq ro'yxati</p>
      </div>

      <div className="filters-card">
        <div className="filters-grid">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Stol, ofitsiant yoki taom nomi bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-input"
          />
          
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('');
            }}
            className="btn btn-secondary"
          >
            <FaTimes /> Filterni tozalash
          </button>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-card">
          <h3>Jami Buyurtmalar</h3>
          <span className="stat-number">{ordersHistory.length}</span>
        </div>
        <div className="stat-card">
          <h3>To'langan</h3>
          <span className="stat-number success">
            {ordersHistory.filter(o => o.status === 'To\'lov qilindi').length}
          </span>
        </div>
        <div className="stat-card">
          <h3>Kutilayotgan</h3>
          <span className="stat-number warning">
            {ordersHistory.filter(o => o.status === 'To\'lov kutilmoqda').length}
          </span>
        </div>
        <div className="stat-card">
          <h3>Qarz</h3>
          <span className="stat-number danger">
            {ordersHistory.filter(o => o.status === 'Qarz').length}
          </span>
        </div>
      </div>

      <div className="orders-table-card">
        <div className="table-responsive">
          <table className="orders-table">
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
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id.toString().slice(-6)}</td>
                  <td className="table-name">{order.tableName}</td>
                  <td className="waiter">{order.waiter || 'Belgilanmagan'}</td>
                  <td className="date">
                    {new Date(order.date).toLocaleString('uz-UZ')}
                  </td>
                  <td className="items">
                    <div className="items-list">
                      {order.items.slice(0, 2).map((item, index) => (
                        <span key={index} className="item-tag">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                      {order.items.length > 2 && (
                        <span className="more-items">
                          +{order.items.length - 2} ta
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="total">{formatPrice(order.total)}</td>
                  <td className="status">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn-action view"
                      title="Ko'rish"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => generateReceiptPDF(order)}
                      className="btn-action print"
                      title="Chop etish"
                    >
                      <FaPrint />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="empty-state">
              <FaSearch size={48} />
              <h3>Buyurtmalar topilmadi</h3>
              <p>Qidiruv shartlariga mos buyurtmalar mavjud emas</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Buyurtma Tafsilotlari</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Buyurtma ID:</span>
                  <span className="detail-value">#{selectedOrder.id.toString().slice(-6)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Stol:</span>
                  <span className="detail-value">{selectedOrder.tableName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ofitsiant:</span>
                  <span className="detail-value">{selectedOrder.waiter || 'Belgilanmagan'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Sana:</span>
                  <span className="detail-value">
                    {new Date(selectedOrder.date).toLocaleString('uz-UZ')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">
                    {getStatusBadge(selectedOrder.status)}
                  </span>
                </div>
                
                <div className="items-section">
                  <h4>Buyurtmalar:</h4>
                  <div className="items-details">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="item-detail">
                        <div className="item-main">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                          <span className="item-price">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                        {item.comment && (
                          <div className="item-comment">
                            <strong>Izoh:</strong> {item.comment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="total-section">
                  <div className="detail-row total">
                    <span className="detail-label">Jami:</span>
                    <span className="detail-value">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </div>

                {selectedOrder.status === 'Qarz' && selectedOrder.debtDetails && (
                  <div className="debt-section">
                    <h4>Qarz Ma'lumotlari:</h4>
                    <div className="debt-details">
                      <div className="detail-row">
                        <span className="detail-label">Summa:</span>
                        <span className="detail-value">
                          {formatPrice(selectedOrder.debtDetails.amount)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Qarzdor:</span>
                        <span className="detail-value">
                          {selectedOrder.debtDetails.debtorName}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Manzil:</span>
                        <span className="detail-value">
                          {selectedOrder.debtDetails.debtorAddress}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">To'lov Sanasi:</span>
                        <span className="detail-value">
                          {new Date(selectedOrder.debtDetails.repaymentDate).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => generateReceiptPDF(selectedOrder)}
                className="btn btn-primary"
              >
                <FaPrint /> Chekni chop etish
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-secondary"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;