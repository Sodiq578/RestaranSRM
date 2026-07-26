// src/utils/helpers.js

export const formatPrice = (price) => {
  if (price === undefined || price === null) return '0 so‘m';
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatItemsList = (items) => {
  const itemList = items.length
    ? items.map((item) => `  • ${item.name} x${item.quantity}`).join("\n")
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