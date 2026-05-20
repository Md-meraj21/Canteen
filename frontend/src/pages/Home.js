import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Chip, Drawer, FormControl, InputLabel, MenuItem, Select, Skeleton } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import { page, panel } from '../utils/ui';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'ShopCart Canteen Specials',
    subtitle: 'Exclusive deals for personnel',
    className: 'from-emerald-950 via-lime-950 to-slate-950',
  },
  {
    id: 2,
    title: 'Daily Essentials',
    subtitle: 'Groceries, home, health, and more',
    className: 'from-emerald-900 via-teal-900 to-slate-950',
  },
  {
    id: 3,
    title: 'Electronics Deals',
    subtitle: 'Phones, laptops, accessories, and gear',
    className: 'from-slate-950 via-emerald-950 to-lime-950',
  },
];

function Home() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const categoryParam = searchParams.get('category') || '';
        const searchParam = searchParams.get('search') || '';
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll({
            category: categoryParam && categoryParam !== 'All' ? categoryParam : undefined,
            search: searchParam || undefined,
          }),
          categoriesAPI.getAll(),
        ]);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Products are not loading. Please check the backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All');
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const categoryOptions = useMemo(() => {
    const productCategories = products.map((product) => product.category).filter(Boolean);
    const dbCategories = categories.map((category) => category.name).filter(Boolean);
    return ['All', ...Array.from(new Set([...productCategories, ...dbCategories]))];
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter((product) => product.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((product) =>
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      );
    }

    if (sortOption === 'price-low') result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortOption === 'price-high') result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortOption === 'rating') result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

    return result;
  }, [products, selectedCategory, searchTerm, sortOption]);

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  const filters = (
    <div className="w-72 max-w-[85vw] p-4 lg:w-auto lg:max-w-none lg:p-0">
      <h3 className="text-lg font-bold text-slate-950">Categories</h3>
      <div className="mt-4 grid gap-2">
        {categoryOptions.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'contained' : 'outlined'}
            color="success"
            onClick={() => selectCategory(category)}
            className="!justify-start"
          >
            {category === 'All' ? 'All Products' : category}
          </Button>
        ))}
      </div>
    </div>
  );

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className={page}>
      <section className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${slide.className} px-4 py-4 text-white shadow-lg sm:px-8 sm:py-7`}>
        <div className="max-w-2xl">
          <Chip label="Canteen Specials" size="small" className="!mb-3 !hidden !bg-white/15 !font-bold !text-white sm:!inline-flex" />
          <h1 className="text-xl font-black tracking-tight sm:text-3xl">{slide.title}</h1>
          <p className="mt-1.5 max-w-xl text-sm text-emerald-50 sm:mt-2 sm:text-base">{slide.subtitle}</p>
          <Button variant="contained" color="success" size="small" className="!mt-3 sm:!mt-4 sm:!text-sm">
            Shop Now
          </Button>
        </div>
        <div className="mt-3 flex gap-2 sm:mt-5">
          {HERO_SLIDES.map((hero, index) => (
            <button
              key={hero.id}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              className={`h-2.5 rounded-full transition ${index === currentSlide ? 'w-9 bg-white' : 'w-2.5 bg-white/45'}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={`${panel} hidden h-max self-start p-4 lg:block`}>{filters}</aside>
        <Drawer open={showFilters} onClose={() => setShowFilters(false)} PaperProps={{ className: '!max-w-[90vw]' }}>
          {filters}
        </Drawer>

        <main className="min-w-0">
          <div className={`${panel} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h2>
              <p className="text-sm text-slate-500">{filteredProducts.length} items found</p>
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:flex">
              <Button variant="outlined" color="success" onClick={() => setShowFilters(true)} className="lg:!hidden">
                Filters
              </Button>
              <FormControl size="small" className="min-w-0 sm:min-w-48">
                <InputLabel>Sort</InputLabel>
                <Select label="Sort" value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
                  <MenuItem value="default">Popularity</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Average Rating</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {loading && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={420} />
              ))}
            </div>
          )}

          {error && <div className={`${panel} mt-6 p-6 text-red-700`}>{error}</div>}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className={`${panel} mt-6 p-10 text-center`}>
              <h3 className="text-lg font-bold text-slate-950">No products found</h3>
              <p className="mt-2 text-sm text-slate-500">Try a different category or search term.</p>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

export default Home;
