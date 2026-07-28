// src/utils/helpers.js

/**
 * ============================================================
 * NARX FORMATLASH
 * ============================================================
 */

/**
 * Narxni formatlash (so'm)
 * @param {number} price - Narx
 * @returns {string} Formatlangan narx (masalan: 25 000 so'm)
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0 so‘m';
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Summani qisqa formatda ko'rsatish
 * @param {number} amount - Summa
 * @returns {string} Qisqa formatdagi summa
 */
export const formatShortPrice = (amount) => {
  if (!amount) return '0 so‘m';
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)} mln so‘m`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)} ming so‘m`;
  }
  return formatPrice(amount);
};

/**
 * ============================================================
 * BUYURTMA FORMATLASH
 * ============================================================
 */

/**
 * Buyurtmalar ro'yxatini formatlash (Telegram uchun)
 * @param {Array} items - Buyurtma elementlari
 * @returns {Object} { itemList, comments }
 */
export const formatItemsList = (items) => {
  if (!items || items.length === 0) {
    return {
      itemList: "  Hech qanday buyurtma yo'q",
      comments: ""
    };
  }

  const itemList = items
    .map((item, index) => {
      const commentText = item.comment && item.comment.trim().length > 2 
        ? ` (${item.comment})` 
        : '';
      return `${index + 1}. ${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}${commentText}`;
    })
    .join("\n");

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

/**
 * Buyurtmalar umumiy summasini hisoblash
 * @param {Array} orders - Buyurtmalar ro'yxati
 * @returns {number} Umumiy summa
 */
export const calculateTotal = (orders) => {
  if (!orders || orders.length === 0) return 0;
  return orders.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
};

/**
 * ============================================================
 * STATUS FUNKSIYALAR
 * ============================================================
 */

/**
 * Status rangini qaytarish
 * @param {string} status - Stol statusi
 * @returns {string} Rang kodi (hex)
 */
export const getStatusColor = (status) => {
  const map = {
    "Bo'sh": "#22c55e",
    "Band": "#ef4444",
    "Band qilingan": "#f59e0b",
    "Tozalanmoqda": "#8b5cf6",
    "Zakaz qo'shildi": "#f59e0b",
    "Tayyorlashga yuborildi": "#3b82f6",
    "To'lov kutilmoqda": "#f97316",
    "Qarz": "#dc2626",
    "To'lov qilindi": "#22c55e",
  };
  return map[status] || "#6b7280";
};

/**
 * Status iconini qaytarish
 * @param {string} status - Stol statusi
 * @returns {string} Emoji icon
 */
export const getStatusIcon = (status) => {
  const map = {
    "Bo'sh": "🟢",
    "Band": "🔴",
    "Band qilingan": "🟡",
    "Tozalanmoqda": "🟣",
    "Zakaz qo'shildi": "🟡",
    "Tayyorlashga yuborildi": "🔵",
    "To'lov kutilmoqda": "🟠",
    "Qarz": "🔴",
    "To'lov qilindi": "✅",
  };
  return map[status] || "⚪";
};

/**
 * Status matnini qaytarish
 * @param {string} status - Stol statusi
 * @returns {string} Formatlangan status matni
 */
export const getStatusText = (status) => {
  const map = {
    "Bo'sh": "Bo'sh",
    "Band": "Band",
    "Band qilingan": "Band qilingan",
    "Tozalanmoqda": "Tozalanmoqda",
    "Zakaz qo'shildi": "Zakaz qo'shildi",
    "Tayyorlashga yuborildi": "Tayyorlanmoqda",
    "To'lov kutilmoqda": "To'lov kutilmoqda",
    "Qarz": "Qarz",
    "To'lov qilindi": "To'langan",
  };
  return map[status] || status;
};

/**
 * Status label (qisqa matn) qaytarish
 * @param {string} status - Stol statusi
 * @returns {string} Qisqa status matni
 */
export const getStatusLabel = (status) => {
  const labels = {
    "Bo'sh": "Bo'sh",
    "Band": "Band",
    "Band qilingan": "Band qilingan",
    "Tozalanmoqda": "Tozalanmoqda",
    "Zakaz qo'shildi": "Zakaz",
    "Tayyorlashga yuborildi": "Tayyorlanmoqda",
    "To'lov kutilmoqda": "Kutilmoqda",
    "Qarz": "Qarz",
  };
  return labels[status] || status;
};

/**
 * ============================================================
 * OSHXONA STATUS FUNKSIYALAR
 * ============================================================
 */

/**
 * Oshxona statusini formatlash
 * @param {string} status - Oshxona statusi ('pending', 'preparing', 'ready', 'completed')
 * @returns {Object} { icon, text, color, bgColor }
 */
export const getKitchenStatusInfo = (status) => {
  const map = {
    'pending': {
      icon: '⏳',
      text: 'Kutilmoqda',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    'preparing': {
      icon: '👨‍🍳',
      text: 'Tayyorlanmoqda',
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    'ready': {
      icon: '✅',
      text: 'Tayyor!',
      color: '#22c55e',
      bgColor: '#f0fdf4'
    },
    'completed': {
      icon: '✔️',
      text: 'Yakunlangan',
      color: '#6b7280',
      bgColor: '#f3f4f6'
    }
  };
  return map[status] || map.pending;
};

/**
 * ============================================================
 * ID GENERATSIYA
 * ============================================================
 */

/**
 * Unique ID generatsiya qilish
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
};

/**
 * Unique buyurtma ID generatsiya qilish
 * @returns {string} Buyurtma ID (masalan: #123456)
 */
export const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `#${timestamp}${random}`;
};

/**
 * ============================================================
 * SAN VA VAQT
 * ============================================================
 */

/**
 * Sana va vaqtni formatlash
 * @param {string|Date} date - Sana
 * @param {string} format - Format turi ('full', 'date', 'time')
 * @returns {string} Formatlangan sana
 */
export const formatDateTime = (date, format = 'full') => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const options = {
      full: { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      },
      date: { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      },
      time: { 
        hour: '2-digit', 
        minute: '2-digit' 
      }
    };
    
    return d.toLocaleString('uz-UZ', options[format] || options.full);
  } catch (error) {
    return '-';
  }
};

