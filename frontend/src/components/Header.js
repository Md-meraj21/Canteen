import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import { FaHeart, FaMapMarkerAlt, FaSearch, FaShoppingCart, FaTimes, FaUser } from 'react-icons/fa';
import { locationAPI } from '../services/api';
import { useAuthStore, useCartStore, useWishlistStore } from '../context/store';
import logo from '../asests/logo.png';

const categories = ['Phones', 'Laptops', 'Electronics', 'Groceries', 'Home & Kitchen', 'Fashion', 'Books', 'Sports', 'Beauty'];

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
  const [locationMessage, setLocationMessage] = useState('');
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [savedAddressDetails, setSavedAddressDetails] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('selectedLocationDetails') || '{}');
    } catch {
      return {};
    }
  });
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      return localStorage.getItem('selectedLocation') || '';
    } catch {
      return '';
    }
  });

  const formatLocation = (location) => [location.name, location.state, location.country].filter(Boolean).join(', ');

  const getStreetAddress = (address = {}) => [
    address.house_number,
    address.road,
    address.neighbourhood || address.suburb || address.quarter,
  ].filter(Boolean).join(', ');

  const saveLocation = (location, addressDetails = {}) => {
    const address = addressDetails.address || {};
    const city = location.name || address.city || address.town || address.village || address.county || '';
    const state = location.state || address.state || '';
    const country = location.country || address.country || '';
    const label = [city, state, country].filter(Boolean).join(', ');
    const details = {
      label,
      street: getStreetAddress(address),
      city,
      state,
      zipCode: address.postcode || '',
      country,
      latitude: location.lat,
      longitude: location.lon,
    };

    setSelectedLocation(label);
    setSavedAddressDetails(details);
    localStorage.setItem('selectedLocation', label);
    localStorage.setItem('selectedLocationDetails', JSON.stringify(details));
    setLocationQuery('');
    setLocationResults([]);
    setLocationMessage(details.zipCode ? `PIN code found: ${details.zipCode}` : 'Location saved, but PIN code was not returned by the map API.');
    setIsLocationOpen(false);
  };

  const saveLocationWithAddress = async (location) => {
    try {
      setLocationMessage('Fetching street address and ZIP code...');
      const response = await locationAPI.reverseAddress(location.lat, location.lon);
      saveLocation(location, response.data);
    } catch {
      saveLocation(location);
    }
  };

  const handleLogout = () => {
    logout();
    setAccountAnchor(null);
    navigate('/');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleLocationSearch = async (event) => {
    event.preventDefault();
    const query = locationQuery.trim();
    if (!query) return;

    setLocationMessage('Searching...');
    try {
      const response = await locationAPI.search(query);
      const results = Array.isArray(response.data) ? response.data : [];
      setLocationResults(results);
      setLocationMessage(results.length ? '' : 'Location not found');
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
          const [locationResponse, addressResponse] = await Promise.allSettled([
            locationAPI.reverse(latitude, longitude),
            locationAPI.reverseAddress(latitude, longitude),
          ]);
          const firstLocation = locationResponse.status === 'fulfilled' && Array.isArray(locationResponse.value.data)
            ? locationResponse.value.data[0]
            : null;
          const addressData = addressResponse.status === 'fulfilled' ? addressResponse.value.data : {};
          const address = addressData.address || {};
          const fallbackLocation = addressData.address ? {
            name: address.city || address.town || address.village || address.county || addressData.name || '',
            state: address.state || '',
            country: address.country || '',
            lat: latitude,
            lon: longitude,
          } : null;
          if (firstLocation || fallbackLocation) saveLocation(firstLocation || fallbackLocation, addressData);
          else setLocationMessage('Unable to read live location');
        } catch (error) {
          setLocationMessage('Live location failed');
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

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/20 bg-emerald-950 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-2 py-2 sm:gap-3 sm:px-6 sm:py-3 lg:flex-nowrap lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2 text-white no-underline sm:min-w-max sm:gap-3">
          <span className="rounded-md bg-white p-0.5 shadow-sm sm:rounded-lg sm:p-1">
            <img src={logo} alt="ShopCart Logo" className="h-7 w-7 rounded object-contain sm:h-10 sm:w-10 sm:rounded-md" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-black leading-none text-amber-300 sm:text-xl">ShopCart</span>
            <span className="hidden truncate text-[10px] font-bold uppercase tracking-wide text-emerald-100 min-[380px]:block sm:text-[11px]">Premium Shopping</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="order-3 flex w-full overflow-hidden rounded-md bg-white/85 shadow-sm backdrop-blur sm:rounded-lg sm:bg-white lg:order-none lg:ml-4 lg:max-w-xl">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-xs text-slate-950 outline-none placeholder:text-slate-500 sm:px-4 sm:py-3 sm:text-sm"
          />
          <button type="submit" className="grid w-10 place-items-center bg-emerald-700 text-sm text-white sm:w-12 sm:text-base" aria-label="Search products">
            <FaSearch />
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsLocationOpen(true)}
          className="order-4 flex w-full items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-2 py-1.5 text-left text-xs font-semibold transition hover:bg-white/15 sm:w-auto sm:flex-1 sm:gap-2 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm lg:order-none lg:w-56 lg:flex-none"
        >
          <FaMapMarkerAlt className="shrink-0" />
          <span className="truncate">{selectedLocation || 'Add location'}</span>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Tooltip title="Wishlist">
            <IconButton component={Link} to="/wishlist" aria-label="Wishlist" size="small" className="!text-white sm:!p-2">
              <Badge badgeContent={wishlistItems.length} color="error">
                <FaHeart />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Cart">
            <IconButton component={Link} to="/cart" aria-label="Cart" size="small" className="!text-white sm:!p-2">
              <Badge badgeContent={items.length} color="error">
                <FaShoppingCart />
              </Badge>
            </IconButton>
          </Tooltip>

          {user ? (
            <>
              <Tooltip title="Account">
                <IconButton size="small" className="!text-white sm:!p-2" aria-label="Account" onClick={(event) => setAccountAnchor(event.currentTarget)}>
                  <FaUser />
                </IconButton>
              </Tooltip>
              <Menu anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={() => setAccountAnchor(null)}>
                <MenuItem disabled>{user.name}</MenuItem>
                <MenuItem component={Link} to="/profile" onClick={() => setAccountAnchor(null)}>Profile</MenuItem>
                <MenuItem component={Link} to="/orders" onClick={() => setAccountAnchor(null)}>Orders</MenuItem>
                {user.role === 'admin' && (
                  <MenuItem component={Link} to="/admin" onClick={() => setAccountAnchor(null)}>Dashboard</MenuItem>
                )}
                {user.role === 'admin' && (
                  <MenuItem component={Link} to="/admin/orders" onClick={() => setAccountAnchor(null)}>Admin Orders</MenuItem>
                )}
                {user.role === 'admin' && (
                  <MenuItem component={Link} to="/admin/verification" onClick={() => setAccountAnchor(null)}>Verify Users</MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={Link}
              to="/login"
              size="small"
              variant="outlined"
              startIcon={<FaUser />}
              className="!ml-1 !min-w-0 !rounded-full !border-white/50 !px-2 !py-1 !text-[11px] !font-bold !text-white sm:!px-4 sm:!py-1.5 sm:!text-sm"
            >
              Login
            </Button>
          )}
        </div>
      </div>

      <nav className="border-t border-white/10 bg-emerald-900/70">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 sm:gap-2 sm:px-6 lg:px-8">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/?category=${encodeURIComponent(category === 'Fashion' ? 'Clothing' : category)}`}
              className="shrink-0 px-2 py-2 text-xs font-bold text-emerald-100 no-underline transition hover:text-amber-300 sm:px-3 sm:py-3 sm:text-sm"
            >
              {category}
            </Link>
          ))}
        </div>
      </nav>

      <Dialog open={isLocationOpen} onClose={() => setIsLocationOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center justify-between">
          Choose delivery address
          <IconButton onClick={() => setIsLocationOpen(false)} aria-label="Close location popup">
            <FaTimes />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedLocation && <p className="mb-4 text-sm text-slate-500">Current: {selectedLocation}</p>}
          {(savedAddressDetails.street || savedAddressDetails.zipCode) && (
            <div className="mb-4 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-slate-700">
              {savedAddressDetails.street && <p className="mb-1"><strong>Street:</strong> {savedAddressDetails.street}</p>}
              {savedAddressDetails.zipCode && <p><strong>PIN code:</strong> {savedAddressDetails.zipCode}</p>}
            </div>
          )}
          <form onSubmit={handleLocationSearch} className="flex gap-2">
            <TextField
              label="Search city, state, or country"
              value={locationQuery}
              onChange={(event) => setLocationQuery(event.target.value)}
              fullWidth
              autoFocus
            />
            <Button type="submit" variant="contained" color="success">Search</Button>
          </form>
          <Button fullWidth variant="outlined" color="success" className="!mt-3" onClick={handleUseLiveLocation} disabled={isLocating}>
            {isLocating ? 'Detecting...' : 'Use live location'}
          </Button>
          {locationMessage && <p className="mt-3 text-sm text-slate-600">{locationMessage}</p>}
          <div className="mt-4 grid gap-2">
            {locationResults.map((location) => (
              <button
                type="button"
                key={`${location.name}-${location.state || ''}-${location.country}-${location.lat}-${location.lon}`}
                className="rounded-md border border-slate-200 bg-slate-50 p-3 text-left text-sm transition hover:border-emerald-600"
                onClick={() => saveLocationWithAddress(location)}
              >
                <strong>{formatLocation(location)}</strong>
                {location.lat && location.lon && (
                  <span className="block text-xs text-slate-500">{Number(location.lat).toFixed(3)}, {Number(location.lon).toFixed(3)}</span>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

    </header>
  );
}

export default Header;
