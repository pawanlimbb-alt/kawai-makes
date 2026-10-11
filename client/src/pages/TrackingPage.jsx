import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BagDrawer from '../components/BagDrawer';
import ProductModal from '../components/ProductModal';
import CheckoutModal from '../components/CheckoutModal';
import OrderConfirmationModal from '../components/OrderConfirmationModal';
import Toast from '../components/Toast';

export const TrackingPage = () => {
  const { orderId } = useParams();
  const [phone, setPhone] = useState('');
  const [lookupDone, setLookupDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tracking lookup function will be wired in Step 7
    setLookupDone(true);
  };

  return (
    <>
      <Header />
      <main className="wrap" style={{ minHeight: '60vh', padding: '40px 0' }}>
        <div className="panel" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2>Track your order</h2>
          <p style={{ color: 'var(--muted)', margin: '8px 0 20px' }}>
            Enter your Order ID and 10-digit phone number to check the status.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="orderId">Order ID</label>
              <input
                type="text"
                id="orderId"
                defaultValue={orderId || ''}
                placeholder="e.g. KM-4F2A9"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="trackPhone">Phone Number</label>
              <input
                type="tel"
                id="trackPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                required
              />
            </div>
            <button className="btn" type="submit" style={{ width: '100%' }}>
              Lookup Order
            </button>
          </form>

          {lookupDone && (
            <div className="panel" style={{ background: 'var(--bg)', marginTop: '20px' }}>
              <h3>Order Status</h3>
              <p style={{ color: 'var(--muted)', marginTop: '4px' }}>
                Looking up order details...
              </p>
            </div>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/" className="btn ghost">
              Back to Shop
            </Link>
          </div>
        </div>
      </main>
      <Footer />

      <BagDrawer />
      <ProductModal />
      <CheckoutModal />
      <OrderConfirmationModal />
      <Toast />
    </>
  );
};

export default TrackingPage;
