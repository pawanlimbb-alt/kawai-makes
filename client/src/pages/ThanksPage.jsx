import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CONFIG } from '../data/config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BagDrawer from '../components/BagDrawer';
import ProductModal from '../components/ProductModal';
import CheckoutModal from '../components/CheckoutModal';
import OrderConfirmationModal from '../components/OrderConfirmationModal';
import Toast from '../components/Toast';
import { formatCurrency } from '../utils/formatters';

export const ThanksPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const orderData = location.state?.order;

  const igMessage = encodeURIComponent(
    `Hi @${CONFIG.instagram}! I've placed order ${orderId}. Please confirm it!`
  );

  return (
    <>
      <Header />
      <main className="wrap" style={{ minHeight: '60vh', padding: '40px 0' }}>
        <div className="panel" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌸</div>
          <h2>Thank you for your order!</h2>
          <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '1.1rem' }}>
            Your order <b>{orderId}</b> has been received.
          </p>

          {orderData && (
            <div
              className="panel"
              style={{
                background: 'var(--bg)',
                margin: '20px 0',
                textAlign: 'left',
                padding: '16px 20px'
              }}
            >
              <div className="tot">
                <span>Payment Method:</span>
                <b>{orderData.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</b>
              </div>
              <div className="tot">
                <span>Status:</span>
                <b>{orderData.paymentStatus === 'cod_pending' ? 'COD Pending' : orderData.paymentStatus}</b>
              </div>
              <div className="tot big" style={{ margin: '8px 0 0' }}>
                <span>Total:</span>
                <b>{formatCurrency(orderData.total)}</b>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '24px'
            }}
          >
            <a
              className="btn"
              href={`https://ig.me/m/${encodeURIComponent(CONFIG.instagram)}?text=${igMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message us on Instagram ({orderId})
            </a>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={`/order/${orderId}`} className="btn ghost">
                Track Order
              </Link>
              <Link to="/" className="btn ghost">
                Back to Shop
              </Link>
            </div>
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

export default ThanksPage;
