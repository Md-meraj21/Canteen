import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import '../styles/Home.css';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'ShopKaro Canteen Specials',
    subtitle: 'Exclusive deals for personnel',
    gradient: 'linear-gradient(135deg, #4B5320 0%, #2F3512 100%)',
    emoji: '🎖️',
  },
  {
    id: 2,
    title: 'Daily Essentials',
    subtitle: 'Groceries, home, health, and more',
    gradient: 'linear-gradient(135deg, #2E8B57 0%, #006400 100%)',
    emoji: '🛒',
  },
  {
    id: 3,
    title: 'Electronics Deals',
    subtitle: 'Phones, laptops, accessories, and gear',
    gradient: 'linear-gradient(135deg, #355E3B 0%, #1F3D2B 100%)',
    emoji: '⚡',
  },
];

const Home = () => {
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
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll(),
          categoriesAPI.getAll(),
        ]);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Products load nahi ho pa rahe. Backend check karo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

    if (sortOption === 'price-low') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortOption === 'price-high') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sortOption === 'rating') {
      result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return result;
  }, [products, selectedCategory, searchTerm, sortOption]);

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-wrapper">
          <div
            className="hero-slide"
            style={{ background: HERO_SLIDES[currentSlide].gradient }}
          >
            <div className="hero-content">
              <span className="hero-emoji">{HERO_SLIDES[currentSlide].emoji}</span>
              <h1 className="hero-title">{HERO_SLIDES[currentSlide].title}</h1>
              <p className="hero-subtitle">{HERO_SLIDES[currentSlide].subtitle}</p>
              <button type="button" className="hero-cta">Shop Now</button>
            </div>
          </div>

          <div className="hero-dots">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="main-content-section">
        <div className="content-wrapper">
          {showFilters && (
            <button
              type="button"
              className="filter-backdrop"
              aria-label="Close filters"
              onClick={() => setShowFilters(false)}
            />
          )}

          <aside className={`filter-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filter-header-mobile">
              <h3>Filters</h3>
              <button type="button" onClick={() => setShowFilters(false)}>×</button>
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Categories</h3>
              <div className="category-list">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => selectCategory(category)}
                  >
                    <span>{category === 'All' ? 'All Products' : category}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="products-main">
            <div className="products-header-bar">
              <div className="header-left">
                <h2>{selectedCategory === 'All' ? 'All Products' : selectedCategory}</h2>
                <span className="product-count">({filteredProducts.length} items)</span>
              </div>

              <div className="products-actions">
                <button
                  type="button"
                  className="toggle-filter-btn"
                  onClick={() => setShowFilters(true)}
                >
                  Filters
                </button>
                <select
                  className="sort-dropdown"
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value)}
                >
                  <option value="default">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Average Rating</option>
                </select>
              </div>
            </div>

            {loading && <div className="loading-state">Loading products...</div>}
            {error && <div className="empty-state">{error}</div>}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <p>No products found.</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
};

export default Home;
