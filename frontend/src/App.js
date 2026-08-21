import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import VerificationPending from './pages/VerificationPending';
import VerificationDashboard from './pages/VerificationDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import ForgotPassword from './pages/ForgotPassword';
import { useAuthStore } from './context/store';

const AUTH_POPUP_DELAY_MS = 7000;
const AUTH_POPUP_DISMISSED_KEY = 'authPopupDismissed';
const quietAuthPaths = ['/login', '/register', '/forgot-password', '/verification-pending'];

function AppShell() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  // Check if user has pending registration
  const pendingEmail = localStorage.getItem('pendingRegistrationEmail');

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    sessionStorage.setItem(AUTH_POPUP_DISMISSED_KEY, 'true');
  };

  useEffect(() => {
    if (user || quietAuthPaths.includes(location.pathname)) return undefined;
    if (sessionStorage.getItem(AUTH_POPUP_DISMISSED_KEY) === 'true') return undefined;

    const popupTimer = window.setTimeout(() => {
      if (!useAuthStore.getState().user) {
        openAuthModal('login');
      }
    }, AUTH_POPUP_DELAY_MS);

    return () => window.clearTimeout(popupTimer);
  }, [location.pathname, user]);

  useEffect(() => {
    if (user && authModalOpen) {
      setAuthModalOpen(false);
    }
  }, [authModalOpen, user]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header onLoginClick={() => openAuthModal('login')} />
      <main className="w-full flex-1">
        <Routes>
          {/* If user has pending registration and tries to go to register, show verification pending */}
          <Route
            path="/register"
            element={pendingEmail ? <VerificationPending /> : <Register />}
          />
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verification-pending" element={<VerificationPending />} />
          <Route path="/admin/verification" element={<VerificationDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal
        open={authModalOpen && !user}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={closeAuthModal}
      />
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppShell />
    </Router>
  );
}

export default App;
