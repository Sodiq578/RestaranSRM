// src/context/AppContext.jsx
import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import { 
  formatPrice, 
  formatItemsList,
  generateId,
  formatOrderId,
  safeFormatDate,
  isValidId,
  toStringId
} from "../utils/helpers";

// ============================================================
// RASMLAR IMPORT
// ============================================================
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

export const AppProvider = ({ children }) => {
  // ============================================================
  // 1. DEFAULT MA'LUMOTLAR (ID LAR STRING)
  // ============================================================
  const DEFAULT_TABLES = Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    name: `Stol ${i + 1}`,
    orders: [],
    waiter: "",
    status: "Bo'sh",
    seats: 4,
    startTime: null,
  }));

  const DEFAULT_CATEGORIES = [
    { id: "1", name: "Asosiy taom" },
    { id: "2", name: "Salat" },
    { id: "3", name: "Nonushta" },
    { id: "4", name: "Ichimlik" },
    { id: "5", name: "Desert" },
  ];

  const DEFAULT_MENU = [
    { id: "1", name: "Osh", price: 25000, category: "Asosiy taom", isBestSeller: true, image: Osh },
    { id: "2", name: "Lag'mon", price: 20000, category: "Asosiy taom", isBestSeller: false, image: Lagmon },
    { id: "3", name: "Chuchvara", price: 18000, category: "Asosiy taom", isBestSeller: false, image: Chuchvara },
    { id: "4", name: "Manti", price: 19000, category: "Asosiy taom", isBestSeller: false, image: Manti },
    { id: "5", name: "Norin", price: 15000, category: "Asosiy taom", isBestSeller: true, image: Norin },
    { id: "6", name: "Salat Olivye", price: 12000, category: "Salat", isBestSeller: false, image: Olive },
    { id: "7", name: "Shashlik", price: 22000, category: "Asosiy taom", isBestSeller: false, image: Shashlik },
    { id: "8", name: "Somsa", price: 8000, category: "Nonushta", isBestSeller: false, image: Somsa },
    { id: "9", name: "Salat Sveji", price: 10000, category: "Salat", isBestSeller: false, image: Sveji },
  ];

  // ============================================================
  // 2. STATE
  // ============================================================
  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem("tables");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return DEFAULT_TABLES;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return DEFAULT_CATEGORIES;
  });

  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem("menu");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return DEFAULT_MENU;
  });

  const [selectedTableId, setSelectedTableId] = useState(null);
  const [user, setUser] = useState(null);
  const [ordersHistory, setOrdersHistory] = useState(() => {
    const saved = localStorage.getItem("ordersHistory");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  const [sentOrders, setSentOrders] = useState(() => {
    const saved = localStorage.getItem("sentOrders");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });
  const [dailyReport, setDailyReport] = useState(() => {
    const saved = localStorage.getItem("dailyReport");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return { ordersCount: 0, totalRevenue: 0, bestSellers: [] }; }
    }
    return { ordersCount: 0, totalRevenue: 0, bestSellers: [] };
  });
  const [lastMessageId, setLastMessageId] = useState(() => {
    const saved = localStorage.getItem("lastMessageId");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [lastMessageDate, setLastMessageDate] = useState(() => {
    const saved = localStorage.getItem("lastMessageDate");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [kitchenOrders, setKitchenOrders] = useState(() => {
    const saved = localStorage.getItem("kitchenOrders");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // ============================================================
  // 3. TELEGRAM KONFIGURATSIYA
  // ============================================================
  const TELEGRAM_BOT_TOKEN = "7885205848:AAEcgs2vXjZqyV40f6Jvl8Rj1OMq0r7QGkA";
  const MAIN_REPORTING_CHAT_ID = "-4646692596";
  const BAR_CHAT_ID = "-4646692596";
  const SALATCHILAR_CHAT_ID = "-4753754534";
  const OSHXONA_CHAT_ID = "-4686557731";

  // ============================================================
  // 4. LOCALSTORAGE SYNC
  // ============================================================
  useEffect(() => {
    localStorage.setItem("tables", JSON.stringify(tables));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("ordersHistory", JSON.stringify(ordersHistory));
    localStorage.setItem("menu", JSON.stringify(menu));
    localStorage.setItem("dailyReport", JSON.stringify(dailyReport));
    localStorage.setItem("lastMessageId", JSON.stringify(lastMessageId));
    localStorage.setItem("lastMessageDate", JSON.stringify(lastMessageDate));
    localStorage.setItem("sentOrders", JSON.stringify(sentOrders));
    localStorage.setItem("kitchenOrders", JSON.stringify(kitchenOrders));
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [tables, categories, ordersHistory, menu, dailyReport, lastMessageId, lastMessageDate, sentOrders, kitchenOrders, notifications]);

  // ============================================================
  // 5. TELEGRAM FUNKSIYALAR
  // ============================================================
  const sendTelegramMessage = useCallback(async (text, chatId, options = {}) => {
    if (!text || !chatId) {
      console.warn('Xabar matni yoki chat ID bo\'sh');
      return null;
    }
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: chatId,
          text: text.slice(0, 4096),
          parse_mode: "HTML",
          ...options,
        },
        { timeout: 5000 }
      );
      return response.data.result?.message_id || null;
    } catch (error) {
      console.error("Telegram xatosi:", error.response?.data || error.message);
      return null;
    }
  }, []);

  const editTelegramMessage = useCallback(async (messageId, text) => {
    try {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
        {
          chat_id: MAIN_REPORTING_CHAT_ID,
          message_id: messageId,
          text: text.slice(0, 4096),
          parse_mode: "HTML",
        },
        { timeout: 5000 }
      );
    } catch (error) {
      console.error("Telegram tahrirlash xatosi:", error.response?.data || error.message);
    }
  }, []);

  // ============================================================
  // 6. NOTIFIKATSIYA FUNKSIYALAR
  // ============================================================
  const sendSystemNotification = useCallback((title, message, type = 'info') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🔔'
    });

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body: message,
          icon: '/logo192.png',
          tag: 'order-notification',
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200]
        });
        setTimeout(() => notification.close(), 10000);
      } catch (error) {
        console.log('Browser notification error:', error);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sendWaiterNotification = useCallback(async (order) => {
    const { tableName, waiter, items, tableId } = order;
    
    const messageText = `
🔔 <b>BUYURTMA TAYYOR!</b>
🍽️ <b>Stol:</b> ${tableName}
👨‍🍳 <b>Ofitsiant:</b> ${waiter || 'Belgilanmagan'}
📋 <b>Buyurtmalar:</b>
${items.map(item => `  • ${item.name} x${item.quantity}`).join('\n')}
🕒 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}

⚠️ <b>DIQQAT!</b> Buyurtma tayyor! Iltimos, stolga xizmat qiling!
  `;

    try {
      await sendTelegramMessage(messageText, MAIN_REPORTING_CHAT_ID);
    } catch (error) {
      console.error('Telegram xatosi:', error);
    }

    sendSystemNotification(
      '🍽️ Buyurtma tayyor!',
      `${tableName} stolidagi buyurtma tayyor! Ofitsiant: ${waiter || 'Belgilanmagan'}`,
      'success'
    );

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('🍽️ Buyurtma tayyor!', {
          body: `${tableName} stolidagi buyurtma tayyor!`,
          icon: '/logo192.png',
          tag: `order-ready-${tableId}`,
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200]
        });
        setTimeout(() => notification.close(), 10000);
      } catch (error) {
        console.log('Notification error:', error);
      }
    }

    try {
      const audio = new Audio('/tayyor.mp3');
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio error:', error);
    }
  }, [sendTelegramMessage, sendSystemNotification]);

  const sendNewOrderNotification = useCallback(async (tableName, items, waiter) => {
    const message = `
🔔 <b>YANGI BUYURTMA!</b>
🍽️ <b>Stol:</b> ${tableName}
👨‍🍳 <b>Ofitsiant:</b> ${waiter || 'Belgilanmagan'}
📋 <b>Buyurtmalar:</b>
${items.map(item => `  • ${item.name} x${item.quantity}`).join('\n')}
🕒 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}
  `;

    try {
      await sendTelegramMessage(message, MAIN_REPORTING_CHAT_ID);
    } catch (error) {
      console.error('Telegram xatosi:', error);
    }

    sendSystemNotification(
      '📋 Yangi buyurtma!',
      `${tableName} stolidan yangi buyurtma!`,
      'info'
    );

    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio error:', error);
    }
  }, [sendTelegramMessage, sendSystemNotification]);

  const addNotification = useCallback((message, type = 'info') => {
    const newNotification = {
      id: generateId(),
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ============================================================
  // 7. MENYU FUNKSIYALAR
  // ============================================================
  const addMenuItem = useCallback((item) => {
    if (!item.name || !item.price || !item.category) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    setMenu(prev => [...prev, { id: generateId(), ...item }]);
    toast.success("Taom qo'shildi!");
  }, []);

  const updateMenuItem = useCallback((id, updatedItem) => {
    if (!updatedItem.name || !updatedItem.price || !updatedItem.category) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    setMenu(prev => prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item)));
    toast.success("Taom yangilandi!");
  }, []);

  const deleteMenuItem = useCallback((id) => {
    setMenu(prev => prev.filter((item) => item.id !== id));
    toast.success("Taom o'chirildi!");
  }, []);

  // ============================================================
  // 8. KATEGORIYALAR
  // ============================================================
  const addCategory = useCallback((name) => {
    if (!name || name.trim().length < 2) {
      toast.error("Kategoriya nomi kamida 2 harf bo'lishi kerak!");
      return;
    }
    const trimmedName = name.trim();
    if (categories.some((cat) => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error("Bu kategoriya allaqachon mavjud!");
      return;
    }
    setCategories(prev => [...prev, { id: generateId(), name: trimmedName }]);
    toast.success("Kategoriya qo'shildi!");
  }, [categories]);

  const updateCategory = useCallback((id, name) => {
    if (!name || name.trim().length < 2) {
      toast.error("Kategoriya nomi kamida 2 harf bo'lishi kerak!");
      return;
    }
    const trimmedName = name.trim();
    if (categories.some((cat) => cat.id !== id && cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error("Bu kategoriya nomi allaqachon mavjud!");
      return;
    }
    const oldCategory = categories.find((cat) => cat.id === id);
    setCategories(prev => prev.map((cat) => (cat.id === id ? { ...cat, name: trimmedName } : cat)));
    if (oldCategory) {
      setMenu(prev => prev.map((item) =>
        item.category === oldCategory.name ? { ...item, category: trimmedName } : item
      ));
    }
    toast.success("Kategoriya yangilandi!");
  }, [categories]);

  const deleteCategory = useCallback((id) => {
    const category = categories.find((cat) => cat.id === id);
    if (menu.some((item) => item.category === category?.name)) {
      toast.error("Bu kategoriyada taomlar mavjud, o'chirib bo'lmaydi!");
      return;
    }
    setCategories(prev => prev.filter((cat) => cat.id !== id));
    toast.success("Kategoriya o'chirildi!");
  }, [categories, menu]);

  // ============================================================
  // 9. STOL FUNKSIYALAR
  // ============================================================
  const addTable = useCallback((name) => {
    if (!name || name.trim().length < 2) {
      toast.error("Stol nomi kamida 2 harf bo'lishi kerak!");
      return;
    }
    const trimmedName = name.trim();
    if (tables.some((table) => table.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error("Bu stol nomi allaqachon mavjud!");
      return;
    }
    setTables(prev => [...prev, {
      id: generateId(),
      name: trimmedName,
      orders: [],
      waiter: "",
      status: "Bo'sh",
      seats: 4,
      startTime: null
    }]);
    toast.success("Stol qo'shildi!");
  }, [tables]);

  const deleteTable = useCallback((id) => {
    const table = tables.find((t) => t.id === id);
    if (table && table.orders.length > 0) {
      toast.error("Bu stolda faol buyurtmalar mavjud, o'chirib bo'lmaydi!");
      return;
    }
    setTables(prev => prev.filter((table) => table.id !== id));
    toast.success("Stol o'chirildi!");
  }, [tables]);

  const updateTableWaiter = useCallback((id, waiter) => {
    if (!waiter || waiter.trim().length < 2) {
      toast.error("Ofitsiant ismi kamida 2 harf bo'lishi kerak!");
      return;
    }
    setTables(prev => prev.map((table) =>
      table.id === id ? { ...table, waiter: waiter.trim() } : table
    ));
    toast.success("Ofitsiant yangilandi!");
  }, []);

  const updateTableStatus = useCallback((id, status) => {
    setTables(prev => prev.map((table) =>
      table.id === id ? { ...table, status } : table
    ));
  }, []);

  const selectTable = useCallback((tableId) => {
    setSelectedTableId(tableId);
    const table = tables.find(t => t.id === tableId);
    if (table && table.status !== "Bo'sh" && !table.startTime) {
      setTables(prev => prev.map(t =>
        t.id === tableId ? { ...t, startTime: new Date().toISOString() } : t
      ));
    }
  }, [tables]);

  // ============================================================
  // 10. BUYURTMA FUNKSIYALAR (TUZATILGAN)
  // ============================================================

  /**
   * ✅ addOrder - MenuItem dan chaqiriladi
   * 🔥 FAQAT STOLGA BUYURTMA QO'SHADI (Oshxonaga EMAS!)
   * Oshxonaga yuborish uchun sendOrdersToPreparation ishlatiladi
   */
  const addOrder = useCallback((tableId, orderData) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) {
      toast.error("Stol topilmadi!");
      return;
    }

    // Buyurtma tayyorlash
    const items = orderData.items.map(item => ({
      ...item,
      quantity: item.quantity || 1,
      comment: item.comment || ""
    }));

    // ✅ Stolga buyurtma qo'shish (FAQAT stolga, oshxonaga EMAS)
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              orders: [...t.orders, ...items],
              status: "Zakaz qo'shildi",
              startTime: t.startTime || new Date().toISOString(),
            }
          : t
      )
    );

    // ❌ Oshxonaga avtomatik yuborilmaydi
    // ❌ Telegram xabar yuborilmaydi
    // ❌ kitchenOrders ga qo'shilmaydi

    toast.success(`✅ ${items.length} ta buyurtma stolga qo'shildi!`);
    
    // Faqat bildirishnoma
    addNotification(
      `📋 ${table.name} stoliga ${items.length} ta buyurtma qo'shildi`,
      'info'
    );
  }, [tables, addNotification]);

  /**
   * addToOrder - TableList dan chaqiriladi (eski usul)
   * Stolga bitta taom qo'shish uchun
   */
  const addToOrder = useCallback((item) => {
    if (!selectedTableId) {
      toast.error("Iltimos, avval stol tanlang!");
      return;
    }
    if (!item.id || !item.name || !item.price) {
      toast.error("Noto'g'ri taom ma'lumotlari!");
      return;
    }

    setTables((prev) =>
      prev.map((t) => {
        if (t.id === selectedTableId) {
          const existingItemIndex = t.orders.findIndex((order) => order.id === item.id);
          let newOrders;
          if (existingItemIndex >= 0) {
            newOrders = [...t.orders];
            newOrders[existingItemIndex] = {
              ...newOrders[existingItemIndex],
              quantity: newOrders[existingItemIndex].quantity + 1
            };
          } else {
            const menuItem = menu.find((m) => m.id === item.id);
            newOrders = [
              ...t.orders,
              { ...item, quantity: 1, category: menuItem?.category || "Other", comment: "" },
            ];
          }
          return {
            ...t,
            orders: newOrders,
            status: newOrders.length > 0 ? "Zakaz qo'shildi" : "Bo'sh",
            startTime: t.startTime || new Date().toISOString(),
          };
        }
        return t;
      })
    );
    toast.success(`${item.name} qo'shildi!`);
  }, [selectedTableId, menu]);

  const updateOrder = useCallback((tableId, index, quantity, comment = "") => {
    if (quantity < 1) {
      toast.error("Miqdor 1 dan kam bo'lmasligi kerak!");
      return;
    }
    if (comment && comment.trim().length < 3) {
      toast.error("Izoh kamida 3 harf bo'lishi kerak!");
      return;
    }
    const formattedComment = comment.trim() ? comment.trim() + (comment.trim().endsWith(".") ? "" : ".") : "";
    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          const newOrders = [...table.orders];
          if (newOrders[index]) {
            newOrders[index] = { ...newOrders[index], quantity, comment: formattedComment };
          }
          return {
            ...table,
            orders: newOrders,
            status: newOrders.length > 0 ? "Zakaz qo'shildi" : "Bo'sh",
          };
        }
        return table;
      })
    );
    toast.success("Buyurtma yangilandi!");
  }, []);

  const removeFromOrder = useCallback((tableId, index) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.orders || index >= table.orders.length) {
      toast.error("Buyurtma topilmadi!");
      return false;
    }

    const removedItem = table.orders[index];
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          const newOrders = t.orders.filter((_, i) => i !== index);
          return {
            ...t,
            orders: newOrders,
            status: newOrders.length > 0 ? "Zakaz qo'shildi" : "Bo'sh",
          };
        }
        return t;
      })
    );

    setSentOrders((prev) => {
      const updated = { ...prev };
      if (updated[tableId]) {
        updated[tableId] = updated[tableId].filter(
          (order) => !(order.id === removedItem.id && order.quantity === removedItem.quantity)
        );
        if (updated[tableId].length === 0) delete updated[tableId];
      }
      return updated;
    });
    toast.success("Buyurtma o'chirildi!");
    return true;
  }, [tables]);

  // ============================================================
  // 11. OSHXONA FUNKSIYALAR
  // ============================================================

  /**
   * sendOrdersToPreparation - Oshxonaga yuborish
   * 🔥 BU FUNKSIYA OSHXONAGA YUBORADI
   * Ofitsiant "Oshxonaga" tugmasini bosganda chaqiriladi
   */
  const sendOrdersToPreparation = useCallback(async (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.orders.length === 0) {
      toast.error("Buyurtma bo'sh!");
      return false;
    }

    const sentForTable = sentOrders[tableId] || [];
    const newOrders = table.orders.filter(
      (order) => !sentForTable.some((sent) => sent.id === order.id && sent.quantity === order.quantity)
    );

    if (newOrders.length === 0 && table.status === "Tayyorlashga yuborildi") {
      toast.error("Yangi buyurtmalar yo'q!");
      return false;
    }

    try {
      // ✅ Oshxonaga buyurtma qo'shish
      const kitchenOrder = {
        id: generateId(),
        kitchenId: `K${Date.now().toString().slice(-6)}`,
        tableId: table.id,
        tableName: table.name,
        waiter: table.waiter || "Belgilanmagan",
        items: table.orders.map(order => ({ ...order })),
        total: table.orders.reduce((sum, o) => sum + o.price * o.quantity, 0),
        status: 'pending',
        startTime: new Date().toISOString(),
        estimatedReadyTime: new Date(Date.now() + 30 * 60000).toISOString(),
        date: new Date().toISOString()
      };

      setKitchenOrders(prev => [...prev, kitchenOrder]);

      // Kategoriyalar bo'yicha ajratish
      const barItems = newOrders.filter((item) => item.category === "Ichimlik");
      const saladItems = newOrders.filter((item) => item.category === "Salat");
      const kitchenItems = newOrders.filter(
        (item) => item.category === "Asosiy taom" || item.category === "Desert" || item.category === "Other"
      );

      // Bar uchun
      if (barItems.length > 0) {
        const { itemList, comments } = formatItemsList(barItems);
        await sendTelegramMessage(`
<b>🍹 Bar uchun yangi buyurtma</b>
<b>🍽️ Stol:</b> ${table.name}
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
        `, BAR_CHAT_ID);
      }

      // Salatchilar uchun
      if (saladItems.length > 0) {
        const { itemList, comments } = formatItemsList(saladItems);
        await sendTelegramMessage(`
<b>🥗 Salatchilar uchun yangi buyurtma</b>
<b>🍽️ Stol:</b> ${table.name}
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
        `, SALATCHILAR_CHAT_ID);
      }

      // Oshxona uchun
      if (kitchenItems.length > 0) {
        const { itemList, comments } = formatItemsList(kitchenItems);
        await sendTelegramMessage(`
<b>🍲 Oshxona uchun yangi buyurtma</b>
<b>🍽️ Stol:</b> ${table.name}
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
        `, OSHXONA_CHAT_ID);
      }

      // Asosiy kanalga
      const { itemList, comments } = formatItemsList(table.orders);
      await sendTelegramMessage(`
<b>📋 Yangi buyurtma</b>
<b>🍽️ Stol:</b> ${table.name}
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
<b>📌 Status:</b> Tayyorlashga yuborildi
      `, MAIN_REPORTING_CHAT_ID);

      sendNewOrderNotification(table.name, table.orders, table.waiter);

      setSentOrders((prev) => ({
        ...prev,
        [tableId]: table.orders.map((order) => ({ ...order })),
      }));

      setTables((prev) =>
        prev.map((t) => t.id === tableId ? { ...t, status: "Tayyorlashga yuborildi" } : t)
      );
      toast.success("Buyurtmalar tayyorlashga yuborildi!");
      return true;
    } catch (error) {
      toast.error("Buyurtmalarni yuborishda xato: " + error.message);
      return false;
    }
  }, [tables, sentOrders, sendTelegramMessage, sendNewOrderNotification]);

  const startKitchenPreparation = useCallback(async (orderId) => {
    const order = kitchenOrders.find(o => o.id === orderId || o.kitchenId === orderId);
    if (!order) {
      toast.error("Buyurtma topilmadi!");
      return;
    }

    setKitchenOrders(prev =>
      prev.map(o =>
        o.id === orderId || o.kitchenId === orderId
          ? { ...o, status: 'preparing', startTime: new Date().toISOString(), estimatedReadyTime: new Date(Date.now() + 30 * 60000).toISOString() }
          : o
      )
    );

    await sendTelegramMessage(`
🔥 <b>TAYYORLASH BOSHLANDI</b>
📋 <b>Buyurtma ID:</b> ${order.kitchenId || order.id}
🍽️ <b>Stol:</b> ${order.tableName}
👨‍🍳 <b>Ofitsiant:</b> ${order.waiter || 'Belgilanmagan'}
⏰ <b>Boshlanish vaqti:</b> ${new Date().toLocaleString('uz-UZ')}
⏱️ <b>Taxminiy tayyor bo'lish:</b> ${new Date(Date.now() + 30 * 60000).toLocaleString('uz-UZ')}
<b>📋 Buyurtma:</b>
${order.items.map(item => `• ${item.name} x${item.quantity}`).join('\n')}
    `, MAIN_REPORTING_CHAT_ID);
    toast.success("Tayyorlash boshlandi!");
  }, [kitchenOrders, sendTelegramMessage]);

  const markOrderAsReady = useCallback(async (orderId) => {
    const order = kitchenOrders.find(o => o.id === orderId || o.kitchenId === orderId);
    if (!order) {
      toast.error("Buyurtma topilmadi!");
      return;
    }

    const preparationTime = Math.round((new Date() - new Date(order.startTime)) / 60000);
    
    setKitchenOrders(prev =>
      prev.map(o =>
        o.id === orderId || o.kitchenId === orderId
          ? { ...o, status: 'ready', readyTime: new Date().toISOString(), preparationTime: preparationTime }
          : o
      )
    );

    await sendWaiterNotification({
      tableName: order.tableName,
      waiter: order.waiter,
      items: order.items,
      tableId: order.tableId
    });

    toast.success(`✅ ${order.tableName} stolidagi buyurtma tayyor!`);
  }, [kitchenOrders, sendWaiterNotification]);

  const removeKitchenOrder = useCallback((orderId) => {
    setKitchenOrders(prev => prev.filter(order => order.id !== orderId && order.kitchenId !== orderId));
    toast.info('Buyurtma oshxona ro\'yxatidan o\'chirildi');
  }, []);

  const updateKitchenOrder = useCallback((orderId, data) => {
    setKitchenOrders(prev =>
      prev.map(order => order.id === orderId || order.kitchenId === orderId ? { ...order, ...data } : order)
    );
  }, []);

  // ============================================================
  // 12. BUYURTMA YAKUNLASH
  // ============================================================
  const completeOrder = useCallback(async (tableId, paymentConfirmed = false) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.orders || table.orders.length === 0) {
      toast.error("Buyurtma bo'sh!");
      return false;
    }

    const total = table.orders.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = {
      id: generateId(),
      items: [...table.orders],
      total,
      date: new Date().toISOString(),
      tableId,
      tableName: table.name,
      waiter: table.waiter,
      status: paymentConfirmed ? "To'lov qilindi" : "To'lov kutilmoqda",
    };

    setOrdersHistory(prev => [newOrder, ...prev]);
    setKitchenOrders(prev => prev.filter(order => order.tableId !== tableId));

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, orders: [], status: paymentConfirmed ? "Bo'sh" : "To'lov kutilmoqda", startTime: null }
          : t
      )
    );
    if (paymentConfirmed) {
      setSelectedTableId(null);
    }

    try {
      const { itemList, comments } = formatItemsList(table.orders);
      await sendTelegramMessage(`
<b>✅ Buyurtma yakunlandi</b>
<b>🍽️ Stol:</b> ${table.name}
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>📌 To'lov holati:</b> ${paymentConfirmed ? "To'langan" : "To'lov kutilmoqda"}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
      `, MAIN_REPORTING_CHAT_ID);
      await updateDailyReport();
      toast.success("Buyurtma yakunlandi!");
      return true;
    } catch (error) {
      toast.error("Hisobot yuborishda xato: " + error.message);
      return false;
    }
  }, [tables, sendTelegramMessage]);

  const confirmPayment = useCallback(async (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.status !== "To'lov kutilmoqda") {
      toast.error("To'lov tasdiqlash uchun buyurtma mavjud emas!");
      return;
    }

    setKitchenOrders(prev => prev.filter(order => order.tableId !== tableId));
    setTables((prev) =>
      prev.map((t) => t.id === tableId ? { ...t, status: "Bo'sh", orders: [], startTime: null } : t)
    );
    setOrdersHistory((prev) =>
      prev.map((order) =>
        order.tableId === tableId && order.status === "To'lov kutilmoqda" ? { ...order, status: "To'lov qilindi" } : order
      )
    );
    setSelectedTableId(null);

    try {
      await updateDailyReport();
      toast.success("To'lov tasdiqlandi!");
    } catch (error) {
      toast.error("Hisobot yangilashda xato: " + error.message);
    }
  }, [tables]);

  const markAsDebt = useCallback(async (tableId, debtDetails) => {
    if (!debtDetails.amount || !debtDetails.debtorName || !debtDetails.repaymentDate) {
      toast.error("Qarz ma'lumotlari to'liq kiritilmadi!");
      return;
    }

    const phone = debtDetails.debtorPhone || "";

    setKitchenOrders(prev => prev.filter(order => order.tableId !== tableId));
    setOrdersHistory((prev) =>
      prev.map((order) =>
        order.tableId === tableId && order.status === "To'lov kutilmoqda"
          ? { ...order, status: "Qarz", debtDetails: { ...debtDetails, debtorPhone: phone } }
          : order
      )
    );
    setTables((prev) =>
      prev.map((t) => t.id === tableId ? { ...t, status: "Qarz", orders: [], startTime: null } : t)
    );
    setSelectedTableId(null);

    try {
      const table = tables.find((t) => t.id === tableId);
      const order = ordersHistory.find((o) => o.tableId === tableId && o.status === "To'lov kutilmoqda");
      if (order) {
        const { itemList, comments } = formatItemsList(order.items);
        await sendTelegramMessage(`
<b>💳 Qarz sifatida belgilandi</b>
<b>🍽️ Stol:</b> ${table.name}
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>💵 Summa:</b> ${formatPrice(debtDetails.amount)}
<b>👤 Qarzdor:</b> ${debtDetails.debtorName}
<b>📞 Telefon:</b> ${phone || "Ko'rsatilmagan"}
<b>🏠 Manzil:</b> ${debtDetails.debtorAddress || "Ko'rsatilmagan"}
<b>📅 To'lov sanasi:</b> ${new Date(debtDetails.repaymentDate).toLocaleDateString("uz-UZ")}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
        `, MAIN_REPORTING_CHAT_ID);
        await updateDailyReport();
        toast.success("Buyurtma qarz sifatida belgilandi!");
      } else {
        toast.error("Qarz sifatida belgilash uchun buyurtma topilmadi!");
      }
    } catch (error) {
      toast.error("Qarzni yuborishda xato: " + error.message);
    }
  }, [tables, ordersHistory, sendTelegramMessage]);

  // ============================================================
  // 13. HISOBOT
  // ============================================================
  const updateDailyReport = useCallback(async () => {
    const today = new Date().toLocaleDateString("uz-UZ");
    const todayOrders = ordersHistory.filter(
      (order) => new Date(order.date).toLocaleDateString("uz-UZ") === today
    );

    const ordersCount = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    const itemSales = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemSales[item.id]) {
          itemSales[item.id] = { name: item.name, count: 0, totalQuantity: 0, price: item.price };
        }
        itemSales[item.id].count += 1;
        itemSales[item.id].totalQuantity += item.quantity;
      });
    });

    const bestSellers = Object.values(itemSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 3)
      .map((item) => ({ name: item.name, count: item.totalQuantity, total: item.totalQuantity * item.price }));

    setDailyReport({ ordersCount, totalRevenue, bestSellers });

    const allItemSalesText = Object.values(itemSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .map((item, index) => `${index + 1}. ${item.name} - ${item.totalQuantity} marta`)
      .join("\n");

    const orderDetailsText = todayOrders
      .map((order, index) => {
        const { itemList, comments } = formatItemsList(order.items);
        const debtInfo = order.status === "Qarz" && order.debtDetails ? `
<b>💳 Qarz ma'lumotlari:</b>
  • Summa: ${formatPrice(order.debtDetails.amount)}
  • Qarzdor: ${order.debtDetails.debtorName}
  • Manzil: ${order.debtDetails.debtorAddress}
  • To'lov sanasi: ${new Date(order.debtDetails.repaymentDate).toLocaleDateString("uz-UZ")}` : "";
        return `
<b>Buyurtma #${index + 1}</b>
<b>📅 Sana:</b> ${new Date(order.date).toLocaleString("uz-UZ")}
<b>🍽️ Stol:</b> ${order.tableName}
<b>👨‍🍳 Ofitsiant:</b> ${order.waiter || "Belgilanmagan"}
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>📌 Status:</b> ${order.status}${debtInfo}`;
      })
      .join("\n\n");

    const reportText = `
<b>📊 Sodiqjon Restorani - Bugungi hisobot (${today})</b>
<pre>-----------------------------------</pre>
<b>📌 Buyurtmalar soni:</b> ${ordersCount}
<b>💰 Umumiy daromad:</b> ${formatPrice(totalRevenue)}
<pre>-----------------------------------</pre>
<b>🏆 Eng ko'p sotilgan taomlar:</b>
${bestSellers.map((item, index) => `${index + 1}. ${item.name} - ${item.count} marta`).join("\n") || "Hozircha ma'lumot yo'q"}
<pre>-----------------------------------</pre>
<b>🍽️ Barcha sotilgan taomlar:</b>
${allItemSalesText || "Hozircha ma'lumot yo'q"}
<pre>-----------------------------------</pre>
<b>📋 Buyurtma tafsilotlari:</b>
${orderDetailsText || "Hozircha buyurtma yo'q"}`;

    const isSameDay = lastMessageDate === today;

    try {
      if (!lastMessageId || !isSameDay) {
        const messageId = await sendTelegramMessage(reportText, MAIN_REPORTING_CHAT_ID);
        setLastMessageId(messageId);
        setLastMessageDate(today);
      } else {
        await editTelegramMessage(lastMessageId, reportText);
      }
    } catch (error) {
      console.error("Hisobot yuborishda xato:", error);
    }
  }, [ordersHistory, lastMessageId, lastMessageDate, sendTelegramMessage, editTelegramMessage]);

  // ============================================================
  // 14. CHEK
  // ============================================================
  const generateReceiptPDF = useCallback((order) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("SODIQJON RESTORANI", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text(`Stol: ${order.tableName}`, 15, 40);
      doc.text(`Sana: ${safeFormatDate(order.date)}`, 15, 48);
      doc.text("Buyurtmalar:", 15, 60);
      let y = 70;
      order.items.forEach((item) => {
        doc.text(`  • ${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`, 15, y);
        if (item.comment) {
          y += 8;
          doc.text(`    Izoh: ${item.comment}`, 15, y);
        }
        y += 10;
      });
      doc.text(`Jami: ${formatPrice(order.total)}`, 15, y + 10);
      doc.save(`Chek_${order.tableName}_${formatOrderId(order.id)}.pdf`);
      toast.success("Chek yaratildi!");
    } catch (error) {
      console.error("Chek xatosi:", error);
      toast.error("Chek yaratishda xato!");
    }
  }, []);

  // ============================================================
  // 15. TOP SELLING
  // ============================================================
  const getTopSellingItems = useCallback((orders) => {
    const itemCounts = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.id]) {
          itemCounts[item.id] = { count: 0, totalQuantity: 0, name: item.name, price: item.price };
        }
        itemCounts[item.id].count += 1;
        itemCounts[item.id].totalQuantity += item.quantity;
      });
    });
    return Object.values(itemCounts)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 3);
  }, []);

  // ============================================================
  // 16. RESET FUNKSIYA
  // ============================================================
  const resetData = useCallback(() => {
    setTables(DEFAULT_TABLES);
    setCategories(DEFAULT_CATEGORIES);
    setMenu(DEFAULT_MENU);
    setOrdersHistory([]);
    setKitchenOrders([]);
    setNotifications([]);
    setDailyReport({ ordersCount: 0, totalRevenue: 0, bestSellers: [] });
    setSelectedTableId(null);
    setSentOrders({});
    setLastMessageId(null);
    setLastMessageDate(null);
    localStorage.clear();
    toast.success("✅ Barcha ma'lumotlar tiklandi!");
  }, []);

  // ============================================================
  // 17. CONTEXT VALUE
  // ============================================================
  const value = useMemo(() => ({
    // State
    tables,
    setTables,
    categories,
    setCategories,
    selectedTableId,
    setSelectedTableId,
    user,
    setUser,
    ordersHistory,
    setOrdersHistory,
    sentOrders,
    setSentOrders,
    dailyReport,
    setDailyReport,
    lastMessageId,
    setLastMessageId,
    lastMessageDate,
    setLastMessageDate,
    menu,
    setMenu,
    kitchenOrders,
    setKitchenOrders,
    isLoading,
    setIsLoading,
    notifications,
    setNotifications,

    // Notifications
    addNotification,
    markNotificationAsRead,
    clearNotifications,
    sendSystemNotification,
    sendWaiterNotification,
    sendNewOrderNotification,

    // Tables
    addTable,
    deleteTable,
    updateTableWaiter,
    updateTableStatus,
    selectTable,

    // Menu
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,

    // Categories
    addCategory,
    updateCategory,
    deleteCategory,

    // Orders
    addOrder,
    addToOrder,
    updateOrder,
    removeFromOrder,
    sendOrdersToPreparation,
    startKitchenPreparation,
    markOrderAsReady,
    removeKitchenOrder,
    updateKitchenOrder,
    completeOrder,
    confirmPayment,
    markAsDebt,

    // Other
    generateReceiptPDF,
    getTopSellingItems,
    sendTelegramMessage,
    updateDailyReport,
    resetData,
  }), [
    tables, categories, selectedTableId, user, ordersHistory, sentOrders,
    dailyReport, lastMessageId, lastMessageDate, menu, kitchenOrders,
    isLoading, notifications,
    addNotification, markNotificationAsRead, clearNotifications,
    sendSystemNotification, sendWaiterNotification, sendNewOrderNotification,
    addTable, deleteTable, updateTableWaiter, updateTableStatus, selectTable,
    addMenuItem, updateMenuItem, deleteMenuItem,
    addCategory, updateCategory, deleteCategory,
    addOrder, addToOrder, updateOrder, removeFromOrder,
    sendOrdersToPreparation, startKitchenPreparation, markOrderAsReady,
    removeKitchenOrder, updateKitchenOrder,
    completeOrder, confirmPayment, markAsDebt,
    generateReceiptPDF, getTopSellingItems, sendTelegramMessage, updateDailyReport, resetData
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;