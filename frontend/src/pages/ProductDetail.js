import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI } from '../services/api';
import { useAuthStore, useCartStore } from '../context/store';
import '../styles/ProductDetail.css';
import Button from '@mui/material/Button';



function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', id);
        setLoading(true);
        const response = await productsAPI.getById(id);
        console.log('Product response:', response);
        if (response.data) {
          setProduct(response.data);
          setError(null);
        } else {
          setError('Product data not found');
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await cartAPI.add(product._id, quantity);
      addItem(product, quantity);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart');
    }
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">❌ {error}</div>;
  if (!product) return <div className="error">❌ Product not found</div>;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [`https://via.placeholder.com/700x700?text=${encodeURIComponent(product.name || 'Product')}`];

  return (
    <div className="product-detail">
      <div className="product-images">
        <img src={images[0]} alt={product.name} className="main-image" />
        <div className="thumbnail-images">
          {images.map((img, idx) => (
            <img key={idx} src={img} alt={`View ${idx}`} />
          ))}
        </div>
      </div>

      <div className="product-details">
        <div className="product-header">
          <h1>{product.name}</h1>
          <p className="category">📦 {product.category}</p>
        </div>

        <div className="rating-section">
          <div className="rating">
            <span className="stars">{'⭐'.repeat(Math.round(product.rating))}</span>
            <span className="review-count">({product.numberOfReviews} reviews)</span>
          </div>
        </div>

        <div className="pricing-section">
          <div className="pricing">
            <span className="current-price">₹{product.price}</span>
            {product.originalPrice && (
              <span className="original-price">₹{product.originalPrice}</span>
            )}
            {product.discount > 0 && (
              <span className="discount-badge">{product.discount}% OFF</span>
            )}
          </div>
        </div>

        <div className="stock-info">
          {product.stock > 0 ? (
            <span className="in-stock">✓ In Stock ({product.stock} available)</span>
          ) : (
            <span className="out-of-stock">✗ Out of Stock</span>
          )}
        </div>

        <hr className="divider" />

        <div className="description">
          <h3>📋 About this item</h3>
          <p>{product.description}</p>
        </div>

        <div className="specifications">
          <h3>📊 Specifications</h3>
          {product.specifications && Object.keys(product.specifications).length > 0 ? (
            <ul className="specs-list">
              {product.specifications.brand && <li><strong>Brand:</strong> {product.specifications.brand}</li>}
              {product.specifications.color && <li><strong>Color:</strong> {product.specifications.color}</li>}
              {product.specifications.size && <li><strong>Size:</strong> {product.specifications.size}</li>}
              {product.specifications.weight && <li><strong>Weight:</strong> {product.specifications.weight}</li>}
              {product.specifications.warranty && <li><strong>Warranty:</strong> {product.specifications.warranty}</li>}
              {product.specifications.material && <li><strong>Material:</strong> {product.specifications.material}</li>}
            </ul>
          ) : (
            <p className="no-specs">No specifications available</p>
          )}
        </div>

        <hr className="divider" />

        <div className="cart-section">
          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn">−</button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product.stock}
              />
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="qty-btn">+</button>
            </div>
          </div>

          <Button
            variant="contained"
             color="success"
            className="add-to-cart"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? '✗ Out of Stock' : '🛒 Add to Cart'}
          </Button>

          {!user && (
            <p className="login-hint">💡 You need to login to purchase this item</p>
          )}
        </div>

        <div className="additional-info">
          <p>✓ Secure checkout</p>
          <p>✓ Easy returns within 7 days</p>
          <p>✓ Free shipping on orders above ₹500</p>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
