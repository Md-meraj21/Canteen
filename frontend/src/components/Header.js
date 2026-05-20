import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaMapMarkerAlt, FaSearch, FaShoppingCart, FaStore, FaTimes, FaUser } from 'react-icons/fa';
import { locationAPI } from '../services/api';
import { useAuthStore, useCartStore, useWishlistStore } from '../context/store';
import '../styles/Header.css';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      return localStorage.getItem('selectedLocation') || '';
    } catch {
      return '';
    }
  });
  const [locationMessage, setLocationMessage] = useState('');

  const formatLocation = (location) => [location.name, location.state, location.country]
    .filter(Boolean)
    .join(', ');

  const saveLocation = (location) => {
    const label = formatLocation(location);
    const details = {
      label,
      city: location.name || '',
      state: location.state || '',
      country: location.country || '',
      latitude: location.lat,
      longitude: location.lon,
    };

    setSelectedLocation(label);
    localStorage.setItem('selectedLocation', label);
    localStorage.setItem('selectedLocationDetails', JSON.stringify(details));
    setLocationQuery('');
    setLocationResults([]);
    setLocationMessage('');
    setIsLocationOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    const query = locationQuery.trim();
    if (!query) return;

    setLocationMessage('Searching...');
    try {
      const response = await locationAPI.search(query);
      const results = Array.isArray(response.data) ? response.data : [];
      if (results.length === 0) {
        setLocationMessage('Location not found');
        setLocationResults([]);
        return;
      }

      setLocationResults(results);
      setLocationMessage('');
    } catch (error) {
      setLocationMessage(
        error.message === 'OPENWEATHER_KEY_MISSING'
          ? 'Add OpenWeather API key'
          : error.message === 'OPENWEATHER_URL_MISSING'
            ? 'Add OpenWeather API URL'
            : 'Location search failed'
      );
      setLocationResults([]);
    }
  };

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Live location is not supported');
      return;
    }

    setIsLocating(true);
    setLocationMessage('Getting live location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await locationAPI.reverse(latitude, longitude);
          const firstLocation = Array.isArray(response.data) ? response.data[0] : null;
          if (!firstLocation) {
            setLocationMessage('Unable to read live location');
            return;
          }
          saveLocation(firstLocation);
        } catch (error) {
          setLocationMessage(
            error.message === 'OPENWEATHER_KEY_MISSING'
              ? 'Add OpenWeather API key'
              : error.message === 'OPENWEATHER_URL_MISSING'
                ? 'Add OpenWeather API URL'
                : 'Live location failed'
          );
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setLocationMessage('Location permission denied');
        setIsLocating(false);
      }
    );
  };

  const openLocationModal = (e) => {
    e.preventDefault();
    setIsLocationOpen(true);
    setLocationMessage('');
  };

  const closeLocationModal = () => {
    setIsLocationOpen(false);
    setLocationMessage('');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <span className="logo-icon"><FaStore /></span>
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
          <button type="submit" className="search-btn" aria-label="Search products">
            <FaSearch />
          </button>
        </form>

        <a href="#location" className="location-box" onClick={openLocationModal}>
          <span className="location-pin"><FaMapMarkerAlt /></span>
          <span className="location-link-text">
            {selectedLocation || 'Add location'}
          </span>
        </a>

        <div className="header-actions">
          <Link to="/wishlist" className="icon-btn" title="Wishlist">
            <span className="icon"><FaHeart /></span>
            <span className="count">{wishlistItems.length}</span>
          </Link>
          <Link to="/cart" className="icon-btn" title="Cart">
            <span className="icon"><FaShoppingCart /></span>
            <span className="count">{items.length}</span>
          </Link>
          {user ? (
            <div className="user-menu">
              <button className="icon-btn user-btn" title="Account">
                <span className="icon"><FaUser /></span>
              </button>
              <div className="dropdown-menu">
                <div className="user-info">{user.name}</div>
                <Link to="/profile" className="dropdown-item">Profile</Link>
                <Link to="/orders" className="dropdown-item">Orders</Link>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="dropdown-item admin">Dashboard</Link>
                    <Link to="/admin/orders" className="dropdown-item admin">Admin Orders</Link>
                    <Link to="/admin/verification" className="dropdown-item admin">Verify Users</Link>
                  </>
                )}
                <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
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

      <nav className="category-nav">
        <Link to="/?category=Phones" className="nav-item">Phones</Link>
        <Link to="/?category=Laptops" className="nav-item">Laptops</Link>
        <Link to="/?category=Electronics" className="nav-item">Electronics</Link>
        <Link to="/?category=Groceries" className="nav-item">Groceries</Link>
        <Link to="/?category=Home & Kitchen" className="nav-item">Home & Kitchen</Link>
        <Link to="/?category=Clothing" className="nav-item">Fashion</Link>
        <Link to="/?category=Books" className="nav-item">Books</Link>
        <Link to="/?category=Sports" className="nav-item">Sports</Link>
        <Link to="/?category=Beauty" className="nav-item">Beauty</Link>
      </nav>

      {isLocationOpen && (
        <div className="location-modal-backdrop" role="presentation" onClick={closeLocationModal}>
          <div className="location-modal" role="dialog" aria-modal="true" aria-labelledby="location-title" onClick={(e) => e.stopPropagation()}>
            <div className="location-modal-header">
              <div>
                <h2 id="location-title">Choose location</h2>
                {selectedLocation && <p>Current: {selectedLocation}</p>}
              </div>
              <button type="button" className="location-close-btn" onClick={closeLocationModal} aria-label="Close location popup">
                <FaTimes />
              </button>
            </div>

            <form className="location-search-form" onSubmit={handleLocationSearch}>
              <input
                type="text"
                placeholder="Search city, state, or country"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="location-modal-input"
                autoFocus
              />
              <button type="submit" className="location-primary-btn">Search</button>
            </form>

            <button type="button" className="location-live-btn" onClick={handleUseLiveLocation} disabled={isLocating}>
              {isLocating ? 'Detecting...' : 'Use live location'}
            </button>

            {locationMessage && <p className="location-modal-message">{locationMessage}</p>}

            {locationResults.length > 0 && (
              <div className="location-results">
                {locationResults.map((location) => (
                  <button
                    type="button"
                    key={`${location.name}-${location.state || ''}-${location.country}-${location.lat}-${location.lon}`}
                    className="location-result-item"
                    onClick={() => saveLocation(location)}
                  >
                    <span>{formatLocation(location)}</span>
                    {location.lat && location.lon && (
                      <small>{Number(location.lat).toFixed(3)}, {Number(location.lon).toFixed(3)}</small>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
