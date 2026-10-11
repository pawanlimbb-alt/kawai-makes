import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { CONFIG } from '../data/config';

export const OrderConfirmationModal = () => {
  const { placedOrder, closePlacedOrder, showToast } = useCart();
  const textAreaRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && placedOrder) {
        closePlacedOrder(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placedOrder, closePlacedOrder]);

  if (!placedOrder) return null;

  const { id, formData, message } = placedOrder;
  const firstName = formData.name.split(' ')[0] || formData.name;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
      } else if (textAreaRef.current) {
        textAreaRef.current.select();
        document.execCommand('copy');
      }
      showToast('Order message copied');
    } catch (e) {
      if (textAreaRef.current) {
        textAreaRef.current.select();
        document.execCommand('copy');
        showToast('Order message copied');
      }
    }
  };

  const handleIgClick = () => {
    handleCopy();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePlacedOrder(false);
      }}
    >
      <div className="modal-card" role="dialog" aria-labelledby="cdTitle">
        <div className="dlg">
          <div className="head">
            <h2 id="cdTitle">Almost done, {firstName}!</h2>
            <button
              className="x"
              type="button"
              onClick={() => closePlacedOrder(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <p style={{ marginBottom: '12px' }}>
            Your order <b>{id}</b> is saved here, but it is only placed once you
            send it to us.
          </p>

          <ol
            style={{
              paddingLeft: '20px',
              margin: '0 0 14px',
              display: 'grid',
              gap: '6px'
            }}
          >
            <li>Copy the order message below.</li>
            <li>
              Open our Instagram chat and paste it. Add reference photos for custom
              pieces.
            </li>
            {formData.pay === 'UPI' ? (
              <li>
                After we confirm the price, pay by UPI to{' '}
                <b>{CONFIG.upiId}</b> ({CONFIG.upiName}) and send the screenshot
                in the same chat.
              </li>
            ) : (
              <li>Keep cash ready for delivery in Dibrugarh.</li>
            )}
          </ol>

          <textarea
            className="ordertxt"
            ref={textAreaRef}
            readOnly
            value={message}
          />

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              marginTop: '12px'
            }}
          >
            <button className="btn" type="button" onClick={handleCopy}>
              Copy order message
            </button>
            <a
              className="btn ghost"
              href={`https://ig.me/m/${encodeURIComponent(CONFIG.instagram)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleIgClick}
            >
              Open Instagram chat
            </a>
          </div>

          <button
            className="btn ghost"
            type="button"
            style={{ marginTop: '10px', width: '100%' }}
            onClick={() => closePlacedOrder(true)}
          >
            I have sent it, clear my bag
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
