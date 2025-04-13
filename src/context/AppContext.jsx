import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tables, setTables] = useState([
    { id: 1, name: "Stol 1", orders: [], waiter: "", status: "Bo'sh" },
    { id: 2, name: "Stol 2", orders: [], waiter: "", status: "Bo'sh" },
    { id: 3, name: "Stol 3", orders: [], waiter: "", status: "Bo'sh" },
    { id: 4, name: "Stol 4", orders: [], waiter: "", status: "Bo'sh" },
    { id: 5, name: "Stol 5", orders: [], waiter: "", status: "Bo'sh" },
    { id: 6, name: "Stol 6", orders: [], waiter: "", status: "Bo'sh" },
    { id: 7, name: "Stol 7", orders: [], waiter: "", status: "Bo'sh" },
    { id: 8, name: "Stol 8", orders: [], waiter: "", status: "Bo'sh" },
    { id: 9, name: "Stol 9", orders: [], waiter: "", status: "Bo'sh" },
    { id: 10, name: "Stol 10", orders: [], waiter: "", status: "Bo'sh" },
    
    { id: 11, name: "Stol 11", orders: [], waiter: "", status: "Bo'sh" },
    { id: 12, name: "Stol 12", orders: [], waiter: "", status: "Bo'sh" },
    { id: 13, name: "Stol 13", orders: [], waiter: "", status: "Bo'sh" },
    { id: 14, name: "Stol 14", orders: [], waiter: "", status: "Bo'sh" },
    { id: 15, name: "Stol 15", orders: [], waiter: "", status: "Bo'sh" },
    { id: 16, name: "Stol 16", orders: [], waiter: "", status: "Bo'sh" },
    { id: 17, name: "Stol 17", orders: [], waiter: "", status: "Bo'sh" },
    { id: 18, name: "Stol 18", orders: [], waiter: "", status: "Bo'sh" },
    { id: 19, name: "Stol 19", orders: [], waiter: "", status: "Bo'sh" },
    { id: 20, name: "Stol 20", orders: [], waiter: "", status: "Bo'sh" },
    { id: 21, name: "Stol 21", orders: [], waiter: "", status: "Bo'sh" },
    { id: 22, name: "Stol 22", orders: [], waiter: "", status: "Bo'sh" },
    { id: 23, name: "Stol 23", orders: [], waiter: "", status: "Bo'sh" },
    { id: 24, name: "Stol 24", orders: [], waiter: "", status: "Bo'sh" },
    { id: 25, name: "Stol 25", orders: [], waiter: "", status: "Bo'sh" },
    { id: 26, name: "Stol 26", orders: [], waiter: "", status: "Bo'sh" },
    { id: 27, name: "Stol 27", orders: [], waiter: "", status: "Bo'sh" },
    { id: 28, name: "Stol 28", orders: [], waiter: "", status: "Bo'sh" },
    { id: 29, name: "Stol 29", orders: [], waiter: "", status: "Bo'sh" },
    { id: 30, name: "Stol 30", orders: [], waiter: "", status: "Bo'sh" }
  ]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [user, setUser] = useState(null); // Assume user.role = "admin" for boss
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [menu, setMenu] = useState([
    { id: 1, name: "Osh", price: 25000, category: "Asosiy taom", isBestSeller: false },
    { id: 2, name: "Cola", price: 5000, category: "Ichimlik", isBestSeller: true },
    { id: 3, name: "Keks", price: 10000, category: "Desert", isBestSeller: false },
    { id: 4, name: "Shashlik", price: 30000, category: "Asosiy taom", isBestSeller: true },
    { id: 5, name: "Lag'mon", price: 22000, category: "Asosiy taom", isBestSeller: false },
    { id: 6, name: "Pepsi", price: 6000, category: "Ichimlik", isBestSeller: false },
    { id: 7, name: "Fanta", price: 5500, category: "Ichimlik", isBestSeller: false },
    { id: 8, name: "Tiramisu", price: 18000, category: "Desert", isBestSeller: true },
    { id: 9, name: "Napoleon tort", price: 15000, category: "Desert", isBestSeller: false },
    { id: 10, name: "Grechka", price: 20000, category: "Asosiy taom", isBestSeller: false },
    { id: 11, name: "Achchiq salat", price: 8000, category: "Salat", isBestSeller: false },
    { id: 12, name: "Olivye", price: 10000, category: "Salat", isBestSeller: true },
    { id: 13, name: "Sharbat", price: 4000, category: "Ichimlik", isBestSeller: false },
    { id: 14, name: "Qatiqli salat", price: 7000, category: "Salat", isBestSeller: false },
    { id: 15, name: "Choy", price: 2000, category: "Ichimlik", isBestSeller: true }
  ]);
  
  const [dailyReport, setDailyReport] = useState({
    ordersCount: 0,
    totalRevenue: 0,
    bestSellers: [],
  });
  const [lastMessageId, setLastMessageId] = useState(null);
  const [lastMessageDate, setLastMessageDate] = useState(null);

  const TELEGRAM_BOT_TOKEN = "8154384849:AAHMmi4MZIJ0fiXRF2Yrfw04G3EA4Jo07o0";
  const CHAT_ID = "7412640853";

  // Load data from localStorage
  useEffect(() => {
    const savedTables = localStorage.getItem("tables");
    const savedOrdersHistory = localStorage.getItem("ordersHistory");
    const savedMenu = localStorage.getItem("menu");
    const savedDailyReport = localStorage.getItem("dailyReport");
    const savedLastMessageId = localStorage.getItem("lastMessageId");
    const savedLastMessageDate = localStorage.getItem("lastMessageDate");

    if (savedTables) setTables(JSON.parse(savedTables));
    if (savedOrdersHistory) setOrdersHistory(JSON.parse(savedOrdersHistory));
    if (savedMenu) setMenu(JSON.parse(savedMenu));
    if (savedDailyReport) setDailyReport(JSON.parse(savedDailyReport));
    if (savedLastMessageId) setLastMessageId(JSON.parse(savedLastMessageId));
    if (savedLastMessageDate) setLastMessageDate(JSON.parse(savedLastMessageDate));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("tables", JSON.stringify(tables));
    localStorage.setItem("ordersHistory", JSON.stringify(ordersHistory));
    localStorage.setItem("menu", JSON.stringify(menu));
    localStorage.setItem("dailyReport", JSON.stringify(dailyReport));
    localStorage.setItem("lastMessageId", JSON.stringify(lastMessageId));
    localStorage.setItem("lastMessageDate", JSON.stringify(lastMessageDate));
  }, [tables, ordersHistory, menu, dailyReport, lastMessageId, lastMessageDate]);

  const selectTable = (tableId) => {
    setSelectedTableId(tableId);
  };

  const addTable = (name) => {
    const newTable = {
      id: Math.max(0, ...tables.map((t) => t.id)) + 1,
      name,
      orders: [],
      waiter: "",
      status: "Bo'sh",
    };
    setTables([...tables, newTable]);
  };

  const deleteTable = (id) => {
    setTables(tables.filter((table) => table.id !== id));
    if (selectedTableId === id) setSelectedTableId(null);
  };

  const updateTableWaiter = (id, waiter) => {
    setTables(tables.map((table) => (table.id === id ? { ...table, waiter } : table)));
  };

  const addToOrder = (item) => {
    if (!selectedTableId) {
      alert("Iltimos, avval stol tanlang!");
      return;
    }

    const newTables = tables.map((table) => {
      if (table.id === selectedTableId) {
        const existingItemIndex = table.orders.findIndex((order) => order.id === item.id);
        if (existingItemIndex >= 0) {
          const newOrders = [...table.orders];
          newOrders[existingItemIndex].quantity += 1;
          return { ...table, orders: newOrders, status: "Zakaz qo'shildi" };
        }
        return {
          ...table,
          orders: [...table.orders, { ...item, quantity: 1 }],
          status: "Zakaz qo'shildi",
        };
      }
      return table;
    });
    setTables(newTables);
  };

  const updateOrder = (tableId, index, quantity) => {
    const newTables = tables.map((table) => {
      if (table.id === tableId) {
        const newOrders = [...table.orders];
        newOrders[index].quantity = quantity;
        return { ...table, orders: newOrders };
      }
      return table;
    });
    setTables(newTables);
  };

  const removeFromOrder = (tableId, index) => {
    const newTables = tables.map((table) => {
      if (table.id === tableId) {
        const newOrders = table.orders.filter((_, i) => i !== index);
        return {
          ...table,
          orders: newOrders,
          status: newOrders.length > 0 ? "Zakaz qo'shildi" : "Bo'sh",
        };
      }
      return table;
    });
    setTables(newTables);
  };

  const sendTelegramMessage = async (text, options = {}) => {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
          ...options,
        }
      );
      return response.data.result.message_id;
    } catch (error) {
      console.error("Telegram xabarni yuborishda xato:", error);
    }
  };

  const editTelegramMessage = async (messageId, text) => {
    try {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
        {
          chat_id: CHAT_ID,
          message_id: messageId,
          text,
          parse_mode: "HTML",
        }
      );
    } catch (error) {
      console.error("Telegram xabarni tahrirlashda xato:", error);
    }
  };

  const getTopSellingItems = (orders) => {
    const itemCounts = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.id]) {
          itemCounts[item.id] = {
            count: 0,
            totalQuantity: 0,
            name: item.name,
            price: item.price,
          };
        }
        itemCounts[item.id].count += 1;
        itemCounts[item.id].totalQuantity += item.quantity;
      });
    });
    return Object.values(itemCounts)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 3);
  };

  const generateReceiptPDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Sodiqjon Restorani", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text(`Chek #${order.id}`, 20, 40);
    doc.text(`Stol: ${order.tableName} (ID: ${order.tableId})`, 20, 50);
    doc.text(`Ofitsiant: ${order.waiter || "Belgilanmagan"}`, 20, 60);
    doc.text(`Sana: ${new Date(order.date).toLocaleString("uz-UZ")}`, 20, 70);
    doc.setFontSize(12);
    doc.text("Buyurtma:", 20, 90);
    let y = 100;
    order.items.forEach((item) => {
      doc.text(
        `${item.name} x ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} so'm`,
        30,
        y
      );
      y += 10;
    });
    doc.setFontSize(14);
    doc.text(`Jami: ${order.total.toLocaleString()} so'm`, 20, y + 10);
    doc.save(`Sodiqjon_Chek_${order.id}.pdf`);
  };

  const completeOrder = async (tableId, paymentConfirmed = false) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.orders.length === 0) {
      alert("Buyurtma bo'sh!");
      return;
    }

    const total = table.orders.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = {
      id: Date.now(),
      items: [...table.orders],
      total,
      date: new Date(),
      tableId,
      tableName: table.name,
      waiter: table.waiter,
      status: paymentConfirmed ? "To'lov qilindi" : "To'lov kutilmoqda",
    };

    const newOrdersHistory = [...ordersHistory, newOrder];
    setOrdersHistory(newOrdersHistory);

    // Update tables
    const newTables = tables.map((t) => {
      if (t.id === tableId) {
        return {
          ...t,
          orders: [],
          status: paymentConfirmed ? "Yopish" : "To'lov kutilmoqda",
        };
      }
      return t;
    });
    setTables(newTables);
    setSelectedTableId(null);

    // Get today's date
    const today = new Date().toLocaleDateString("uz-UZ");
    const todayOrders = newOrdersHistory.filter(
      (order) => new Date(order.date).toLocaleDateString("uz-UZ") === today
    );

    // Update daily report
    const ordersCount = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const topSellers = getTopSellingItems(todayOrders);
    const bestSellers = topSellers.map((item) => ({
      name: item.name,
      count: item.totalQuantity,
      total: item.totalQuantity * item.price,
    }));

    setDailyReport({ ordersCount, totalRevenue, bestSellers });

    // Prepare daily report message
    const orderDetailsText = todayOrders
      .map((order, index) => {
        const itemsList = order.items
          .map((item) => `- ${item.name} x ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} so'm`)
          .join("\n");
        return `<b>Buyurtma #${index + 1}</b>\n` +
               `📅 Sana: ${new Date(order.date).toLocaleString("uz-UZ")}\n` +
               `🍽️ Stol: ${order.tableName} (ID: ${order.tableId})\n` +
               `👨‍🍳 Ofitsiant: ${order.waiter || "Belgilanmagan"}\n` +
               `📝 Buyurtma:\n${itemsList}\n` +
               `💵 Jami: ${order.total.toLocaleString()} so'm\n` +
               `📌 Status: ${order.status}\n`;
      })
      .join("\n");

    const bestSellersText = bestSellers
      .map((item, index) => `${index + 1}. ${item.name} - ${item.count} marta (${item.total.toLocaleString()} so'm)`)
      .join("\n");

    const reportText =
      `<b>📊 Sodiqjon Restorani - Bugungi hisobot (${today}):</b>\n` +
      `📌 Buyurtmalar soni: ${ordersCount}\n` +
      `💰 Umumiy daromad: ${totalRevenue.toLocaleString()} so'm\n\n` +
      `<b>🏆 Eng ko'p sotilganlar:</b>\n${bestSellersText || "Hozircha ma'lumot yo'q"}\n\n` +
      `<b>📋 Buyurtma tafsilotlari:</b>\n${orderDetailsText || "Hozircha buyurtma yo'q"}`;

    // Check if the last message was sent today
    const isSameDay = lastMessageDate === today;

    if (!lastMessageId || !isSameDay) {
      const messageId = await sendTelegramMessage(reportText);
      setLastMessageId(messageId);
      setLastMessageDate(today);
    } else {
      await editTelegramMessage(lastMessageId, reportText);
    }
  };

  const confirmPayment = (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const order = ordersHistory.find(
      (o) => o.tableId === tableId && o.status === "To'lov kutilmoqda"
    );
    if (order) {
      setOrdersHistory(
        ordersHistory.map((o) =>
          o.id === order.id ? { ...o, status: "To'lov qilindi" } : o
        )
      );
      setTables(
        tables.map((t) =>
          t.id === tableId ? { ...t, status: "Yopish" } : t
        )
      );
    }
  };

  const addMenuItem = (item) => {
    const newId = Math.max(0, ...menu.map((m) => m.id)) + 1;
    setMenu([...menu, { ...item, id: newId, isBestSeller: item.isBestSeller || false }]);
  };

  const updateMenuItem = (id, updatedItem) => {
    setMenu(menu.map((item) => (item.id === id ? { ...item, ...updatedItem } : item)));
  };

  const deleteMenuItem = (id) => {
    setMenu(menu.filter((item) => item.id !== id));
  };

  const getOrderStats = () => {
    const itemStats = {};
    const tableStats = {};

    ordersHistory.forEach((order) => {
      if (!tableStats[order.tableId]) {
        tableStats[order.tableId] = {
          name: order.tableName,
          count: 0,
          total: 0,
        };
      }
      tableStats[order.tableId].count += 1;
      tableStats[order.tableId].total += order.total;

      order.items.forEach((item) => {
        if (!itemStats[item.id]) {
          itemStats[item.id] = {
            name: item.name,
            count: 0,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        itemStats[item.id].count += 1;
        itemStats[item.id].totalQuantity += item.quantity;
        itemStats[item.id].totalRevenue += item.price * item.quantity;
      });
    });

    return {
      items: Object.values(itemStats).sort((a, b) => b.count - a.count),
      tables: Object.values(tableStats).sort((a, b) => b.count - a.count),
    };
  };

  return (
    <AppContext.Provider
      value={{
        tables,
        selectedTableId,
        selectTable,
        addTable,
        deleteTable,
        updateTableWaiter,
        addToOrder,
        updateOrder,
        removeFromOrder,
        completeOrder,
        confirmPayment,
        generateReceiptPDF,
        user,
        setUser,
        ordersHistory,
        menu,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        dailyReport,
        getOrderStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


