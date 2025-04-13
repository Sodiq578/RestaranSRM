import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import jsPDF from "jspdf";

function PaymentModal({ tableId, onClose }) {
  const { tables, completeOrder, generateReceiptPDF, ordersHistory } = useContext(AppContext);
  const table = tables.find((t) => t.id === tableId);
  const orders = table ? table.orders : [];
  const total = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Check if this table has pending payment
  const pendingPayment = ordersHistory.some(
    (order) => order.tableId === tableId && order.status === "To'lov kutilmoqda"
  );

  const handlePayment = () => {
    if (orders.length === 0) {
      alert("Buyurtma bo'sh!");
      return;
    }
    
    // Generate receipt
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Sodiqjon Restorani", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text(`Chek #${Date.now()}`, 20, 40);
    doc.text(`Stol: ${table.name} (ID: ${table.id})`, 20, 50);
    doc.text(`Sana: ${new Date().toLocaleString("uz-UZ")}`, 20, 60);
    doc.setFontSize(12);
    doc.text("Buyurtma:", 20, 80);
    
    let y = 90;
    orders.forEach((item) => {
      doc.text(
        `${item.name} x ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} so'm`,
        30,
        y
      );
      y += 10;
    });
    
    doc.setFontSize(14);
    doc.text(`Jami: ${total.toLocaleString()} so'm`, 20, y + 10);
    
    // Save the PDF
    doc.save(`Sodiqjon_Chek_${table.name}_${Date.now()}.pdf`);
    
    completeOrder(tableId, true);
    onClose();
  };

  const handlePendingPayment = () => {
    completeOrder(tableId, false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          width: "400px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ 
          marginBottom: "20px", 
          textAlign: "center",
          color: pendingPayment ? "#ff4757" : "#2f3542"
        }}>
          {table ? table.name : ""} uchun to'lov
          {pendingPayment && <div style={{ fontSize: "14px", color: "#ff4757" }}>(To'lov kutilmoqda)</div>}
        </h2>
        
        <div style={{ 
          marginBottom: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "15px",
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          {orders.length > 0 ? (
            orders.map((item, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                paddingBottom: "10px",
                borderBottom: "1px solid #eee"
              }}>
                <span>{item.name} x {item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString()} so'm</span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", color: "#777" }}>Buyurtmalar yo'q</div>
          )}
        </div>
        
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          fontSize: "18px",
          fontWeight: "bold"
        }}>
          <span>Jami:</span>
          <span>{total.toLocaleString()} so'm</span>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          {!pendingPayment ? (
            <>
              <button 
                onClick={handlePayment}
                style={{ 
                  flex: 1,
                  background: "#2ed573",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  ":hover": {
                    background: "#20bf6b"
                  }
                }}
              >
                To'lovni tasdiqlash
              </button>
              <button
                onClick={handlePendingPayment}
                style={{ 
                  flex: 1,
                  background: "#ffa502",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  ":hover": {
                    background: "#e67e22"
                  }
                }}
              >
                To'lov kutilmoqda
              </button>
            </>
          ) : (
            <button 
              onClick={handlePayment}
              style={{ 
                flex: 1,
                background: "#2ed573",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s",
                ":hover": {
                  background: "#20bf6b"
                }
              }}
            >
              Chekni qayta chiqarish
            </button>
          )}
          
          <button
            onClick={onClose}
            style={{ 
              flex: 1,
              background: "#57606f",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s",
              ":hover": {
                background: "#2f3542"
              }
            }}
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;