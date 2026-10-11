import React from 'react';
import { useAuth } from '../context/AuthContext';

export const SleepBanner = () => {
  const { isWakingUp } = useAuth();

  if (!isWakingUp) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--ink)',
        color: 'var(--bg)',
        padding: '10px 20px',
        borderRadius: '999px',
        fontSize: '0.9rem',
        fontWeight: 700,
        zIndex: 100,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <span>⏳ Waking things up, one moment...</span>
    </div>
  );
};

export default SleepBanner;
