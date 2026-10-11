import { CONFIG } from '../data/config';

export const formatCurrency = (n) => {
  if (n == null) return "Price to be confirmed";
  return "₹" + Number(n).toLocaleString("en-IN");
};

export const buildOrderMessage = (formData, orderId, cart, subtotal, shipFee, hasQuote) => {
  const lines = cart.map(l => {
    const price = l.price == null ? "price to be confirmed" : formatCurrency(l.price * l.qty);
    return `- ${l.qty} x ${l.name} (${price})` + 
      (l.opts ? `\n   ${l.opts}` : "") + 
      (l.note ? `\n   Note: ${l.note}` : "");
  }).join("\n");

  const totalStr = formatCurrency(subtotal + shipFee) + (hasQuote ? " (plus custom items, to be confirmed)" : "");

  return `Hi ${CONFIG.instagram}! I'd like to place an order.
Order ID: ${orderId}

${lines}

Items: ${formatCurrency(subtotal)}
Delivery: ${formatCurrency(shipFee)}
Total: ${totalStr}

Name: ${formData.name}
Phone: ${formData.phone}
Address: ${formData.addr}, ${formData.city} - ${formData.pin}
Payment: ${formData.pay === "COD" ? "Cash on delivery" : "UPI"}`;
};
