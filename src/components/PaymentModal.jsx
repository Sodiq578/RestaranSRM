import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import jsPDF from "jspdf";
import restaurantLogo from "../assets/logo1.png"; // Ensure you have a high-quality logo
import "./PaymentModal.css";

function PaymentModal({ tableId, onClose }) {
  const { tables, completeOrder, ordersHistory } = useContext(AppContext);
  const table = tables.find((t) => t.id === tableId);
  const orders = table ? table.orders : [];
  const total = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = total * 0.15; // 15% tax
  const serviceCharge = total * 0.1; // 10% service charge
  const grandTotal = total + tax + serviceCharge;

  const pendingPayment = ordersHistory.some(
    (order) => order.tableId === tableId && order.status === "To'lov kutilmoqda"
  );

  const generateReceipt = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Background (clean white)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, "F");

    // Logo or Restaurant Name
    let y = 15;
    try {
      doc.addImage(restaurantLogo, "PNG", 85, y, 40, 20); // Centered logo
      y += 25;
    } catch (error) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("SODIQJON RESTORANI", 105, y, { align: "center" });
      y += 10;
    }

    // Restaurant Info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Navoiy ko'chasi 123, Toshkent, O'zbekiston", 105, y, { align: "center" });
    y += 5;
    doc.text("Telefon: +998 90 123 45 67", 105, y, { align: "center" });
    y += 5;
    doc.text("@sodiqjon_restorani | @Sadikov001", 105, y, { align: "center" });
    y += 10;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, y, 190, y);
    y += 10;

    // Receipt Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Chek #${Math.floor(Math.random() * 10000)}`, 20, y);
    doc.text(`Sana: ${new Date().toLocaleString("uz-UZ")}`, 105, y, { align: "center" });
    doc.text(`Stol: ${table.name}`, 190, y, { align: "right" });
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Ofitsiant: ${table.waiter || "Noma'lum"}`, 20, y);
    y += 10;

    // Order Items Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Mahsulot", 20, y);
    doc.text("Miqdor", 100, y);
    doc.text("Narx", 140, y);
    doc.text("Jami", 190, y, { align: "right" });
    y += 5;
    doc.line(20, y, 190, y);
    y += 5;

    // Order Items
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    orders.forEach((item) => {
      doc.text(item.name, 20, y);
      doc.text(item.quantity.toString(), 100, y);
      doc.text(`${item.price.toLocaleString()} so'm`, 140, y);
      doc.text(`${(item.price * item.quantity).toLocaleString()} so'm`, 190, y, { align: "right" });
      y += 7;
    });

    // Divider
    y += 5;
    doc.line(20, y, 190, y);
    y += 10;

    // Totals
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Jami:", 140, y);
    doc.text(`${total.toLocaleString()} so'm`, 190, y, { align: "right" });
    y += 6;
    doc.text("QQS (15%):", 140, y);
    doc.text(`${tax.toLocaleString()} so'm`, 190, y, { align: "right" });
    y += 6;
    doc.text("Xizmat haqqi (10%):", 140, y);
    doc.text(`${serviceCharge.toLocaleString()} so'm`, 190, y, { align: "right" });
    y += 8;

    // Grand Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204); // Blue accent
    doc.text("UMUMIY:", 140, y);
    doc.text(`${grandTotal.toLocaleString()} so'm`, 190, y, { align: "right" });
    y += 15;

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Tashrifingiz uchun rahmat!", 105, y, { align: "center" });
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Har qanday savol uchun: +998 90 987 65 43", 105, y, { align: "center" });

    // Save PDF
    doc.save(`Sodiqjon_Chek_${table.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handlePayment = () => {
    if (orders.length === 0) {
      alert("Buyurtma bo'sh!");
      return;
    }
    generateReceipt();
    completeOrder(tableId, true);
    onClose();
  };

  const handlePendingPayment = () => {
    completeOrder(tableId, false);
    onClose();
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <h2 className={pendingPayment ? "pending" : ""}>
          {table ? table.name : ""} uchun to'lov
          {pendingPayment && <span className="pending-note">(To'lov kutilmoqda)</span>}
        </h2>
        <div className="order-details">
          {orders.length > 0 ? (
            <>
              {orders.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()} so'm</span>
                </div>
              ))}
              <div className="order-totals">
                <div>
                  <span>Jami:</span>
                  <span>{total.toLocaleString()} so'm</span>
                </div>
                <div>
                  <span>QQS (15%):</span>
                  <span>{tax.toLocaleString()} so'm</span>
                </div>
                <div>
                  <span>Xizmat haqqi (10%):</span>
                  <span>{serviceCharge.toLocaleString()} so'm</span>
                </div>
                <div className="grand-total">
                  <span>UMUMIY:</span>
                  <span>{grandTotal.toLocaleString()} so'm</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-orders">Buyurtmalar yo'q</div>
          )}
        </div>
        <div className="modal-actions">
          {!pendingPayment ? (
            <>
              <button className="confirm-btn" onClick={handlePayment}>
                To'lovni tasdiqlash
              </button>
              <button className="pending-btn" onClick={handlePendingPayment}>
                To'lov kutilmoqda
              </button>
            </>
          ) : (
            <button className="reprint-btn" onClick={handlePayment}>
              Chekni qayta chiqarish
            </button>
          )}
          <button className="close-btn" onClick={onClose}>
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;