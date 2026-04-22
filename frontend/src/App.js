import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
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

function App() {
  // Check if user has pending registration
  const pendingEmail = localStorage.getItem('pendingRegistrationEmail');

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            {/* If user has pending registration and tries to go to register, show verification pending */}
            <Route 
              path="/register" 
              element={pendingEmail ? <VerificationPending /> : <Register />} 
            />
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verification-pending" element={<VerificationPending />} />
            <Route path="/admin/verification" element={<VerificationDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
