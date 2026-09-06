import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Chip } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { useWishlistStore } from '../context/store';
import { page, panel } from '../utils/ui';

function Wishlist() {
  const wishlistItems = useWishlistStore((state) => state.items);

  return (
    <div className={page}>
      <div className={`${panel} flex flex-row items-center justify-between gap-3 p-3 sm:p-5`}>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Saved Products</p>
          <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Wishlist</h1>
        </div>
        <Chip label={`${wishlistItems.length} items`} color="success" variant="outlined" />
      </div>

      {wishlistItems.length > 0 ? (
        <div className="mt-2 grid grid-cols-3 gap-2 min-[430px]:grid-cols-4 sm:mt-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className={`${panel} mt-3 p-6 text-center sm:mt-6 sm:p-10`}>
          <h2 className="text-xl font-bold text-slate-950">No products in wishlist</h2>
          <p className="mt-2 text-slate-500">Save products with the heart button on product cards.</p>
          <Button component={Link} to="/" variant="contained" color="success" className="!mt-6">
            Browse Products
          </Button>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
