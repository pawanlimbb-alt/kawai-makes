import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export const Toast = () => {
  const { toastMessage, closeToast } = useCart();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        closeToast();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, closeToast]);

  return (
    <div
      className={`toast ${toastMessage ? 'on' : ''}`}
      role="status"
      aria-live="polite"
    >
      {toastMessage}
    </div>
  );
};

export default Toast;
