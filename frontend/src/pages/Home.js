import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Chip, Drawer, FormControl, InputLabel, MenuItem, Select, Skeleton } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI, heroSlidesAPI } from '../services/api';
import { page, panel } from '../utils/ui';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'ShopCart Canteen Specials',
    subtitle: 'Exclusive deals for personnel',
    badge: 'Canteen Specials',
    ctaText: 'Shop Now',
    ctaLink: '/',
    gradientFrom: '#064e3b',
    gradientTo: '#020617',
  },
  {
    id: 2,
    title: 'Daily Essentials',
    subtitle: 'Groceries, home, health, and more',
    badge: 'Daily Essentials',
    ctaText: 'Shop Now',
    ctaLink: '/',
    gradientFrom: '#14532d',
    gradientTo: '#0f172a',
  },
  {
    id: 3,
    title: 'Electronics Deals',
    subtitle: 'Phones, laptops, accessories, and gear',
    badge: 'Electronics',
    ctaText: 'Shop Now',
    ctaLink: '/?category=Electronics',
    gradientFrom: '#0f172a',
    gradientTo: '#365314',
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
  const [heroSlides, setHeroSlides] = useState(HERO_SLIDES);

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

        try {
          const heroSlidesRes = await heroSlidesAPI.getAll();
          setHeroSlides(Array.isArray(heroSlidesRes.data) && heroSlidesRes.data.length ? heroSlidesRes.data : HERO_SLIDES);
        } catch {
          setHeroSlides(HERO_SLIDES);
        }
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
      setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    setCurrentSlide((current) => current % heroSlides.length);
  }, [heroSlides.length]);

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

  const slide = heroSlides[currentSlide] || HERO_SLIDES[0];
  const heroStyle = {
    backgroundImage: slide.imageUrl
      ? `linear-gradient(90deg, ${slide.gradientFrom || '#064e3b'} 0%, rgba(2, 6, 23, 0.76) 100%), url(${slide.imageUrl})`
      : `linear-gradient(135deg, ${slide.gradientFrom || '#064e3b'}, ${slide.gradientTo || '#020617'})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  };

  return (
    <div className={page}>
      <section className="relative overflow-hidden rounded-md px-3 py-3 text-white shadow-lg sm:rounded-lg sm:px-8 sm:py-7" style={heroStyle}>
        <div className="max-w-2xl">
          <Chip label={slide.badge || 'Canteen Specials'} size="small" className="!mb-3 !hidden !bg-white/15 !font-bold !text-white sm:!inline-flex" />
          <h1 className="text-lg font-black tracking-tight sm:text-3xl">{slide.title}</h1>
          <p className="mt-1 max-w-xl text-xs text-emerald-50 sm:mt-2 sm:text-base">{slide.subtitle}</p>
          <Button href={slide.ctaLink || '/'} variant="contained" color="success" size="small" className="!mt-3 sm:!mt-4 sm:!text-sm">
            {slide.ctaText || 'Shop Now'}
          </Button>
        </div>
        <div className="mt-3 flex gap-2 sm:mt-5">
          {heroSlides.map((hero, index) => (
            <button
              key={hero._id || hero.id}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              className={`h-2.5 rounded-full transition ${index === currentSlide ? 'w-9 bg-white' : 'w-2.5 bg-white/45'}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      <section className="mt-3 grid items-start gap-3 sm:mt-8 sm:gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={`${panel} hidden h-max self-start p-4 lg:block`}>{filters}</aside>
        <Drawer open={showFilters} onClose={() => setShowFilters(false)} PaperProps={{ className: '!max-w-[90vw]' }}>
          {filters}
        </Drawer>

        <main className="min-w-0">
          <div className={`${panel} flex flex-row items-center justify-between gap-2 p-2 sm:gap-4 sm:p-4`}>
            <div>
              <h2 className="text-base font-bold text-slate-950 sm:text-2xl">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h2>
              <p className="text-xs text-slate-500 sm:text-sm">{filteredProducts.length} items found</p>
            </div>

            <div className="grid min-w-[150px] grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5 sm:flex sm:gap-3">
              <Button variant="outlined" color="success" size="small" onClick={() => setShowFilters(true)} className="lg:!hidden">
                Filters
              </Button>
              <FormControl size="small" className="min-w-0 sm:min-w-48" sx={{ '& .MuiSelect-select': { fontSize: { xs: 12, sm: 14 }, paddingBlock: { xs: '6px', sm: '8.5px' } } }}>
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
            <div className="mt-2 grid grid-cols-3 gap-2 min-[430px]:grid-cols-4 sm:mt-6 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" className="!h-40 sm:!h-[420px]" />
              ))}
            </div>
          )}

          {error && <div className={`${panel} mt-6 p-6 text-red-700`}>{error}</div>}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2 min-[430px]:grid-cols-4 sm:mt-6 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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