/**
 * Vaqtni hisoblash (daqiqalarda)
 * @param {string} startTime - Boshlanish vaqti
 * @returns {string} Vaqt (daqiqalarda)
 */
export const getTimeElapsed = (startTime) => {
  if (!startTime) return '0 daqiqa';
  try {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 60000);
    if (diff < 1) return '1 daqiqa';
    if (diff < 60) return `${diff} daqiqa`;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return minutes > 0 ? `${hours} soat ${minutes} daqiqa` : `${hours} soat`;
  } catch (error) {
    return '0 daqiqa';
  }
};

/**
 * Bugungi buyurtmalarni olish
 * @param {Array} ordersHistory - Buyurtmalar tarixi
 * @returns {Array} Bugungi buyurtmalar
 */
export const getTodayOrders = (ordersHistory) => {
  if (!ordersHistory || ordersHistory.length === 0) return [];
  const today = new Date().toLocaleDateString('uz-UZ');
  return ordersHistory.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate.toLocaleDateString('uz-UZ') === today;
  });
};

/**
 * ============================================================
 * STATISTIKA
 * ============================================================
 */

/**
 * Eng ko'p sotilgan taomlarni olish
 * @param {Array} orders - Buyurtmalar ro'yxati
 * @param {number} limit - Qancha taom olish (default: 3)
 * @returns {Array} Eng ko'p sotilgan taomlar
 */
export const getTopSellingItems = (orders, limit = 3) => {
  if (!orders || orders.length === 0) return [];
  
  const itemCounts = {};
  
  orders.forEach(order => {
    if (!order.items) return;
    order.items.forEach(item => {
      if (!itemCounts[item.id]) {
        itemCounts[item.id] = {
          id: item.id,
          name: item.name,
          count: 0,
          totalQuantity: 0,
          price: item.price,
          totalRevenue: 0
        };
      }
      itemCounts[item.id].count += 1;
      itemCounts[item.id].totalQuantity += item.quantity || 0;
      itemCounts[item.id].totalRevenue += (item.price || 0) * (item.quantity || 0);
    });
  });
  
  return Object.values(itemCounts)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);
};

