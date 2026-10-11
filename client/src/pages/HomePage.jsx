import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Shop from '../components/Shop';
import CustomOrderSection from '../components/CustomOrderSection';
import Footer from '../components/Footer';
import BagDrawer from '../components/BagDrawer';
import ProductModal from '../components/ProductModal';
import CheckoutModal from '../components/CheckoutModal';
import OrderConfirmationModal from '../components/OrderConfirmationModal';
import Toast from '../components/Toast';

export const HomePage = () => {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Shop />
        <CustomOrderSection />
      </main>
      <Footer />

      {/* Overlays, Modals and Drawers */}
      <BagDrawer />
      <ProductModal />
      <CheckoutModal />
      <OrderConfirmationModal />
      <Toast />
    </>
  );
};

export default HomePage;
