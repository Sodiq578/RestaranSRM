import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
 import Osh from "../assets/ovqat/osh.png";
import Lagmon from "../assets/ovqat/lagmon.jpg";
import Chuchvara from "../assets/ovqat/chuchvara.png";
import Manti from "../assets/ovqat/manti.png";
import Norin from "../assets/ovqat/norin.png";
import Olive from "../assets/ovqat/olive.png";
import Shashlik from "../assets/ovqat/shashlik.png";
import Somsa from "../assets/ovqat/somsa.png";
import Sveji from "../assets/ovqat/sveji.png";

export const AppContext = createContext();

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const AppProvider = ({ children }) => {
  const [tables, setTables] = useState([
    { id: 1, name: "Stol 1", orders: [], waiter: "", status: "Bo'sh" },
    { id: 2, name: "Stol 2", orders: [], waiter: "", status: "Bo'sh" },
    // ... (other tables as in your original code)
    { id: 31, name: "Yetkazib berish", orders: [], waiter: "", status: "Bo'sh" },
  ]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [user, setUser] = useState(null);
  const [ordersHistory, setOrdersHistory] = useState([]);
const [menu, setMenu] = useState([
  {
    id: 1,
    name: "Osh",
    price: 25000,
    category: "Asosiy taom",
    isBestSeller: true,
    image: Osh
  },
  {
    id: 2,
    name: "Lag'mon",
    price: 20000,
    category: "Asosiy taom",
    isBestSeller: false,
    image: Lagmon
  },
  {
    id: 3,
    name: "Chuchvara",
    price: 18000,
    category: "Asosiy taom",
    isBestSeller: false,
    image: Chuchvara
  },
  {
    id: 4,
    name: "Manti",
    price: 19000,
    category: "Asosiy taom",
    isBestSeller: false,
    image: Manti
  },
  {
    id: 5,
    name: "Norin",
    price: 15000,
    category: "Asosiy taom",
    isBestSeller: true,
    image: Norin
  },
  {
    id: 6,
    name: "Salat Olivye",
    price: 12000,
    category: "Salat",
    isBestSeller: false,
    image: Olive
  },
  {
    id: 7,
    name: "Shashlik",
    price: 22000,
    category: "Asosiy taom",
    isBestSeller: false,
    image: Shashlik
  },
  {
    id: 8,
    name: "Somsa",
    price: 8000,
    category: "Nonushta",
    isBestSeller: false,
    image: Somsa
  },
  {
    id: 9,
    name: "Salat Sveji",
    price: 10000,
    category: "Salat",
    isBestSeller: false,
    image: Sveji
  }
]);


  const [dailyReport, setDailyReport] = useState({
    ordersCount: 0,
    totalRevenue: 0,
    bestSellers: [],
  });
  const [lastMessageId, setLastMessageId] = useState(null);
  const [lastMessageDate, setLastMessageDate] = useState(null);
  const [sentOrders, setSentOrders] = useState({});

  const TELEGRAM_BOT_TOKEN = "7885205848:AAEcgs2vXjZqyV40f6Jvl8Rj1OMq0r7QGkA";
  const MAIN_REPORTING_CHAT_ID = "-4646692596";
  const BAR_CHAT_ID = "-4646692596";
  const SALATCHILAR_CHAT_ID = "-4753754534";
  const OSHXONA_CHAT_ID = "-4686557731";

  useEffect(() => {
    const savedTables = localStorage.getItem("tables");
    const savedOrdersHistory = localStorage.getItem("ordersHistory");
    const savedMenu = localStorage.getItem("menu");
    const savedDailyReport = localStorage.getItem("dailyReport");
    const savedLastMessageId = localStorage.getItem("lastMessageId");
    const savedLastMessageDate = localStorage.getItem("lastMessageDate");
    const savedSentOrders = localStorage.getItem("sentOrders");

    if (savedTables) setTables(JSON.parse(savedTables));
    if (savedOrdersHistory) setOrdersHistory(JSON.parse(savedOrdersHistory));
    if (savedMenu) setMenu(JSON.parse(savedMenu));
    if (savedDailyReport) setDailyReport(JSON.parse(savedDailyReport));
    if (savedLastMessageId) setLastMessageId(JSON.parse(savedLastMessageId));
    if (savedLastMessageDate) setLastMessageDate(JSON.parse(savedLastMessageDate));
    if (savedSentOrders) setSentOrders(JSON.parse(savedSentOrders));
  }, []);

  useEffect(() => {
    localStorage.setItem("tables", JSON.stringify(tables));
    localStorage.setItem("ordersHistory", JSON.stringify(ordersHistory));
    localStorage.setItem("menu", JSON.stringify(menu));
    localStorage.setItem("dailyReport", JSON.stringify(dailyReport));
    localStorage.setItem("lastMessageId", JSON.stringify(lastMessageId));
    localStorage.setItem("lastMessageDate", JSON.stringify(lastMessageDate));
    localStorage.setItem("sentOrders", JSON.stringify(sentOrders));
  }, [tables, ordersHistory, menu, dailyReport, lastMessageId, lastMessageDate, sentOrders]);

  const addMenuItem = (item) => {
    setMenu([...menu, { id: Date.now(), ...item }]);
  };

  const updateMenuItem = (id, updatedItem) => {
    setMenu(menu.map((item) => (item.id === id ? { ...item, ...updatedItem } : item)));
  };

  const deleteMenuItem = (id) => {
    setMenu(menu.filter((item) => item.id !== id));
  };

  const addTable = (name) => {
    setTables([...tables, { id: Date.now(), name, orders: [], waiter: "", status: "Bo'sh" }]);
  };

  const deleteTable = (id) => {
    setTables(tables.filter((table) => table.id !== id));
  };

  const updateTableWaiter = (id, waiter) => {
    setTables(tables.map((table) => (table.id === id ? { ...table, waiter } : table)));
  };

  const selectTable = (tableId) => {
    setSelectedTableId(tableId);
  };

  const addToOrder = async (item) => {
    if (!selectedTableId) {
      alert("Iltimos, avval stol tanlang!");
      return;
    }

    const newTables = tables.map((t) => {
      if (t.id === selectedTableId) {
        const existingItemIndex = t.orders.findIndex((order) => order.id === item.id);
        let newOrders;
        if (existingItemIndex >= 0) {
          newOrders = [...t.orders];
          newOrders[existingItemIndex].quantity += 1;
        } else {
          const menuItem = menu.find((m) => m.id === item.id);
          newOrders = [...t.orders, { ...item, quantity: 1, category: menuItem?.category || "Other" }];
        }
        return {
          ...t,
          orders: newOrders,
          status: newOrders.length > 0 ? "Zakaz qo'shildi" : "Bo'sh",
        };
      }
      return t;
    });

    setTables(newTables);
  };

  const updateOrder = async (tableId, index, quantity) => {
    const newTables = tables.map((table) => {
      if (table.id === tableId) {
        const newOrders = [...table.orders];
        newOrders[index].quantity = quantity;
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

  const removeFromOrder = async (tableId, index) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || index >= table.orders.length) {
      alert("Buyurtma topilmadi!");
      return false;
    }

    const removedItem = table.orders[index];
    const newTables = tables.map((t) => {
      if (t.id === tableId) {
        const newOrders = t.orders.filter((_, i) => i !== index);
        return {
          ...t,
          orders: newOrders,
          status: newOrders.length > 0 ? "Zakaz qo'shildi" : "Bo'sh",
        };
      }
      return t;
    });

    setSentOrders((prev) => {
      const updated = { ...prev };
      if (updated[tableId]) {
        updated[tableId] = updated[tableId].filter((order) => order.id !== removedItem.id);
        if (updated[tableId].length === 0) delete updated[tableId];
      }
      return updated;
    });

    setTables(newTables);
    return true;
  };

  const sendTelegramMessage = async (text, chatId, options = {}) => {
    if (!text || !chatId) {
      console.error("Xabar matni yoki chat ID bo'sh:", { text, chatId });
      throw new Error("Xabar matni yoki chat ID bo'sh");
    }
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: chatId,
          text: text.slice(0, 4096),
          parse_mode: "HTML",
          ...options,
        }
      );
      return response.data.result.message_id;
    } catch (error) {
      console.error("Telegram xabarni yuborishda xato:", error.response?.data || error.message);
      throw new Error("Telegram xabarni yuborib bo'lmadi: " + (error.response?.data?.description || error.message));
    }
  };

  const sendOrdersToPreparation = async (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.orders.length === 0) {
      alert("Buyurtma bo'sh!");
      return false;
    }

    const sentForTable = sentOrders[tableId] || [];
    const newOrders = table.orders.filter(
      (order) => !sentForTable.some((sent) => sent.id === order.id && sent.quantity === order.quantity)
    );

    if (newOrders.length === 0 && table.status === "Tayyorlashga yuborildi") {
      alert("Yangi buyurtmalar yo'q!");
      return false;
    }

    const barItems = newOrders.filter((item) => item.category === "Ichimlik");
    const saladItems = newOrders.filter((item) => item.category === "Salat");
    const kitchenItems = newOrders.filter(
      (item) => item.category === "Asosiy taom" || item.category === "Desert" || item.category === "Other"
    );

    const formatItemsList = (items) =>
      items.length
        ? items
            .map((item) => `- ${item.name} x ${item.quantity} (${formatPrice(item.price * item.quantity)})`)
            .join("\n")
        : "Buyurtmalar yo'q";

    try {
      if (barItems.length > 0) {
        const barMessage = `
<b>🍹 Bar uchun yangi buyurtma - ${table.name} (ID: ${table.id})</b>
📝 Ro'yxat:
${formatItemsList(barItems)}
👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
        `;
        await sendTelegramMessage(barMessage, BAR_CHAT_ID);
      }

      if (saladItems.length > 0) {
        const saladMessage = `
<b>🥗 Salatchilar uchun yangi buyurtma - ${table.name} (ID: ${table.id})</b>
📝 Ro'yxat:
${formatItemsList(saladItems)}
👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
        `;
        await sendTelegramMessage(saladMessage, SALATCHILAR_CHAT_ID);
      }

      if (kitchenItems.length > 0) {
        const kitchenMessage = `
<b>🍲 Oshxona uchun yangi buyurtma - ${table.name} (ID: ${table.id})</b>
📝 Ro'yxat:
${formatItemsList(kitchenItems)}
👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
        `;
        await sendTelegramMessage(kitchenMessage, OSHXONA_CHAT_ID);
      }

      const total = table.orders.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const fullMessage = `
<b>📋 Umumiy buyurtma yangilandi - ${table.name} (ID: ${table.id})</b>
📝 Ro'yxat:
${formatItemsList(table.orders)}
💵 Jami: ${formatPrice(total)}
👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
📌 Status: Tayyorlashga yuborildi
      `;
      await sendTelegramMessage(fullMessage, MAIN_REPORTING_CHAT_ID);

      setSentOrders((prev) => ({
        ...prev,
        [tableId]: table.orders.map((order) => ({ ...order })),
      }));

      setTables(
        tables.map((t) =>
          t.id === tableId ? { ...t, status: "Tayyorlashga yuborildi" } : t
        )
      );
      return true;
    } catch (error) {
      alert("Buyurtmalarni yuborishda xato yuz berdi: " + error.message);
      return false;
    }
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

    const newTables = tables.map((t) => {
      if (t.id === tableId) {
        return {
          ...t,
          orders: [],
          status: paymentConfirmed ? "Bo'sh" : "To'lov kutilmoqda",
        };
      }
      return t;
    });
    setTables(newTables);
    setSelectedTableId(null);

    try {
      const completionMessage = `
<b>✅ Buyurtma Yakunlandi - ${table.name} (ID: ${table.id})</b>
💵 Jami: ${formatPrice(total)}
📌 To'lov holati: ${paymentConfirmed ? "To'langan" : "To'lov kutilmoqda"}
👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
      `;
      await sendTelegramMessage(completionMessage, MAIN_REPORTING_CHAT_ID);

      const today = new Date().toLocaleDateString("uz-UZ");
      const todayOrders = newOrdersHistory.filter(
        (order) => new Date(order.date).toLocaleDateString("uz-UZ") === today
      );

      const ordersCount = todayOrders.length;
      const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
      const topSellers = getTopSellingItems(todayOrders);
      const bestSellers = topSellers.map((item) => ({
        name: item.name,
        count: item.totalQuantity,
        total: item.totalQuantity * item.price,
      }));

      setDailyReport({ ordersCount, totalRevenue, bestSellers });

      const orderDetailsText = todayOrders
        .map((order, index) => {
          const itemsList = order.items
            .map((item) => `- ${item.name} x ${item.quantity} = ${formatPrice(item.price * item.quantity)}`)
            .join("\n");
          return `<b>Buyurtma #${index + 1}</b>\n` +
                 `📅 Sana: ${new Date(order.date).toLocaleString("uz-UZ")}\n` +
                 `🍽️ Stol: ${order.tableName} (ID: ${order.tableId})\n` +
                 `👨‍🍳 Ofitsiant: ${order.waiter || "Belgilanmagan"}\n` +
                 `📝 Buyurtma:\n${itemsList}\n` +
                 `💵 Jami: ${formatPrice(order.total)}\n` +
                 `📌 Status: ${order.status}\n`;
        })
        .join("\n");

      const bestSellersText = bestSellers
        .map((item, index) => `${index + 1}. ${item.name} - ${item.count} marta (${formatPrice(item.total)})`)
        .join("\n");

      const reportText =
        `<b>📊 Sodiqjon Restorani - Bugungi hisobot (${today}):</b>\n` +
        `📌 Buyurtmalar soni: ${ordersCount}\n` +
        `💰 Umumiy daromad: ${formatPrice(totalRevenue)}\n\n` +
        `<b>🏆 Eng ko'p sotilganlar:</b>\n${bestSellersText || "Hozircha ma'lumot yo'q"}\n\n` +
        `<b>📋 Buyurtma tafsilotlari:</b>\n${orderDetailsText || "Hozircha buyurtma yo'q"}`;

      const isSameDay = lastMessageDate === today;

      if (!lastMessageId || !isSameDay) {
        const messageId = await sendTelegramMessage(reportText, MAIN_REPORTING_CHAT_ID);
        setLastMessageId(messageId);
        setLastMessageDate(today);
      } else {
        await editTelegramMessage(lastMessageId, reportText);
      }
    } catch (error) {
      alert("Hisobot yuborishda xato: " + error.message);
    }
  };

  const editTelegramMessage = async (messageId, text) => {
    try {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
        {
          chat_id: MAIN_REPORTING_CHAT_ID,
          message_id: messageId,
          text: text.slice(0, 4096),
          parse_mode: "HTML",
        }
      );
    } catch (error) {
      console.error("Telegram xabarni tahrirlashda xato:", error.response?.data || error.message);
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

  return (
    <AppContext.Provider
      value={{
        tables,
        selectedTableId,
        selectTable,
        addToOrder,
        updateOrder,
        removeFromOrder,
        sendOrdersToPreparation,
        completeOrder,
        menu,
        user,
        setUser,
        ordersHistory,
        dailyReport,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addTable,
        deleteTable,
        updateTableWaiter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};