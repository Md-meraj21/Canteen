import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const [searchParams] = useSearchParams();
  
  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default'); // Added Sort State
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showFilters, setShowFilters] = useState(true);

  // --- CONSTANTS ---
  const HERO_SLIDES = [
    { 
      id: 1, 
      title: 'ShopKaro Canteen Specials', 
      subtitle: 'Exclusive deals for personnel', 
      // Army Green Gradient
      gradient: 'linear-gradient(135deg, #4B5320 0%, #2F3512 100%)', 
      emoji: '🎖️' 
    },
    { 
      id: 2, 
      title: 'Tactical Gear', 
      subtitle: 'Shoes, Bags & Uniforms', 
      // Desert Sand/Brown Gradient
      gradient: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)', 
      emoji: '🥾' 
    },
    { 
      id: 3, 
      title: 'Fitness & Nutrition', 
      subtitle: 'Stay combat ready', 
      // Forest Green Gradient
      gradient: 'linear-gradient(135deg, #2E8B57 0%, #006400 100%)', 
      emoji: '💪' 
    },
  ];

  // --- EFFECTS ---

  // 1. Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll(),
          categoriesAPI.getAll()
        ]);
        setProducts(productsRes.data);
        setFilteredProducts(productsRes.data); // Initial render
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Sync with URL Params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    setSelectedCategory(category || 'All');
    setSearchTerm(search || '');
  }, [searchParams]);

  // 3. Filter AND Sort Logic (Combined)
  useEffect(() => {
    let result = [...products]; // Create a copy

    // A. Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // B. Filter by Search
    if (searchTerm) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // C. Sort Logic
    if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating); 
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, products, sortOption]); // Updates when sortOption changes

  // 4. Hero Slider Rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [HERO_SLIDES.length]);


  // --- RENDER ---
  return (
    <div className="home-container">
      
      {/* Hero Section */}
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
                <button className="hero-cta">Shop Now</button>
            </div>
            </div>
            
            <div className="hero-dots">
                {HERO_SLIDES.map((_, idx) => (
                    <span 
                        key={idx} 
                        className={`dot ${idx === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(idx)}
                    ></span>
                ))}
            </div>
        </div>
      </section>

      {/* Main Content: Sidebar + Grid */}
      <section className="main-content-section">
        <div className="content-wrapper">
            
          {/* Sidebar Filters */}
          <aside className={`filter-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filter-header-mobile">
              <h3>Filters</h3>
              <button onClick={() => setShowFilters(false)}>✕</button>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h3 className="filter-title">Categories</h3>
              <div className="category-list">
                <div 
                    className={`category-item ${selectedCategory === 'All' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('All')}
                >
                    <span>All Products</span>
                </div>

                {categories.map((cat) => (
                  <div key={cat._id} className="category-wrapper">
                    <div
                      className={`category-item ${expandedCategories[cat.name] ? 'expanded' : ''}`}
                      onClick={() => setExpandedCategories(prev => ({...prev, [cat.name]: !prev[cat.name]}))}
                    >
                      <span className="cat-label">{cat.icon} {cat.name}</span>
                      <span className="arrow">⌄</span>
                    </div>
                    
                    <div className={`subcategory-list ${expandedCategories[cat.name] ? 'open' : ''}`}>
                      {cat.subcategories.map(subcat => (
                        <div 
                            key={subcat} 
                            className="subcategory-item"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory(subcat);
                            }}
                        >
                          {subcat}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h3 className="filter-title">Price</h3>
              <div className="checkbox-group">
                {['Under ₹500', '₹500 - ₹2000', '₹2000 - ₹10,000', 'Above ₹10,000'].map((label, idx) => (
                    <label key={idx} className="custom-checkbox">
                        <input type="checkbox" name="price" />
                        <span className="checkmark"></span>
                        {label}
                    </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <h3 className="filter-title">Rating</h3>
              <div className="checkbox-group">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <label key={stars} className="custom-checkbox">
                    <input type="checkbox" name="rating" />
                    <span className="checkmark"></span>
                    <span className="stars">{'★'.repeat(stars)}{'☆'.repeat(5-stars)} </span>
                  </label>
                ))}
              </div>
            </div>
            
            <button className="reset-btn" onClick={() => setSelectedCategory('All')}>
                Reset Filters
            </button>
          </aside>

          {/* Products Grid */}
          <main className="products-main">
            {/* Header Bar with Sort */}
            <div className="products-header-bar">
               <div className="header-left">
                 <h2>{selectedCategory === 'All' ? 'All Products' : selectedCategory}</h2>
                 <span className="product-count">({filteredProducts.length} items)</span>
               </div>

               <div className="header-actions">
                   <div className="sort-container">
                     <span className="sort-label">Sort by:</span>
                     <select 
                       className="sort-dropdown"
                       value={sortOption}
                       onChange={(e) => setSortOption(e.target.value)}
                     >
                       <option value="default">Popularity</option>
                       <option value="price-low">Price: Low to High</option>
                       <option value="price-high">Price: High to Low</option>
                       <option value="rating">Average Rating</option>
                     </select>
                   </div>
                   
                   {!showFilters && (
                        <button className="toggle-filter-btn" onClick={() => setShowFilters(true)}>
                            Filter
                        </button>
                   )}
               </div>
            </div>

            {/* Grid Content */}
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
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