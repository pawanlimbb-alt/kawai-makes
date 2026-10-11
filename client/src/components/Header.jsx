import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const { bagCount, openBag } = useCart();
  const { user, openAuthModal, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Account';

  return (
    <header className="top">
      <div className="wrap">
        <Link className="logo" to="/" aria-label="kawai.makes home">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path
              d="M16 15c-3-6-10-6-11-2s5 6 11 2zm0 0c3-6 10-6 11-2s-5 6-11 2z"
              fill="#D23F6B"
            />
            <circle cx="16" cy="15" r="3" fill="#FF8FB1" />
            <path d="M14 18l-3 9 5-3 5 3-3-9z" fill="#D23F6B" />
          </svg>
          kawai.makes
        </Link>
        <nav className="nav" aria-label="Main">
          <a className="link" href="/#shop">Shop</a>
          <a className="link" href="/#custom">Custom orders</a>
          <a className="link" href="/#info">Order info</a>

          {/* Account Menu */}
          {user ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                type="button"
                className="link"
                style={{
                  background: isMenuOpen ? 'var(--blush)' : 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-expanded={isMenuOpen}
              >
                <span>🌸 {firstName}</span>
                {user.role === 'admin' && (
                  <span
                    style={{
                      background: 'var(--rose)',
                      color: 'var(--rose-ink)',
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      fontWeight: 800
                    }}
                  >
                    Admin
                  </span>
                )}
              </button>

              {isMenuOpen && (
                <div
                  className="panel"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: '220px',
                    padding: '12px',
                    borderRadius: '18px',
                    zIndex: 50,
                    boxShadow: '0 10px 24px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ padding: '4px 8px 8px', borderBottom: '1px solid var(--line)' }}>
                    <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{user.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', wordBreak: 'break-all' }}>{user.email}</p>
                  </div>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="link"
                      style={{ fontSize: '0.9rem', padding: '8px', color: 'var(--rose)', fontWeight: 800 }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      👑 Owner Dashboard
                    </Link>
                  )}

                  <Link
                    to="/order"
                    className="link"
                    style={{ fontSize: '0.9rem', padding: '8px' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📦 Track Orders
                  </Link>

                  <button
                    type="button"
                    className="link"
                    style={{
                      background: 'none',
                      border: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      padding: '8px',
                      color: 'var(--muted)'
                    }}
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="link"
              style={{ background: 'none', border: 0, cursor: 'pointer' }}
              onClick={() => openAuthModal('login')}
            >
              Sign in
            </button>
          )}

          <button
            className="bagbtn"
            id="openBag"
            aria-label="Open bag"
            onClick={openBag}
          >
            Bag <span className="count">{bagCount}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
