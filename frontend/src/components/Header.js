import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../context/store';
import '../styles/Header.css';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${searchTerm}`);
      setSearchTerm('');
    }
  };

  return (
    <header className="header">
      {/* Main Header */}
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <span className="logo-icon">🛍️</span>
            <div className="logo-info">
              <span className="logo-text">ShopKaro</span>
              <span className="logo-tagline">Premium Shopping</span>
            </div>
          </Link>
        </div>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for products, brands, and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>

        <div className="header-actions">
          <button className="icon-btn" title="Wishlist">
            <span className="icon">❤️</span>
            <span className="count">0</span>
          </button>
          <Link to="/cart" className="icon-btn" title="Cart">
            <span className="icon">🛒</span>
            <span className="count">{items.length}</span>
          </Link>
          {user ? (
            <div className="user-menu">
              <button className="icon-btn user-btn" title="Account">
                <span className="icon">👤</span>
              </button>
              <div className="dropdown-menu">
                <div className="user-info">{user.name}</div>
                <Link to="/profile" className="dropdown-item">👤 Profile</Link>
                <Link to="/orders" className="dropdown-item">📦 Orders</Link>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="dropdown-item admin">Dashboard</Link>
                    <Link to="/admin/orders" className="dropdown-item admin">📊 Admin Orders</Link>
                    <Link to="/admin/verification" className="dropdown-item admin">🎖️ Verify Users</Link>
                  </>
                )}
                <button onClick={handleLogout} className="dropdown-item logout">🚪 Logout</button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link">Login</Link>
              <Link to="/register" className="auth-link">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      <nav className="category-nav">
        <Link to="/?category=Phones" className="nav-item">📱 Phones</Link>
        <Link to="/?category=Laptops" className="nav-item">💻 Laptops</Link>
        <Link to="/?category=Electronics" className="nav-item">⚡ Electronics</Link>
        <Link to="/?category=Groceries" className="nav-item">🛍️ Groceries</Link>
        <Link to="/?category=Home & Kitchen" className="nav-item">🏠 Home & Kitchen</Link>
        <Link to="/?category=Clothing" className="nav-item">👕 Fashion</Link>
        <Link to="/?category=Books" className="nav-item">📚 Books</Link>
        <Link to="/?category=Sports" className="nav-item">🎯 Sports</Link>
        <Link to="/?category=Beauty" className="nav-item">✨ Beauty</Link>
      </nav>
    </header>
  );
}

export default Header;
