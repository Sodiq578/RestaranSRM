import React, { useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { MdAttachMoney, MdReceipt, MdTableRestaurant, MdStar, MdAccessTime } from "react-icons/md";
import "./Dashboard.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const Dashboard = () => {
  const { tables, ordersHistory } = useContext(AppContext);
  const today = new Date().toLocaleDateString("uz-UZ");
  const todayOrders = ordersHistory.filter(
    (order) => new Date(order.date).toLocaleDateString("uz-UZ") === today
  );

  const stats = useMemo(() => {
    const totalTables = tables.length;
    const freeTables = tables.filter(t => t.status === "Bo'sh").length;
    const occupiedTables = tables.filter(t => t.status === "Band").length;
    const reservedTables = tables.filter(t => t.status === "Band qilingan").length;
    const cleaningTables = tables.filter(t => t.status === "Tozalanmoqda").length;
    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    const itemSales = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemSales[item.id]) {
          itemSales[item.id] = { name: item.name, count: 0, totalQuantity: 0 };
        }
        itemSales[item.id].count += 1;
        itemSales[item.id].totalQuantity += item.quantity;
      });
    });
    const bestSellers = Object.values(itemSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    const recentOrders = [...todayOrders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return { totalTables, freeTables, occupiedTables, reservedTables, cleaningTables, totalOrders, totalRevenue, bestSellers, recentOrders };
  }, [tables, todayOrders]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Bosh sahifa</h2>
        <span className="dashboard-date">{today}</span>
      </div>

      <div className="stats">
        <div className="stat revenue">
          <div className="stat-icon"><MdAttachMoney /></div>
          <div className="stat-info">
            <span className="stat-label">Bugungi tushum</span>
            <span className="stat-value">{formatPrice(stats.totalRevenue)}</span>
          </div>
        </div>
        <div className="stat orders">
          <div className="stat-icon"><MdReceipt /></div>
          <div className="stat-info">
            <span className="stat-label">Buyurtmalar</span>
            <span className="stat-value">{stats.totalOrders} ta</span>
          </div>
        </div>
        <div className="stat tables">
          <div className="stat-icon"><MdTableRestaurant /></div>
          <div className="stat-info">
            <span className="stat-label">Stollar</span>
            <span className="stat-value">{stats.occupiedTables}/{stats.totalTables} <small>band</small></span>
          </div>
        </div>
        <div className="stat best">
          <div className="stat-icon"><MdStar /></div>
          <div className="stat-info">
            <span className="stat-label">Eng mashhur</span>
            <span className="stat-value">{stats.bestSellers[0]?.name || "—"}</span>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <div className="status free"><span className="dot"></span>Bo'sh: {stats.freeTables}</div>
        <div className="status occupied"><span className="dot"></span>Band: {stats.occupiedTables}</div>
        <div className="status reserved"><span className="dot"></span>Band qilingan: {stats.reservedTables}</div>
        <div className="status cleaning"><span className="dot"></span>Tozalanmoqda: {stats.cleaningTables}</div>
      </div>

      <div className="section">
        <h4 className="section-title"><MdStar className="section-icon" /> Eng ko'p sotilgan taomlar</h4>
        <div className="bestsellers">
          {stats.bestSellers.length > 0 ? (
            stats.bestSellers.map((item, index) => (
              <div key={index} className="bestseller">
                <span className="rank">{index + 1}</span>
                <span className="name">{item.name}</span>
                <span className="count">{item.totalQuantity} marta</span>
              </div>
            ))
          ) : (
            <p className="empty">Hozircha sotuvlar mavjud emas</p>
          )}
        </div>
      </div>

      <div className="section">
        <h4 className="section-title"><MdAccessTime className="section-icon" /> So'nggi buyurtmalar</h4>
        <div className="recent">
          {stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order, index) => (
              <div key={index} className="recent-item">
                <span className="table">{order.tableName}</span>
                <span className="items">{order.items.map(item => item.name).join(", ")}</span>
                <span className="total">{formatPrice(order.total)}</span>
                <span className="badge">{order.status}</span>
              </div>
            ))
          ) : (
            <p className="empty">Hozircha buyurtmalar mavjud emas</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;