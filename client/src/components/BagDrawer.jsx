import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { IMAGES } from '../data/images';
import { formatCurrency } from '../utils/formatters';

export const BagDrawer = () => {
  const {
    cart,
    isBagOpen,
    closeBag,
    updateQty,
    removeFromCart,
    subtotal,
    shippingFee,
    total,
    hasQuote,
    openCheckout
  } = useCart();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isBagOpen) {
        closeBag();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBagOpen, closeBag]);

  return (
    <>
      <div
        className={`scrim ${isBagOpen ? 'on' : ''}`}
        onClick={closeBag}
        aria-hidden="true"
      />
      <aside
        className={`drawer ${isBagOpen ? 'on' : ''}`}
        aria-label="Your bag"
        aria-hidden={!isBagOpen}
      >
        <header>
          <h2>Your bag</h2>
          <button
            className="x"
            id="closeBag"
            onClick={closeBag}
            aria-label="Close bag"
          >
            &times;
          </button>
        </header>

        <div className="lines">
          {cart.length === 0 ? (
            <div className="empty">
              Your bag is empty.
              <br />
              Pick something cute from the shop.
            </div>
          ) : (
            cart.map((item, index) => (
              <div className="line" key={item.key || index}>
                {item.img && IMAGES[item.img] ? (
                  <img src={IMAGES[item.img]} alt={item.name} />
                ) : (
                  <div className="ph2" aria-hidden="true">
                    🎀
                  </div>
                )}
                <div>
                  <h4>{item.name}</h4>
                  {item.opts && <small>{item.opts}</small>}
                  {item.note && <small>Note: {item.note}</small>}
                  <small>
                    <b style={{ color: 'var(--rose)' }}>
                      {item.price == null
                        ? 'Price confirmed on Instagram'
                        : formatCurrency(item.price * item.qty)}
                    </b>
                  </small>
                  <div className="qty">
                    <button
                      type="button"
                      onClick={() => updateQty(index, -1)}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(index, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <button
                      className="rm"
                      type="button"
                      onClick={() => removeFromCart(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer>
          <div className="tot">
            <span>Items</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="tot">
            <span>Delivery</span>
            <span>{formatCurrency(shippingFee)}</span>
          </div>
          <div className="tot big">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          {hasQuote && (
            <p className="hint" style={{ marginBottom: '10px' }}>
              Custom requests are not included in the total yet. We confirm their
              price on Instagram.
            </p>
          )}
          <button
            className="btn"
            style={{ width: '100%' }}
            disabled={cart.length === 0}
            onClick={openCheckout}
          >
            Check out
          </button>
        </footer>
      </aside>
    </>
  );
};

export default BagDrawer;
