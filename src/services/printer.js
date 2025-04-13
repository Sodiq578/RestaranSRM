export const printReceipt = (order, total) => {
    const receipt = `Chek\n${order
      .map(
        (item) =>
          `${item.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString()} so‘m`
      )
      .join("\n")}\nJami: ${total.toLocaleString()} so‘m`;
    alert(receipt); // Printer simulyatsiyasi
  };