/**
 * ============================================================
 * FORMATLASH FUNKSIYALAR
 * ============================================================
 */

/**
 * Telefon raqamini formatlash
 * @param {string} phone - Telefon raqami
 * @returns {string} Formatlangan telefon raqami
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
  }
  return phone;
};

/**
 * Stol nomini formatlash
 * @param {string|number} tableName - Stol nomi
 * @returns {string} Formatlangan stol nomi
 */
export const formatTableName = (tableName) => {
  if (!tableName) return 'Stol';
  const name = String(tableName);
  if (name.toLowerCase().includes('stol')) {
    return name;
  }
  return `Stol ${name}`;
};

/**
 * ============================================================
 * YORDAMCHI FUNKSIYALAR
 * ============================================================
 */

/**
 * Xatolikni formatlash
 * @param {Error|string} error - Xatolik
 * @returns {string} Formatlangan xatolik
 */
export const formatError = (error) => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'Noma\'lum xatolik yuz berdi';
};

/**
 * Ob'ektni chuqur klonlash
 * @param {Object} obj - Klonlanadigan ob'ekt
 * @returns {Object} Klonlangan ob'ekt
 */
export const deepClone = (obj) => {
  if (!obj) return obj;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    return obj;
  }
};

/**
 * Array ni guruhlash
 * @param {Array} array - Guruhlanadigan array
 * @param {string} key - Gurhlash kaliti
 * @returns {Object} Gurhlangan ob'ekt
 */
export const groupBy = (array, key) => {
  if (!array || !key) return {};
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * ============================================================
 * YANGI QO'SHILGAN FUNKSIYALAR (Xavfsiz ishlash uchun)
 * ============================================================
 */

/**
 * Buyurtma ID ni formatlash (xavfsiz)
 * @param {string|number} id - Buyurtma ID
 * @returns {string} Formatlangan ID (masalan: #123456)
 */
export const formatOrderId = (id) => {
  if (!id) return "#000000";
  const idStr = String(id);
  if (idStr.length <= 6) return `#${idStr.padStart(6, '0')}`;
  return `#${idStr.slice(-6)}`;
};

/**
 * Sanani xavfsiz formatlash
 * @param {string|Date} date - Sana
 * @param {string} format - Format turi ('full', 'date', 'time')
 * @returns {string} Formatlangan sana yoki "Noma'lum"
 */
export const safeFormatDate = (date, format = 'full') => {
  if (!date) return "Noma'lum";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Noma'lum";
    return formatDateTime(date, format);
  } catch (error) {
    return "Noma'lum";
  }
};

/**
 * ID ni tekshirish (string yoki number)
 * @param {any} id - Tekshiriladigan ID
 * @returns {boolean} ID validmi
 */
export const isValidId = (id) => {
  if (id === null || id === undefined) return false;
  if (typeof id === 'string') return id.length > 0;
  if (typeof id === 'number') return id > 0;
  return false;
};

/**
 * ID ni string ga o'tkazish
 * @param {any} id - ID
 * @returns {string} String formatdagi ID
 */
export const toStringId = (id) => {
  if (!id) return '';
  return String(id);
};

/**
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */

export default {
  formatPrice,
  formatShortPrice,
  formatItemsList,
  calculateTotal,
  getStatusColor,
  getStatusIcon,
  getStatusText,
  getStatusLabel,
  getKitchenStatusInfo,
  generateId,
  generateOrderId,
  formatDateTime,
  getTimeElapsed,
  getTodayOrders,
  getTopSellingItems,
  formatPhone,
  formatTableName,
  formatError,
  deepClone,
  groupBy,
  formatOrderId,
  safeFormatDate,
  isValidId,
  toStringId,
};