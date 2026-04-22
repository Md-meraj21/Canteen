import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../context/store';
import '../styles/ProductCard.css';

function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const discountPercent = product.discount || 0;
  const displayPrice = product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    alert(`${product.name} added to cart!`);
  };

  const fallbackImage = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(product.name.substring(0, 20));

  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="product-card">
        <div className="product-image">
          <img
            src={imageError ? fallbackImage : (product.images && product.images[0] ? product.images[0] : fallbackImage)}
            alt={product.name}
            onError={() => setImageError(true)}
          />
          {discountPercent > 0 && (
            <span className="discount-badge">{discountPercent}% OFF</span>
          )}
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="category">{product.category}</p>
          <div className="rating">
            {'⭐'.repeat(Math.round(product.rating))} ({product.numberOfReviews})
          </div>
          <div className="price">
            <span className="current-price">₹{displayPrice}</span>
            {product.originalPrice && (
              <span className="original-price">₹{product.originalPrice}</span>
            )}
          </div>
          <p className="stock">{product.stock > 0 ? '✓ In Stock' : '✗ Out of Stock'}</p>
          <button
            className="btn-cart-full"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
