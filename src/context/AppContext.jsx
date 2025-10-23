import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
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

const formatPrice = (price) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

export const AppProvider = ({ children }) => {
  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem("tables");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, name: "Stol 1", orders: [], waiter: "", status: "Bo'sh" },
          { id: 2, name: "Stol 2", orders: [], waiter: "", status: "Bo'sh" },
          { id: 3, name: "Stol 3", orders: [], waiter: "", status: "Bo'sh" },
          { id: 4, name: "Stol 4", orders: [], waiter: "", status: "Bo'sh" },
          { id: 5, name: "Stol 5", orders: [], waiter: "", status: "Bo'sh" },
          { id: 40, name: "Yetkazib berish", orders: [], waiter: "", status: "Bo'sh" },
        ];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, name: "Asosiy taom" },
          { id: 2, name: "Salat" },
          { id: 3, name: "Nonushta" },
          { id: 4, name: "Ichimlik" },
          { id: 5, name: "Desert" },
        ];
  });

  const [selectedTableId, setSelectedTableId] = useState(null);
  const [user, setUser] = useState(null);
  const [ordersHistory, setOrdersHistory] = useState(() => {
    const saved = localStorage.getItem("ordersHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [sentOrders, setSentOrders] = useState(() => {
    const saved = localStorage.getItem("sentOrders");
    return saved ? JSON.parse(saved) : {};
  });
  const [dailyReport, setDailyReport] = useState(() => {
    const saved = localStorage.getItem("dailyReport");
    return saved
      ? JSON.parse(saved)
      : { ordersCount: 0, totalRevenue: 0, bestSellers: [] };
  });
  const [lastMessageId, setLastMessageId] = useState(() => {
    const saved = localStorage.getItem("lastMessageId");
    return saved ? JSON.parse(saved) : null;
  });
  const [lastMessageDate, setLastMessageDate] = useState(() => {
    const saved = localStorage.getItem("lastMessageDate");
    return saved ? JSON.parse(saved) : null;
  });

  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem("menu");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, name: "Osh", price: 25000, category: "Asosiy taom", isBestSeller: true, image: Osh },
          { id: 2, name: "Lag'mon", price: 20000, category: "Asosiy taom", isBestSeller: false, image: Lagmon },
          { id: 3, name: "Chuchvara", price: 18000, category: "Asosiy taom", isBestSeller: false, image: Chuchvara },
          { id: 4, name: "Manti", price: 19000, category: "Asosiy taom", isBestSeller: false, image: Manti },
          { id: 5, name: "Norin", price: 15000, category: "Asosiy taom", isBestSeller: true, image: Norin },
          { id: 6, name: "Salat Olivye", price: 12000, category: "Salat", isBestSeller: false, image: Olive },
          { id: 7, name: "Shashlik", price: 22000, category: "Asosiy taom", isBestSeller: false, image: Shashlik },
          { id: 8, name: "Somsa", price: 8000, category: "Nonushta", isBestSeller: false, image: Somsa },
          { id: 9, name: "Salat Sveji", price: 10000, category: "Salat", isBestSeller: false, image: Sveji },
        ];
  });

  const TELEGRAM_BOT_TOKEN = "7885205848:AAEcgs2vXjZqyV40f6Jvl8Rj1OMq0r7QGkA";
  const MAIN_REPORTING_CHAT_ID = "-4646692596";
  const BAR_CHAT_ID = "-4646692596";
  const SALATCHILAR_CHAT_ID = "-4753754534";
  const OSHXONA_CHAT_ID = "-4686557731";

  useEffect(() => {
    localStorage.setItem("tables", JSON.stringify(tables));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("ordersHistory", JSON.stringify(ordersHistory));
    localStorage.setItem("menu", JSON.stringify(menu));
    localStorage.setItem("dailyReport", JSON.stringify(dailyReport));
    localStorage.setItem("lastMessageId", JSON.stringify(lastMessageId));
    localStorage.setItem("lastMessageDate", JSON.stringify(lastMessageDate));
    localStorage.setItem("sentOrders", JSON.stringify(sentOrders));
  }, [tables, categories, ordersHistory, menu, dailyReport, lastMessageId, lastMessageDate, sentOrders]);

  // Format items list without prices
  const formatItemsList = (items) => {
    const itemList = items.length
      ? items
          .map((item) => `  • ${item.name} x${item.quantity}`)
          .join("\n")
      : "  Hech qanday buyurtma yo'q";

    const comments = items
      .filter((item) => item.comment && item.comment.trim().length > 2)
      .map((item) => `  • <b>${item.name}</b>: ${item.comment}`)
      .join("\n");

    return {
      itemList,
      comments: comments
        ? `\n\n<b>📝 Izohlar:</b>\n<pre>----------------------\n${comments}\n----------------------</pre>`
        : "",
    };
  };

  const addMenuItem = (item) => {
    if (!item.name || !item.price || !item.category) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    setMenu([...menu, { id: Date.now(), ...item }]);
    toast.success("Taom muvaffaqiyatli qo'shildi!");
  };

  const updateMenuItem = (id, updatedItem) => {
    if (!updatedItem.name || !updatedItem.price || !updatedItem.category) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    setMenu(menu.map((item) => (item.id === id ? { ...item, ...updatedItem } : item)));
    toast.success("Taom muvaffaqiyatli yangilandi!");
  };

  const deleteMenuItem = (id) => {
    setMenu(menu.filter((item) => item.id !== id));
    toast.success("Taom muvaffaqiyatli o'chirildi!");
  };

  const addCategory = (name) => {
    if (!name || name.trim().length < 2) {
      toast.error("Kategoriya nomi kamida 2 harfdan iborat bo'lishi kerak!");
      return;
    }
    if (categories.some((cat) => cat.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Bu kategoriya allaqachon mavjud!");
      return;
    }
    setCategories([...categories, { id: Date.now(), name }]);
    toast.success("Kategoriya muvaffaqiyatli qo'shildi!");
  };

  const updateCategory = (id, name) => {
    if (!name || name.trim().length < 2) {
      toast.error("Kategoriya nomi kamida 2 harfdan iborat bo'lishi kerak!");
      return;
    }
    if (categories.some((cat) => cat.id !== id && cat.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Bu kategoriya nomi allaqachon mavjud!");
      return;
    }
    setCategories(categories.map((cat) => (cat.id === id ? { ...cat, name } : cat)));
    setMenu(
      menu.map((item) =>
        item.category === categories.find((cat) => cat.id === id).name
          ? { ...item, category: name }
          : item
      )
    );
    toast.success("Kategoriya muvaffaqiyatli yangilandi!");
  };

  const deleteCategory = (id) => {
    const category = categories.find((cat) => cat.id === id);
    if (menu.some((item) => item.category === category.name)) {
      toast.error("Bu kategoriyada taomlar mavjud, o'chirib bo'lmaydi!");
      return;
    }
    setCategories(categories.filter((cat) => cat.id !== id));
    toast.success("Kategoriya muvaffaqiyatli o'chirildi!");
  };

  const addTable = (name) => {
    if (!name || name.trim().length < 2) {
      toast.error("Stol nomi kamida 2 harfdan iborat bo'lishi kerak!");
      return;
    }
    if (tables.some((table) => table.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Bu stol nomi allaqachon mavjud!");
      return;
    }
    setTables([...tables, { id: Date.now(), name, orders: [], waiter: "", status: "Bo'sh" }]);
    toast.success("Stol muvaffaqiyatli qo'shildi!");
  };

  const deleteTable = (id) => {
    const table = tables.find((t) => t.id === id);
    if (table.orders.length > 0) {
      toast.error("Bu stolda faol buyurtmalar mavjud, o'chirib bo'lmaydi!");
      return;
    }
    setTables(tables.filter((table) => table.id !== id));
    toast.success("Stol muvaffaqiyatli o'chirildi!");
  };

  const updateTableWaiter = (id, waiter) => {
    if (!waiter || waiter.trim().length < 2) {
      toast.error("Ofitsiant ismi kamida 2 harfdan iborat bo'lishi kerak!");
      return;
    }
    setTables(tables.map((table) => (table.id === id ? { ...table, waiter } : table)));
    toast.success("Ofitsiant muvaffaqiyatli yangilandi!");
  };

  const selectTable = (tableId) => {
    setSelectedTableId(tableId);
  };

  const addToOrder = (item) => {
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
            newOrders[existingItemIndex].quantity += 1;
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
          };
        }
        return t;
      })
    );
    toast.success("Buyurtma qo'shildi!");
  };

  const updateOrder = (tableId, index, quantity, comment = "") => {
    if (quantity < 1) {
      toast.error("Miqdor 1 dan kam bo'lmasligi kerak!");
      return;
    }
    if (comment && comment.trim().length < 3) {
      toast.error("Izoh kamida 3 harfdan iborat bo'lishi kerak!");
      return;
    }
    const formattedComment = comment.trim().endsWith(".") ? comment.trim() : comment.trim() + ".";
    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          const newOrders = [...table.orders];
          newOrders[index] = { ...newOrders[index], quantity, comment: formattedComment };
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
  };

  const removeFromOrder = (tableId, index) => {
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
          (order) =>
            !(order.id === removedItem.id && order.quantity === removedItem.quantity)
        );
        if (updated[tableId].length === 0) delete updated[tableId];
      }
      return updated;
    });
    toast.success("Buyurtma o'chirildi!");
    return true;
  };

  const sendTelegramMessage = async (text, chatId, options = {}) => {
    if (!text || !chatId) {
      console.error("Xabar matni yoki chat ID bo'sh:", { text, chatId });
      toast.error("Xabar matni yoki chat ID bo'sh!");
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
        },
        { timeout: 5000 }
      );
      return response.data.result.message_id;
    } catch (error) {
      console.error("Telegram xabarni yuborishda xato:", error.response?.data || error.message);
      toast.error(
        "Telegram xabarni yuborib bo'lmadi: " +
          (error.response?.data?.description || error.message)
      );
      throw error;
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
        },
        { timeout: 5000 }
      );
    } catch (error) {
      console.error("Telegram xabarni tahrirlashda xato:", error.response?.data || error.message);
      toast.error(
        "Telegram xabarni tahrirlashda xato: " +
          (error.response?.data?.description || error.message)
      );
    }
  };

  const sendOrdersToPreparation = async (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.orders.length === 0) {
      toast.error("Buyurtma bo'sh!");
      return false;
    }

    const sentForTable = sentOrders[tableId] || [];
    const newOrders = table.orders.filter(
      (order) =>
        !sentForTable.some(
          (sent) => sent.id === order.id && sent.quantity === order.quantity
        )
    );

    if (newOrders.length === 0 && table.status === "Tayyorlashga yuborildi") {
      toast.error("Yangi buyurtmalar yo'q!");
      return false;
    }

    try {
      // Send orders to respective groups without prices
      const barItems = newOrders.filter((item) => item.category === "Ichimlik");
      const saladItems = newOrders.filter((item) => item.category === "Salat");
      const kitchenItems = newOrders.filter(
        (item) =>
          item.category === "Asosiy taom" ||
          item.category === "Desert" ||
          item.category === "Other"
      );

      if (barItems.length > 0) {
        const { itemList, comments } = formatItemsList(barItems);
        const barMessage = `
<b>🍹 Bar uchun yangi buyurtma</b>
<b>🍽️ Stol:</b> ${table.name} (ID: ${table.id})
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
        `;
        await sendTelegramMessage(barMessage, BAR_CHAT_ID);
      }

      if (saladItems.length > 0) {
        const { itemList, comments } = formatItemsList(saladItems);
        const saladMessage = `
<b>🥗 Salatchilar uchun yangi buyurtma</b>
<b>🍽️ Stol:</b> ${table.name} (ID: ${table.id})
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
        `;
        await sendTelegramMessage(saladMessage, SALATCHILAR_CHAT_ID);
      }

      if (kitchenItems.length > 0) {
        const { itemList, comments } = formatItemsList(kitchenItems);
        const kitchenMessage = `
<b>🍲 Oshxona uchun yangi buyurtma</b>
<b>🍽️ Stol:</b> ${table.name} (ID: ${table.id})
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
        `;
        await sendTelegramMessage(kitchenMessage, OSHXONA_CHAT_ID);
      }

      // Send full order to main reporting group without prices
      const { itemList, comments } = formatItemsList(table.orders);
      const fullMessage = `
<b>📋 Yangi buyurtma</b>
<b>🍽️ Stol:</b> ${table.name} (ID: ${table.id})
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
<b>📌 Status:</b> Tayyorlashga yuborildi
      `;
      await sendTelegramMessage(fullMessage, MAIN_REPORTING_CHAT_ID);

      setSentOrders((prev) => ({
        ...prev,
        [tableId]: table.orders.map((order) => ({ ...order })),
      }));

      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId ? { ...t, status: "Tayyorlashga yuborildi" } : t
        )
      );
      toast.success("Buyurtmalar tayyorlashga yuborildi!");
      return true;
    } catch (error) {
      toast.error("Buyurtmalarni yuborishda xato: " + error.message);
      return false;
    }
  };

  const completeOrder = async (tableId, paymentConfirmed = false) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.orders || table.orders.length === 0) {
      toast.error("Buyurtma bo'sh!");
      return false;
    }

    const total = table.orders.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
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

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              orders: [],
              status: paymentConfirmed ? "Bo'sh" : "To'lov kutilmoqda",
            }
          : t
      )
    );
    setSelectedTableId(null);

    try {
      // Send completion message to main reporting group without prices
      const { itemList, comments } = formatItemsList(table.orders);
      const completionMessage = `
<b>✅ Buyurtma yakunlandi</b>
<b>🍽️ Stol:</b> ${table.name} (ID: ${table.id})
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>📌 To'lov holati:</b> ${paymentConfirmed ? "To'langan" : "To'lov kutilmoqda"}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
      `;
      await sendTelegramMessage(completionMessage, MAIN_REPORTING_CHAT_ID);

      // Generate and update daily report
      const today = new Date().toLocaleDateString("uz-UZ");
      const todayOrders = newOrdersHistory.filter(
        (order) => new Date(order.date).toLocaleDateString("uz-UZ") === today
      );

      const ordersCount = todayOrders.length;
      const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

      const itemSales = {};
      todayOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (!itemSales[item.id]) {
            itemSales[item.id] = {
              name: item.name,
              count: 0,
              totalQuantity: 0,
              price: item.price,
            };
          }
          itemSales[item.id].count += 1;
          itemSales[item.id].totalQuantity += item.quantity;
        });
      });

      const bestSellers = Object.values(itemSales)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 3)
        .map((item) => ({
          name: item.name,
          count: item.totalQuantity,
          total: item.totalQuantity * item.price,
        }));

      setDailyReport({ ordersCount, totalRevenue, bestSellers });

      // Format item sales for all items
      const allItemSalesText = Object.values(itemSales)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .map(
          (item, index) =>
            `${index + 1}. ${item.name} - ${item.totalQuantity} marta`
        )
        .join("\n");

      const orderDetailsText = todayOrders
        .map((order, index) => {
          const { itemList, comments } = formatItemsList(order.items);
          const debtInfo =
            order.status === "Qarz" && order.debtDetails
              ? `
<b>💳 Qarz ma'lumotlari:</b>
  • Summa: ${formatPrice(order.debtDetails.amount)}
  • Qarzdor: ${order.debtDetails.debtorName}
  • Manzil: ${order.debtDetails.debtorAddress}
  • To'lov sanasi: ${new Date(
    order.debtDetails.repaymentDate
  ).toLocaleDateString("uz-UZ")}`
              : "";
          return `
<b>Buyurtma #${index + 1}</b>
<b>📅 Sana:</b> ${new Date(order.date).toLocaleString("uz-UZ")}
<b>🍽️ Stol:</b> ${order.tableName} (ID: ${order.tableId})
<b>👨‍🍳 Ofitsiant:</b> ${order.waiter || "Belgilanmagan"}
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>📌 Status:</b> ${order.status}${debtInfo}
          `;
        })
        .join("\n\n");

      const reportText = `
<b>📊 Sodiqjon Restorani - Bugungi hisobot (${today})</b>
<pre>-----------------------------------</pre>
<b>📌 Buyurtmalar soni:</b> ${ordersCount}
<b>💰 Umumiy daromad:</b> ${formatPrice(totalRevenue)}
<pre>-----------------------------------</pre>
<b>🏆 Eng ko'p sotilgan taomlar:</b>
${bestSellers
  .map(
    (item, index) =>
      `${index + 1}. ${item.name} - ${item.count} marta`
  )
  .join("\n") || "Hozircha ma'lumot yo'q"}
<pre>-----------------------------------</pre>
<b>🍽️ Barcha sotilgan taomlar:</b>
${allItemSalesText || "Hozircha ma'lumot yo'q"}
<pre>-----------------------------------</pre>
<b>📋 Buyurtma tafsilotlari:</b>
${orderDetailsText || "Hozircha buyurtma yo'q"}
      `;

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
        toast.error("Hisobot yuborishda xato: " + error.message);
      }

      toast.success("Buyurtma yakunlandi!");
      return true;
    } catch (error) {
      toast.error("Hisobot yuborishda xato: " + error.message);
      return false;
    }
  };

  const confirmPayment = async (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.status !== "To'lov kutilmoqda") {
      toast.error("To'lov tasdiqlash uchun buyurtma mavjud emas!");
      return;
    }
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, status: "Bo'sh", orders: [] } : t
      )
    );
    setOrdersHistory((prev) =>
      prev.map((order) =>
        order.tableId === tableId && order.status === "To'lov kutilmoqda"
          ? { ...order, status: "To'lov qilindi" }
          : order
      )
    );

    try {
      // Update daily report after payment confirmation
      const today = new Date().toLocaleDateString("uz-UZ");
      const todayOrders = ordersHistory
        .map((order) =>
          order.tableId === tableId && order.status === "To'lov kutilmoqda"
            ? { ...order, status: "To'lov qilindi" }
            : order
        )
        .filter((order) => new Date(order.date).toLocaleDateString("uz-UZ") === today);

      const ordersCount = todayOrders.length;
      const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

      const itemSales = {};
      todayOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (!itemSales[item.id]) {
            itemSales[item.id] = {
              name: item.name,
              count: 0,
              totalQuantity: 0,
              price: item.price,
            };
          }
          itemSales[item.id].count += 1;
          itemSales[item.id].totalQuantity += item.quantity;
        });
      });

      const bestSellers = Object.values(itemSales)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 3)
        .map((item) => ({
          name: item.name,
          count: item.totalQuantity,
          total: item.totalQuantity * item.price,
        }));

      setDailyReport({ ordersCount, totalRevenue, bestSellers });

      const allItemSalesText = Object.values(itemSales)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .map(
          (item, index) =>
            `${index + 1}. ${item.name} - ${item.totalQuantity} marta`
        )
        .join("\n");

      const orderDetailsText = todayOrders
        .map((order, index) => {
          const { itemList, comments } = formatItemsList(order.items);
          const debtInfo =
            order.status === "Qarz" && order.debtDetails
              ? `
<b>💳 Qarz ma'lumotlari:</b>
  • Summa: ${formatPrice(order.debtDetails.amount)}
  • Qarzdor: ${order.debtDetails.debtorName}
  • Manzil: ${order.debtDetails.debtorAddress}
  • To'lov sanasi: ${new Date(
    order.debtDetails.repaymentDate
  ).toLocaleDateString("uz-UZ")}`
              : "";
          return `
<b>Buyurtma #${index + 1}</b>
<b>📅 Sana:</b> ${new Date(order.date).toLocaleString("uz-UZ")}
<b>🍽️ Stol:</b> ${order.tableName} (ID: ${order.tableId})
<b>👨‍🍳 Ofitsiant:</b> ${order.waiter || "Belgilanmagan"}
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>📌 Status:</b> ${order.status}${debtInfo}
          `;
        })
        .join("\n\n");

      const reportText = `
<b>📊 Sodiqjon Restorani - Bugungi hisobot (${today})</b>
<pre>-----------------------------------</pre>
<b>📌 Buyurtmalar soni:</b> ${ordersCount}
<b>💰 Umumiy daromad:</b> ${formatPrice(totalRevenue)}
<pre>-----------------------------------</pre>
<b>🏆 Eng ko'p sotilgan taomlar:</b>
${bestSellers
  .map(
    (item, index) =>
      `${index + 1}. ${item.name} - ${item.count} marta`
  )
  .join("\n") || "Hozircha ma'lumot yo'q"}
<pre>-----------------------------------</pre>
<b>🍽️ Barcha sotilgan taomlar:</b>
${allItemSalesText || "Hozircha ma'lumot yo'q"}
<pre>-----------------------------------</pre>
<b>📋 Buyurtma tafsilotlari:</b>
${orderDetailsText || "Hozircha buyurtma yo'q"}
      `;

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
        toast.error("Hisobot yuborishda xato: " + error.message);
      }

      toast.success("To'lov tasdiqlandi!");
    } catch (error) {
      toast.error("Hisobot yangilashda xato: " + error.message);
    }
  };

  const markAsDebt = async (tableId, debtDetails) => {
    if (
      !debtDetails.amount ||
      !debtDetails.debtorName ||
      !debtDetails.debtorAddress ||
      !debtDetails.repaymentDate
    ) {
      toast.error("Qarz ma'lumotlari to'liq kiritilmadi!");
      return;
    }
    setOrdersHistory((prev) =>
      prev.map((order) =>
        order.tableId === tableId && order.status === "To'lov kutilmoqda"
          ? { ...order, status: "Qarz", debtDetails }
          : order
      )
    );
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, status: "Qarz", orders: [] } : t
      )
    );

    try {
      const table = tables.find((t) => t.id === tableId);
      const order = ordersHistory.find(
        (o) => o.tableId === tableId && o.status === "To'lov kutilmoqda"
      );
      if (order) {
        const { itemList, comments } = formatItemsList(order.items);
        const debtMessage = `
<b>💳 Qarz sifatida belgilandi</b>
<b>🍽️ Stol:</b> ${table.name} (ID: ${table.id})
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>💵 Summa:</b> ${formatPrice(debtDetails.amount)}
<b>👤 Qarzdor:</b> ${debtDetails.debtorName}
<b>🏠 Manzil:</b> ${debtDetails.debtorAddress}
<b>📅 To'lov sanasi:</b> ${new Date(
          debtDetails.repaymentDate
        ).toLocaleDateString("uz-UZ")}
<b>👨‍🍳 Ofitsiant:</b> ${table.waiter || "Belgilanmagan"}
<b>🕒 Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}
        `;
        await sendTelegramMessage(debtMessage, MAIN_REPORTING_CHAT_ID);

        // Update daily report after marking as debt
        const today = new Date().toLocaleDateString("uz-UZ");
        const todayOrders = ordersHistory
          .map((o) =>
            o.tableId === tableId && o.status === "To'lov kutilmoqda"
              ? { ...o, status: "Qarz", debtDetails }
              : o
          )
          .filter((order) => new Date(order.date).toLocaleDateString("uz-UZ") === today);

        const ordersCount = todayOrders.length;
        const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

        const itemSales = {};
        todayOrders.forEach((order) => {
          order.items.forEach((item) => {
            if (!itemSales[item.id]) {
              itemSales[item.id] = {
                name: item.name,
                count: 0,
                totalQuantity: 0,
                price: item.price,
              };
            }
            itemSales[item.id].count += 1;
            itemSales[item.id].totalQuantity += item.quantity;
          });
        });

        const bestSellers = Object.values(itemSales)
          .sort((a, b) => b.totalQuantity - a.totalQuantity)
          .slice(0, 3)
          .map((item) => ({
            name: item.name,
            count: item.totalQuantity,
            total: item.totalQuantity * item.price,
          }));

        setDailyReport({ ordersCount, totalRevenue, bestSellers });

        const allItemSalesText = Object.values(itemSales)
          .sort((a, b) => b.totalQuantity - a.totalQuantity)
          .map(
            (item, index) =>
              `${index + 1}. ${item.name} - ${item.totalQuantity} marta`
          )
          .join("\n");

        const orderDetailsText = todayOrders
          .map((order, index) => {
            const { itemList, comments } = formatItemsList(order.items);
            const debtInfo =
              order.status === "Qarz" && order.debtDetails
                ? `
<b>💳 Qarz ma'lumotlari:</b>
  • Summa: ${formatPrice(order.debtDetails.amount)}
  • Qarzdor: ${order.debtDetails.debtorName}
  • Manzil: ${order.debtDetails.debtorAddress}
  • To'lov sanasi: ${new Date(
    order.debtDetails.repaymentDate
  ).toLocaleDateString("uz-UZ")}`
                : "";
            return `
<b>Buyurtma #${index + 1}</b>
<b>📅 Sana:</b> ${new Date(order.date).toLocaleString("uz-UZ")}
<b>🍽️ Stol:</b> ${order.tableName} (ID: ${order.tableId})
<b>👨‍🍳 Ofitsiant:</b> ${order.waiter || "Belgilanmagan"}
<b>📋 Buyurtmalar:</b>
${itemList}${comments}
<b>📌 Status:</b> ${order.status}${debtInfo}
            `;
          })
          .join("\n\n");

        const reportText = `
<b>📊 Sodiqjon Restorani - Bugungi hisobot (${today})</b>
<pre>-----------------------------------</pre>
<b>📌 Buyurtmalar soni:</b> ${ordersCount}
<b>💰 Umumiy daromad:</b> ${formatPrice(totalRevenue)}
<pre>-----------------------------------</pre>
<b>🏆 Eng ko'p sotilgan taomlar:</b>
${bestSellers
  .map(
    (item, index) =>
      `${index + 1}. ${item.name} - ${item.count} marta`
  )
  .join("\n") || "Hozircha ma'lumot yo'q"}
<pre>-----------------------------------</pre>
<b>🍽️ Barcha sotilgan taomlar:</b>
${allItemSalesText || "Hozircha ma'lumot yo'q"}
<pre>-----------------------------------</pre>
<b>📋 Buyurtma tafsilotlari:</b>
${orderDetailsText || "Hozircha buyurtma yo'q"}
        `;

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
          toast.error("Hisobot yuborishda xato: " + error.message);
        }

        toast.success("Buyurtma qarz sifatida belgilandi!");
      } else {
        toast.error("Qarz sifatida belgilash uchun buyurtma topilmadi!");
      }
    } catch (error) {
      toast.error("Qarzni yuborishda xato: " + error.message);
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
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Sodiqjon Restorani - Chek", 10, 10);
      doc.setFontSize(12);
      doc.text(`Stol: ${order.tableName} (ID: ${order.tableId})`, 10, 20);
      doc.text(`Ofitsiant: ${order.waiter || "Belgilanmagan"}`, 10, 30);
      doc.text(`Sana: ${new Date(order.date).toLocaleString("uz-UZ")}`, 10, 40);
      doc.text("Buyurtmalar:", 10, 50);
      let y = 60;
      order.items.forEach((item) => {
        doc.text(
          `  • ${item.name} x${item.quantity} = ${formatPrice(
            item.price * item.quantity
          )}`,
          10,
          y
        );
        if (item.comment && item.comment.trim().length > 2) {
          y += 10;
          doc.text(`    Izoh: ${item.comment}`, 10, y);
        }
        y += 10;
      });
      doc.text(`Jami: ${formatPrice(order.total)}`, 10, y);
      y += 10;
      doc.text(`Status: ${order.status}`, 10, y);
      if (order.status === "Qarz" && order.debtDetails) {
        y += 10;
        doc.text("Qarz ma'lumotlari:", 10, y);
        y += 10;
        doc.text(`  • Summa: ${formatPrice(order.debtDetails.amount)}`, 10, y);
        y += 10;
        doc.text(`  • Qarzdor: ${order.debtDetails.debtorName}`, 10, y);
        y += 10;
        doc.text(`  • Manzil: ${order.debtDetails.debtorAddress}`, 10, y);
        y += 10;
        doc.text(
          `  • To'lov sanasi: ${new Date(
            order.debtDetails.repaymentDate
          ).toLocaleDateString("uz-UZ")}`,
          10,
          y
        );
      }
      doc.save(`Chek_${order.tableName}_${order.id}.pdf`);
      toast.success("Chek muvaffaqiyatli yaratildi!");
    } catch (error) {
      console.error("Chek yaratishda xato:", error);
      toast.error("Chek yaratishda xato yuz berdi!");
    }
  };

  return (
    <AppContext.Provider
      value={{
        tables,
        categories,
        selectedTableId,
        selectTable,
        addToOrder,
        updateOrder,
        removeFromOrder,
        sendOrdersToPreparation,
        completeOrder,
        confirmPayment,
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
        addCategory,
        updateCategory,
        deleteCategory,
        generateReceiptPDF,
        markAsDebt,
        sendTelegramMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};