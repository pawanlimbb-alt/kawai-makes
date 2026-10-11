import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CONFIG } from '../data/config';
import { formatCurrency } from '../utils/formatters';

export const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    closeCheckout,
    cart,
    clearCart,
    subtotal,
    shippingFee,
    total,
    hasQuote,
    showToast,
    openPlacedOrderFallback
  } = useCart();

  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    addr: '',
    city: '',
    pin: '',
    pay: 'ONLINE',
    policy: false
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Autofill user info if logged in
  useEffect(() => {
    if (user && isCheckoutOpen) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        addr: prev.addr || user.savedAddresses?.[0]?.address || '',
        city: prev.city || user.savedAddresses?.[0]?.city || '',
        pin: prev.pin || user.savedAddresses?.[0]?.pin || ''
      }));
    }
  }, [user, isCheckoutOpen]);

  const isCodAllowed = formData.city.trim().toLowerCase().includes(CONFIG.codCity.toLowerCase());

  // Reset COD if not allowed
  useEffect(() => {
    if (!isCodAllowed && formData.pay === 'COD') {
      setFormData((prev) => ({ ...prev, pay: 'ONLINE' }));
    }
  }, [isCodAllowed, formData.pay]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCheckoutOpen && !loading) {
        closeCheckout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheckoutOpen, closeCheckout, loading]);

  if (!isCheckoutOpen) return null;

  const handleChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    const field = name || id;
    setFormData((prev) => ({
      ...prev,
      [field]: type === 'checkbox' ? checked : value
    }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.policy) {
      setErrorMsg('Please accept the store policy to proceed.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Prepare items payload for POST /api/orders
      const orderItems = cart.map((item) => ({
        productId: item.id || 'custom',
        qty: item.qty,
        options: item.opts,
        note: item.note
      }));

      // 2. Call POST /api/orders
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer: {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim() || undefined,
            address: formData.addr.trim(),
            city: formData.city.trim(),
            pin: formData.pin.trim()
          },
          items: orderItems,
          paymentMethod: formData.pay
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      const createdOrderId = data.orderId;

      // 3. Clear cart & close checkout
      clearCart();
      closeCheckout();

      if (formData.pay === 'COD') {
        showToast('Order placed successfully with Cash on Delivery!');
      } else if (data.hasCustomItems) {
        showToast('Custom request received! We will confirm your price.');
      } else {
        showToast('Order created successfully!');
      }

      // Navigate to Thanks page
      navigate(`/thanks/${createdOrderId}`, { state: { order: data } });
    } catch (err) {
      console.error('Checkout error:', err);
      const message = err.message || 'Could not place order. Please try again or order on Instagram.';
      setErrorMsg(message);
      showToast(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInstagramFallback = () => {
    closeCheckout();
    openPlacedOrderFallback(formData);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) closeCheckout();
      }}
    >
      <div className="modal-card" role="dialog" aria-labelledby="cdTitle">
        <form className="dlg" onSubmit={handleSubmit}>
          <div className="head">
            <h2 id="cdTitle">Delivery and payment</h2>
            <button
              className="x"
              type="button"
              onClick={closeCheckout}
              disabled={loading}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {errorMsg && (
            <div
              style={{
                background: 'var(--blush)',
                color: 'var(--rose)',
                padding: '10px 14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '14px'
              }}
            >
              {errorMsg}
            </div>
          )}

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              type="text"
              id="name"
              required
              autoComplete="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="two">
            <div className="field">
              <label htmlFor="phone">Phone number (10 digits)</label>
              <input
                type="tel"
                id="phone"
                required
                autoComplete="tel"
                inputMode="tel"
                pattern="[0-9+ ]{10,14}"
                title="Enter a 10 digit Indian phone number"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="addr">Full address</label>
            <textarea
              id="addr"
              required
              style={{ minHeight: '70px' }}
              autoComplete="street-address"
              placeholder="House/flat number, building, street, area..."
              value={formData.addr}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="two">
            <div className="field">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                required
                autoComplete="address-level2"
                placeholder="e.g. Dibrugarh, Guwahati..."
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="field">
              <label htmlFor="pin">PIN code (6 digits)</label>
              <input
                type="text"
                id="pin"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                title="6 digit PIN code"
                placeholder="786001"
                autoComplete="postal-code"
                value={formData.pin}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <label>Payment method</label>
          <div className="radios">
            <label>
              <input
                type="radio"
                name="pay"
                value="ONLINE"
                checked={formData.pay === 'ONLINE'}
                onChange={handleChange}
                disabled={loading}
              />
              <span>
                Online Payment (UPI, Cards, Netbanking)
                <small>Secure checkout powered by Razorpay.</small>
              </span>
            </label>
            <label className={!isCodAllowed ? 'off' : ''}>
              <input
                type="radio"
                name="pay"
                value="COD"
                id="codRadio"
                disabled={!isCodAllowed || loading}
                checked={formData.pay === 'COD'}
                onChange={handleChange}
              />
              <span>
                Cash on delivery
                <small>
                  {isCodAllowed
                    ? 'Available for Dibrugarh.'
                    : 'Available for Dibrugarh only.'}
                </small>
              </span>
            </label>
          </div>

          <div
            className="panel"
            style={{ padding: '14px 16px', marginBottom: '6px' }}
          >
            <div className="tot">
              <span>Items</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="tot">
              <span>Delivery</span>
              <span>{formatCurrency(shippingFee)}</span>
            </div>
            <div className="tot big" style={{ marginBottom: 0 }}>
              <span>Total</span>
              <span>
                {formatCurrency(total)}
                {hasQuote ? ' + custom' : ''}
              </span>
            </div>
          </div>

          <label className="check">
            <input
              type="checkbox"
              id="policy"
              required
              checked={formData.policy}
              onChange={handleChange}
              disabled={loading}
            />
            <span>
              I understand there is no exchange, refund, cancellation or return.
            </span>
          </label>

          <button
            className="btn"
            type="submit"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Processing Order...' : 'Place Order'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              type="button"
              className="rm"
              style={{ fontSize: '0.9rem', color: 'var(--muted)', background: 'none', border: 0 }}
              onClick={handleInstagramFallback}
            >
              Prefer to order manually on Instagram?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
