import React, { createContext, useContext, useState, useEffect } from 'react';
import { CONFIG } from '../data/config';
import { buildOrderMessage } from '../utils/formatters';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('km_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isBagOpen, setIsBagOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('km_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Toast trigger
  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const closeToast = () => {
    setToastMessage('');
  };

  // Cart operations
  const addToCart = (line) => {
    const key = [line.id, line.opts, line.note].join('|');
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((l) => l.key === key);
      if (existingIndex > -1) {
        const nextCart = [...prevCart];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          qty: nextCart[existingIndex].qty + line.qty
        };
        return nextCart;
      }
      return [...prevCart, { ...line, key }];
    });
    showToast('Added to bag');
  };

  const updateQty = (index, delta) => {
    setCart((prevCart) => {
      const item = prevCart[index];
      if (!item) return prevCart;
      const newQty = item.qty + delta;
      if (newQty < 1) return prevCart;
      const nextCart = [...prevCart];
      nextCart[index] = { ...item, qty: newQty };
      return nextCart;
    });
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const bagCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.qty, 0);
  const hasQuote = cart.some((item) => item.price == null);
  const shippingFee = cart.length > 0 ? CONFIG.shipping : 0;
  const total = subtotal + shippingFee;

  const openBag = () => setIsBagOpen(true);
  const closeBag = () => setIsBagOpen(false);

  const openProduct = (prod) => setSelectedProduct(prod);
  const closeProduct = () => setSelectedProduct(null);

  const openCheckout = () => {
    setIsBagOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const openPlacedOrderFallback = (formData) => {
    const orderId = 'KM-' + Date.now().toString(36).toUpperCase().slice(-5);
    const message = buildOrderMessage(formData, orderId, cart, subtotal, shippingFee, hasQuote);
    setPlacedOrder({
      id: orderId,
      formData,
      message
    });
  };

  const closePlacedOrder = (andClear = false) => {
    if (andClear) {
      clearCart();
      showToast('Thank you!');
    }
    setPlacedOrder(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        bagCount,
        subtotal,
        hasQuote,
        shippingFee,
        total,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        isBagOpen,
        openBag,
        closeBag,
        selectedProduct,
        openProduct,
        closeProduct,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        placedOrder,
        openPlacedOrderFallback,
        closePlacedOrder,
        toastMessage,
        showToast,
        closeToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
