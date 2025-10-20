import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { FaTrash, FaCreditCard, FaCheckCircle } from "react-icons/fa";
import { MdKitchen } from "react-icons/md";
import "./OrderForm.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const OrderForm = ({ tableId, openPayment }) => {
  const {
    tables,
    updateOrder,
    removeFromOrder,
    sendOrdersToPreparation,
    completeOrder,
  } = useContext(AppContext);

  const table = tables.find((t) => t.id === tableId);
  const hasOrders = table?.orders.length > 0;

  // === MIKDORNI O‘ZGARTIRISH ===
  const handleQuantityChange = (index, quantity) => {
    if (quantity >= 1) {
      updateOrder(tableId, index, quantity);
    }
  };

  // === TAYYORLASHGA YUBORISH ===
  const handlePrepareOrders = async () => {
    const isSent = table?.status === "Tayyorlashga yuborildi";
    if (isSent) {
      if (
        !window.confirm(
          "Buyurtma allaqachon yuborilgan. Yangi o'zgarishlarni yuborishni xohlaysizmi?"
        )
      ) {
        return;
      }
    }
    const success = await sendOrdersToPreparation(tableId);
    if (success) {
      alert("✅ Buyurtmalar muvaffaqiyatli tayyorlashga yuborildi!");
    }
  };

  // === MAHSULOTNI O‘CHIRISH ===
  const handleRemoveItem = async (index) => {
    const item = table.orders[index];
    const isSent = table?.status === "Tayyorlashga yuborildi";

    if (isSent) {
      if (
        !window.confirm(
          `"${item.name}" taomini bekor qilmoqchimisiz? Bu haqda oshxonaga xabar yuboriladi.`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`"${item.name}" taomini o‘chirishni xohlaysizmi?`)) {
        return;
      }
    }

    const success = await removeFromOrder(tableId, index);
    if (success) {
      alert(
        `"${item.name}" muvaffaqiyatli ${
          isSent ? "bekor qilindi" : "o‘chirildi"
        }!`
      );
    }
  };

  // === BUYURTMANI YOPISH (TO‘LOV QILINMAGAN) ===
  const handleCompleteOrder = async () => {
    const isSent = table?.status === "Tayyorlashga yuborildi";
    if (isSent) {
      if (
        !window.confirm(
          "Buyurtma tayyorlashga yuborilgan. Uni yopib, stolni bo‘shatmoqchimisiz?"
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm("Buyurtmani yopib, stolni bo‘shatmoqchimisiz (to‘lovsiz)?")
      ) {
        return;
      }
    }
    const success = await completeOrder(tableId, false); // ⏳ To‘lov qilinmadi
    if (success) {
      alert("🟡 Buyurtma yopildi (to‘lovsiz), stol bo‘shatildi!");
    }
  };

  // === BUYURTMANI TO‘LANDI DEB YOPISH ===
  const handlePaidComplete = async () => {
    if (
      !window.confirm(
        "💳 To‘lov amalga oshirildimi? Buyurtma to‘langan deb yopiladi."
      )
    )
      return;
    const success = await completeOrder(tableId, true); // ✅ To‘landi
    if (success) {
      alert("✅ Buyurtma muvaffaqiyatli yopildi va to‘landi!");
    }
  };

  if (!table) return null;

  return (
    <div className="order-form">
      <h2>{table.name} — Buyurtmalar</h2>

      <div className="order-list">
        {table.orders.length === 0 ? (
          <p>Buyurtmalar yo‘q</p>
        ) : (
          <>
            <div className="order-item header">
              <span>Mahsulot</span>
              <span>Soni</span>
              <span>Narxi</span>
              <span>Amallar</span>
            </div>

            {table.orders.map((order, index) => (
              <div key={index} className="order-item">
                <span className="item-name">
                  {order.name} ({order.category})
                </span>

                <span className="item-quantity">
                  <input
                    type="number"
                    min="1"
                    value={order.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value))
                    }
                  />
                </span>

                <span className="item-price">
                  {formatPrice(order.price * order.quantity)}
                </span>

                <span className="item-actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <FaTrash />{" "}
                    {table.status === "Tayyorlashga yuborildi"
                      ? "Bekor qilish"
                      : "O‘chirish"}
                  </button>
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="order-actions">
        <button
          className="btn btn-primary"
          onClick={handlePrepareOrders}
          disabled={!hasOrders}
        >
          <MdKitchen /> Tayyorlashga yuborish
        </button>

        <button
          className="btn btn-success"
          onClick={openPayment}
          disabled={!hasOrders}
        >
          <FaCreditCard /> To‘lov
        </button>

        <button
          className="btn btn-info"
          onClick={handlePaidComplete}
          disabled={!hasOrders}
        >
          ✅ To‘landi
        </button>

        <button
          className="btn btn-warning"
          onClick={handleCompleteOrder}
          disabled={!hasOrders}
        >
          <FaCheckCircle /> Yopish (to‘lovsiz)
        </button>
      </div>

      {hasOrders && (
        <div className="order-total">
          <strong>
            Jami:{" "}
            {formatPrice(
              table.orders.reduce(
                (sum, order) => sum + order.price * order.quantity,
                0
              )
            )}
          </strong>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
