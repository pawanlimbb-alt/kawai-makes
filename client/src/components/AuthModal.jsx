import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    googleLogin,
    apiFetch
  } = useAuth();

  const { showToast } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const googleBtnRef = useRef(null);

  useEffect(() => {
    setErrorMsg('');
    setInfoMsg('');
  }, [authModalTab, isAuthModalOpen]);

  // Load and render Google Sign In button if clientId is provided
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initializeGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              setLoading(true);
              setErrorMsg('');
              await googleLogin(response.credential);
              showToast('Signed in with Google');
            } catch (err) {
              setErrorMsg(err.message || 'Google sign-in failed');
            } finally {
              setLoading(false);
            }
          }
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: 320,
          text: authModalTab === 'register' ? 'signup_with' : 'signin_with'
        });
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    }
  }, [isAuthModalOpen, authModalTab, googleLogin, showToast]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen && !loading) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal, loading]);

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      if (authModalTab === 'login') {
        await login(formData.email, formData.password);
        showToast('Welcome back!');
      } else if (authModalTab === 'register') {
        await register(formData.name, formData.email, formData.password);
        showToast('Account created successfully!');
      } else if (authModalTab === 'forgot') {
        const res = await apiFetch('/api/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email })
        });
        const data = await res.json();
        setInfoMsg(data.message || 'Check your email for reset instructions.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) closeAuthModal();
      }}
    >
      <div className="modal-card" style={{ maxWidth: '440px' }} role="dialog" aria-labelledby="authTitle">
        <div className="dlg">
          <div className="head">
            <h2 id="authTitle">
              {authModalTab === 'login' && 'Sign in to kawai.makes'}
              {authModalTab === 'register' && 'Create an account'}
              {authModalTab === 'forgot' && 'Reset your password'}
            </h2>
            <button
              className="x"
              type="button"
              onClick={closeAuthModal}
              disabled={loading}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {/* Tab Switcher */}
          {authModalTab !== 'forgot' && (
            <div className="chips" style={{ margin: '0 0 16px 0' }}>
              <button
                type="button"
                className={`chip ${authModalTab === 'login' ? 'active' : ''}`}
                onClick={() => setAuthModalTab('login')}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`chip ${authModalTab === 'register' ? 'active' : ''}`}
                onClick={() => setAuthModalTab('register')}
              >
                Create account
              </button>
            </div>
          )}

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

          {infoMsg && (
            <div
              style={{
                background: 'var(--matcha)',
                color: 'var(--ink)',
                padding: '10px 14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '14px'
              }}
            >
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {authModalTab === 'register' && (
              <div className="field">
                <label htmlFor="regName">Full Name</label>
                <input
                  type="text"
                  id="regName"
                  name="name"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="authEmail">Email Address</label>
              <input
                type="email"
                id="authEmail"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {authModalTab !== 'forgot' && (
              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="authPass">Password</label>
                  {authModalTab === 'login' && (
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 0,
                        color: 'var(--muted)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                      onClick={() => setAuthModalTab('forgot')}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  id="authPass"
                  name="password"
                  required
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            )}

            <button className="btn" type="submit" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Please wait...' : authModalTab === 'login' ? 'Sign in' : authModalTab === 'register' ? 'Create account' : 'Send reset link'}
            </button>
          </form>

          {authModalTab === 'forgot' && (
            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button
                type="button"
                className="rm"
                style={{ fontSize: '0.9rem', color: 'var(--muted)', background: 'none', border: 0, cursor: 'pointer' }}
                onClick={() => setAuthModalTab('login')}
              >
                Back to Sign in
              </button>
            </div>
          )}

          {/* Google Sign In Option */}
          {authModalTab !== 'forgot' && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '18px 0',
                  color: 'var(--muted)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                <span>or</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div ref={googleBtnRef} style={{ minHeight: '44px' }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
