import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { apiGet } from './lib/api';
import type { PublicSettings } from './lib/types';
import { CartProvider } from './lib/cart';
import { Header, Footer, WhatsAppFloat, CartDrawer } from './ui';
import Home from './pages/Home';
import { MenuPage, CheckoutPage, ContactPage, NotFound } from './pages/Pages';
import Admin from './admin/Admin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PublicSite() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  useEffect(() => {
    apiGet<PublicSettings>('/api/settings/public').then((r) => r.ok && setSettings(r.data));
  }, []);
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">
        <Routes>
          <Route path="/" element={<Home settings={settings} />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage settings={settings} />} />
          <Route path="/contact" element={<ContactPage settings={settings} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer phone={settings?.phone} address={settings?.address} hours={settings?.hours} />
      <CartDrawer />
      <WhatsAppFloat number={settings?.whatsapp} />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </CartProvider>
  );
}
