import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI, reviewsAPI, questionsAPI } from '../services/api';
import { useAuthStore, useCartStore, useWishlistStore } from '../context/store';
import '../styles/ProductDetail.css';
import Button from '@mui/material/Button';

const emptyReview = {
  rating: 5,
  title: '',
  comment: '',
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(id));
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [questionText, setQuestionText] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');

  const canAnswerQuestions = user?.role === 'admin' || user?.role === 'seller';

  const averageRating = useMemo(() => {
    if (!reviews.length) return Number(product?.rating || 0);
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return total / reviews.length;
  }, [product, reviews]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productRes, reviewsRes, questionsRes] = await Promise.all([
        productsAPI.getById(id),
        reviewsAPI.getByProduct(id),
        questionsAPI.getByProduct(id),
      ]);
      setProduct(productRes.data || null);
      setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      setQuestions(Array.isArray(questionsRes.data) ? questionsRes.data : []);
    } catch (error) {
      setError('Failed to load product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductData();
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
      setFeedback('Product added to cart.');
    } catch (error) {
      setFeedback('Failed to add to cart.');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    setFeedback('');
    try {
      const response = await reviewsAPI.create({
        productId: product._id,
        rating: Number(reviewForm.rating),
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
      });
      setReviews((current) => [response.data.review, ...current]);
      setReviewForm(emptyReview);
      setFeedback('Review submitted successfully.');
      const productRes = await productsAPI.getById(id);
      setProduct(productRes.data);
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Review submit nahi ho pa raha.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    const question = questionText.trim();
    if (!question) return;

    setSubmittingQuestion(true);
    setFeedback('');
    try {
      const response = await questionsAPI.create({ productId: product._id, question });
      setQuestions((current) => [response.data.question, ...current]);
      setQuestionText('');
      setFeedback('Question submitted successfully.');
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Question submit nahi ho pa raha.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (questionId) => {
    const answer = answerDrafts[questionId]?.trim();
    if (!answer) return;

    try {
      const response = await questionsAPI.answer(questionId, answer);
      setQuestions((current) =>
        current.map((question) => (question._id === questionId ? response.data.question : question))
      );
      setAnswerDrafts((current) => ({ ...current, [questionId]: '' }));
      setFeedback('Answer saved successfully.');
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Answer save nahi ho pa raha.');
    }
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [`https://via.placeholder.com/700x700?text=${encodeURIComponent(product.name || 'Product')}`];

  return (
    <div className="product-detail-page">
      <div className="product-detail">
        <div className="product-images">
          <img src={images[0]} alt={product.name} className="main-image" />
          <div className="thumbnail-images">
            {images.map((img, idx) => (
              <img key={img} src={img} alt={`View ${idx + 1}`} />
            ))}
          </div>
        </div>

        <div className="product-details">
          <div className="product-header">
            <h1>{product.name}</h1>
            <p className="category">Category: {product.category}</p>
          </div>

          <div className="rating-section">
            <div className="rating">
              <span className="stars">{'★'.repeat(Math.round(averageRating))}</span>
              <span className="review-count">
                {averageRating.toFixed(1)} ({reviews.length || product.numberOfReviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="pricing-section">
            <div className="pricing">
              <span className="current-price">Rs {product.price}</span>
              {product.originalPrice && (
                <span className="original-price">Rs {product.originalPrice}</span>
              )}
              {product.discount > 0 && (
                <span className="discount-badge">{product.discount}% OFF</span>
              )}
            </div>
          </div>

          <div className="stock-info">
            {product.stock > 0 ? (
              <span className="in-stock">In Stock ({product.stock} available)</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          <hr className="divider" />

          <div className="description">
            <h3>About this item</h3>
            <p>{product.description}</p>
          </div>

          <div className="specifications">
            <h3>Specifications</h3>
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
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn">-</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  min="1"
                  max={product.stock}
                />
                <button type="button" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="qty-btn">+</button>
              </div>
            </div>

            <div className="purchase-actions">
              <Button
                variant="contained"
                color="success"
                className="add-to-cart"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <button
                type="button"
                className={`detail-wishlist ${isWishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
              >
                {isWishlisted ? 'Remove Wishlist' : 'Add Wishlist'}
              </button>
            </div>

            {!user && (
              <p className="login-hint">You need to login to purchase, review, or ask questions.</p>
            )}
            {feedback && <p className="product-feedback">{feedback}</p>}
          </div>

          <div className="additional-info">
            <p>Secure checkout</p>
            <p>Easy returns within 7 days</p>
            <p>Free shipping on orders above Rs 500</p>
          </div>
        </div>
      </div>

      <section className="product-community">
        <div className="community-panel">
          <div className="panel-title-row">
            <h2>Ratings & Reviews</h2>
            <span>{reviews.length} reviews</span>
          </div>

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <label>
              Rating
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((current) => ({ ...current, rating: e.target.value }))}
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating} star</option>
                ))}
              </select>
            </label>
            <label>
              Review title
              <input
                value={reviewForm.title}
                onChange={(e) => setReviewForm((current) => ({ ...current, title: e.target.value }))}
                placeholder="Short title"
                required
              />
            </label>
            <label className="span-full">
              Your review
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((current) => ({ ...current, comment: e.target.value }))}
                placeholder="Product ke baare me apna experience likho"
                rows="4"
              />
            </label>
            <button type="submit" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>

          <div className="review-list">
            {reviews.length === 0 && <p className="muted-text">Abhi koi review nahi hai.</p>}
            {reviews.map((review) => (
              <article key={review._id} className="review-item">
                <div>
                  <strong>{review.title}</strong>
                  <span>{'★'.repeat(Number(review.rating || 0))}</span>
                </div>
                <p>{review.comment || 'No comment added.'}</p>
                <small>By {review.user?.name || 'Customer'}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="community-panel">
          <div className="panel-title-row">
            <h2>Product Q&A</h2>
            <span>{questions.length} questions</span>
          </div>

          <form className="question-form" onSubmit={handleQuestionSubmit}>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Product ke related question pucho"
              rows="3"
              required
            />
            <button type="submit" disabled={submittingQuestion}>
              {submittingQuestion ? 'Submitting...' : 'Ask Question'}
            </button>
          </form>

          <div className="question-list">
            {questions.length === 0 && <p className="muted-text">Abhi koi question nahi hai.</p>}
            {questions.map((question) => (
              <article key={question._id} className="question-item">
                <p><strong>Q:</strong> {question.question}</p>
                {question.answer ? (
                  <p className="answer"><strong>A:</strong> {question.answer}</p>
                ) : (
                  <p className="muted-text">Answer pending.</p>
                )}
                <small>Asked by {question.user?.name || 'Customer'}</small>
                {canAnswerQuestions && (
                  <div className="answer-box">
                    <input
                      value={answerDrafts[question._id] || ''}
                      onChange={(e) =>
                        setAnswerDrafts((current) => ({ ...current, [question._id]: e.target.value }))
                      }
                      placeholder="Write answer"
                    />
                    <button type="button" onClick={() => handleAnswerSubmit(question._id)}>Answer</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetail;
