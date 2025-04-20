import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";

export const AppContext = createContext();

// Narxlarni so‘mda formatlash
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
    { id: 30, name: "Stol 30", orders: [], waiter: "", status: "Bo'sh" },
    { id: 31, name: "Yetkazib berish", orders: [], waiter: "", status: "Bo'sh" },
  ]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [user, setUser] = useState(null);
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
    { id: 15, name: "Choy", price: 2000, category: "Ichimlik", isBestSeller: true },
  ]);
  const [dailyReport, setDailyReport] = useState({
    ordersCount: 0,
    totalRevenue: 0,
    bestSellers: [],
  });
  const [lastMessageId, setLastMessageId] = useState(null);
  const [lastMessageDate, setLastMessageDate] = useState(null);
  const [sentOrders, setSentOrders] = useState({}); // Yuborilgan buyurtmalarni saqlash

  // Telegram bot sozlamalari
  const TELEGRAM_BOT_TOKEN = "7885205848:AAEcgs2vXjZqyV40f6Jvl8Rj1OMq0r7QGkA";
  const MAIN_REPORTING_CHAT_ID = "-4646692596"; // Umumiy hisobot (Bar Zakaz Grupa)
  const BAR_CHAT_ID = "-4646692596"; // Bar Zakaz Grupa
  const SALATCHILAR_CHAT_ID = "-4753754534"; // Salatchilar Zakaz Grupa
  const OSHXONA_CHAT_ID = "-4686557731"; // Oshxona Zakaz Grupa

  // LocalStorage'dan ma'lumotlarni yuklash
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

  // Ma'lumotlarni LocalStorage'ga saqlash
  useEffect(() => {
    localStorage.setItem("tables", JSON.stringify(tables));
    localStorage.setItem("ordersHistory", JSON.stringify(ordersHistory));
    localStorage.setItem("menu", JSON.stringify(menu));
    localStorage.setItem("dailyReport", JSON.stringify(dailyReport));
    localStorage.setItem("lastMessageId", JSON.stringify(lastMessageId));
    localStorage.setItem("lastMessageDate", JSON.stringify(lastMessageDate));
    localStorage.setItem("sentOrders", JSON.stringify(sentOrders));
  }, [tables, ordersHistory, menu, dailyReport, lastMessageId, lastMessageDate, sentOrders]);

  const selectTable = (tableId) => {
    setSelectedTableId(tableId);
  };

  const addToOrder = async (item) => {
    if (!selectedTableId) {
      alert("Iltimos, avval stol tanlang!");
      return;
    }

    const table = tables.find((t) => t.id === selectedTableId);
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

    try {
      // Yangi taomni Telegram guruhiga yuborish
      const menuItem = menu.find((m) => m.id === item.id);
      const category = menuItem?.category || "Other";
      let chatId;
      if (category === "Ichimlik") chatId = BAR_CHAT_ID;
      else if (category === "Salat") chatId = SALATCHILAR_CHAT_ID;
      else chatId = OSHXONA_CHAT_ID;

      const addMessage = `
<b>➕ Yangi taom qo'shildi - ${table.name} (ID: ${table.id})</b>
📝 Taom: ${item.name} x 1 (${formatPrice(item.price)})
👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
      `;
      await sendTelegramMessage(addMessage, chatId);

      // Umumiy hisobot guruhiga yangilangan buyurtma yuborish
      const total = newTables.find((t) => t.id === selectedTableId).orders.reduce(
        (sum, order) => sum + order.price * order.quantity,
        0
      );
      const updateMessage = `
<b>📋 Buyurtma yangilandi - ${table.name} (ID: ${table.id})</b>
➕ Qo'shildi: ${item.name} x 1
📝 Buyurtmalar:
${newTables
  .find((t) => t.id === selectedTableId)
  .orders.map((order) => `- ${order.name} x ${order.quantity} (${formatPrice(order.price * order.quantity)})`).join("\n")}
💵 Jami: ${formatPrice(total)}
👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
      `;
      await sendTelegramMessage(updateMessage, MAIN_REPORTING_CHAT_ID);

      setTables(newTables);
    } catch (error) {
      alert("Taomni qo'shishda xato: " + error.message);
    }
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

    try {
      // Telegram xabarini mos guruhga yuborish
      let chatId;
      if (removedItem.category === "Ichimlik") {
        chatId = BAR_CHAT_ID;
      } else if (removedItem.category === "Salat") {
        chatId = SALATCHILAR_CHAT_ID;
      } else {
        chatId = OSHXONA_CHAT_ID;
      }

      const removeMessage = `
<b>🗑️ Taom bekor qilindi - ${table.name} (ID: ${table.id})</b>
📝 Taom: ${removedItem.name} x ${removedItem.quantity} (${formatPrice(removedItem.price * removedItem.quantity)})
👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
      `;
      await sendTelegramMessage(removeMessage, chatId);

      // Umumiy hisobot guruhiga xabar yuborish
      const total = newTables.find((t) => t.id === tableId).orders.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const updateMessage = `
<b>📋 Buyurtma yangilandi - ${table.name} (ID: ${table.id})</b>
🗑️ Bekor qilindi: ${removedItem.name} x ${removedItem.quantity}
📝 Qolgan buyurtmalar:
${newTables
  .find((t) => t.id === tableId)
  .orders.map((item) => `- ${item.name} x ${item.quantity} (${formatPrice(item.price * item.quantity)})`).join("\n") || "Buyurtmalar yo'q"}
💵 Jami: ${formatPrice(total)}
👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
      `;
      await sendTelegramMessage(updateMessage, MAIN_REPORTING_CHAT_ID);

      // Yuborilgan buyurtmalardan olib tashlash
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
    } catch (error) {
      alert("Taomni bekor qilishda xato: " + error.message);
      return false;
    }
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
          text: text.slice(0, 4096), // Telegram xabar uzunligi cheklovi
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

    // Yuborilmagan (yangi) buyurtmalarni aniqlash
    const sentForTable = sentOrders[tableId] || [];
    const newOrders = table.orders.filter(
      (order) => !sentForTable.some((sent) => sent.id === order.id && sent.quantity === order.quantity)
    );

    if (newOrders.length === 0 && table.status === "Tayyorlashga yuborildi") {
      alert("Yangi buyurtmalar yo'q!");
      return false;
    }

    // Kategoriyalar bo'yicha buyurtmalarni ajratish
    const barItems = newOrders.filter((item) => item.category === "Ichimlik");
    const saladItems = newOrders.filter((item) => item.category === "Salat");
    const kitchenItems = newOrders.filter(
      (item) => item.category === "Asosiy taom" || item.category === "Desert" || item.category === "Other"
    );

    // Buyurtmalarni formatlash
    const formatItemsList = (items) =>
      items.length
        ? items
            .map((item) => `- ${item.name} x ${item.quantity} (${formatPrice(item.price * item.quantity)})`)
            .join("\n")
        : "Buyurtmalar yo'q";

    try {
      // Bar guruhiga yuborish
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

      // Salatchilar guruhiga yuborish
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

      // Oshxona guruhiga yuborish
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

      // Umumiy hisobot guruhiga yuborish
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

      // Yuborilgan buyurtmalarni yangilash
      setSentOrders((prev) => ({
        ...prev,
        [tableId]: table.orders.map((order) => ({ ...order })),
      }));

      // Stol holatini yangilash
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

    // Stol holatini yangilash
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

    // Yakunlash xabarini yuborish
    try {
      const completionMessage = `
<b>✅ Buyurtma Yakunlandi - ${table.name} (ID: ${table.id})</b>
💵 Jami: ${formatPrice(total)}
📌 To'lov holati: ${paymentConfirmed ? "To'langan" : "To'lov kutilmoqda"}
👨‍🍳 Ofitsiant: ${table.waiter || "Belgilanmagan"}
🕒 Vaqt: ${new Date().toLocaleString("uz-UZ")}
      `;
      await sendTelegramMessage(completionMessage, MAIN_REPORTING_CHAT_ID);

      // Kunlik hisobotni yangilash
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

      // Telegram hisobot xabari
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};