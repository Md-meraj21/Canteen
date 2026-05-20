import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useWishlistStore } from '../context/store';
import '../styles/Wishlist.css';

function Wishlist() {
  const wishlistItems = useWishlistStore((state) => state.items);

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <p>Saved Products</p>
          <h1>Wishlist</h1>
        </div>
        <span>{wishlistItems.length} items</span>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="products-grid wishlist-grid">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="wishlist-empty">
          <h2>No products in wishlist</h2>
          <p>Product card par heart button dabakar items save karo.</p>
          <Link to="/">Browse Products</Link>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
