import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ThanksPage from './pages/ThanksPage';
import TrackingPage from './pages/TrackingPage';
import AdminPage from './pages/AdminPage';
import AuthModal from './components/AuthModal';
import SleepBanner from './components/SleepBanner';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SleepBanner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/thanks/:orderId" element={<ThanksPage />} />
            <Route path="/order/:orderId" element={<TrackingPage />} />
            <Route path="/order" element={<TrackingPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
          </Routes>
          <AuthModal />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
