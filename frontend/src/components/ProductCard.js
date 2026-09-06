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
      <article className="relative flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-lg">
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
              className="!absolute left-1 top-1 !h-4 !text-[9px] !font-bold sm:!left-3 sm:!top-3 sm:!h-6 sm:!text-xs"
            />
          )}
          <Tooltip title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
            <IconButton
              type="button"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={handleToggleWishlist}
              size="small"
              className="!absolute right-1 top-1 !bg-white/90 !p-1 !text-xs sm:!right-3 sm:!top-3 sm:!p-2 sm:!text-base"
              color={isWishlisted ? 'error' : 'default'}
            >
              {isWishlisted ? <FaHeart /> : <FaRegHeart />}
            </IconButton>
          </Tooltip>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-1.5 sm:gap-3 sm:p-4">
          <div>
            <p className="hidden text-xs font-semibold uppercase tracking-wide text-emerald-700 sm:block">{product.category || 'Product'}</p>
            <h3 className="line-clamp-2 min-h-8 text-[11px] font-bold leading-4 text-slate-950 sm:mt-1 sm:min-h-0 sm:text-base sm:leading-normal">{product.name}</h3>
          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <Rating value={Number(product.rating || 0)} precision={0.5} readOnly size="small" />
            <span>({product.numberOfReviews || 0})</span>
          </div>

          <div className="mt-auto">
            <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 sm:gap-2">
              <span className="text-[12px] font-extrabold leading-none text-slate-950 sm:text-xl sm:leading-normal">{money(product.price)}</span>
              {product.originalPrice && (
                <span className="text-[10px] leading-none text-slate-400 line-through sm:text-sm sm:leading-normal">{money(product.originalPrice)}</span>
              )}
            </div>
            <p className={product.stock > 0 ? 'mt-1 hidden text-sm font-semibold text-emerald-700 sm:block' : 'mt-1 hidden text-sm font-semibold text-red-600 sm:block'}>
              {product.stock > 0 ? 'In stock' : 'Out of stock'}
            </p>
          </div>

          <IconButton
            type="button"
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            size="small"
            className="!absolute bottom-1 right-1 !hidden !bg-emerald-700 !p-1 !text-[10px] !text-white disabled:!bg-slate-300 max-[639px]:!inline-flex"
          >
            <FaShoppingCart />
          </IconButton>

          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<FaShoppingCart />}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="max-[639px]:!hidden"
          >
            Add to Cart
          </Button>
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;
