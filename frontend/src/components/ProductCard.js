import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Chip, IconButton, Rating, Tooltip } from '@mui/material';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { useCartStore, useWishlistStore } from '../context/store';
import { money } from '../utils/ui';

function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product._id));
  const discountPercent = Number(product.discount || 0);
  const fallbackImage = `https://via.placeholder.com/600x600?text=${encodeURIComponent(product.name || 'Product')}`;
  const image = imageError ? fallbackImage : product.images?.[0] || fallbackImage;

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(product, 1);
  };

  const handleToggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link to={`/product/${product._id}`} className="group block h-full text-inherit no-underline">
      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-square bg-slate-100">
          <img
            src={image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {discountPercent > 0 && (
            <Chip
              label={`${discountPercent}% OFF`}
              color="success"
              size="small"
              className="!absolute left-3 top-3 !font-bold"
            />
          )}
          <Tooltip title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
            <IconButton
              type="button"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={handleToggleWishlist}
              className="!absolute right-3 top-3 !bg-white/90"
              color={isWishlisted ? 'error' : 'default'}
            >
              {isWishlisted ? <FaHeart /> : <FaRegHeart />}
            </IconButton>
          </Tooltip>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{product.category || 'Product'}</p>
            <h3 className="mt-1 line-clamp-2 text-base font-bold text-slate-950">{product.name}</h3>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Rating value={Number(product.rating || 0)} precision={0.5} readOnly size="small" />
            <span>({product.numberOfReviews || 0})</span>
          </div>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-950">{money(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">{money(product.originalPrice)}</span>
              )}
            </div>
            <p className={product.stock > 0 ? 'mt-1 text-sm font-semibold text-emerald-700' : 'mt-1 text-sm font-semibold text-red-600'}>
              {product.stock > 0 ? 'In stock' : 'Out of stock'}
            </p>
          </div>

          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<FaShoppingCart />}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Add to Cart
          </Button>
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;
