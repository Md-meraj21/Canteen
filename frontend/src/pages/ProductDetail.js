import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Chip, CircularProgress, Divider, IconButton, MenuItem, Rating, TextField } from '@mui/material';
import { FaHeart, FaMinus, FaPlus, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { cartAPI, productsAPI, questionsAPI, reviewsAPI } from '../services/api';
import { useAuthStore, useCartStore, useWishlistStore } from '../context/store';
import { money, page, panel } from '../utils/ui';

const emptyReview = { rating: 5, title: '', comment: '' };

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
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const canAnswerQuestions = user?.role === 'admin' || user?.role === 'seller';

  const averageRating = useMemo(() => {
    if (!reviews.length) return Number(product?.rating || 0);
    return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
  }, [product, reviews]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError('');
      const [productRes, reviewsRes, questionsRes] = await Promise.all([
        productsAPI.getById(id),
        reviewsAPI.getByProduct(id),
        questionsAPI.getByProduct(id),
      ]);
      setProduct(productRes.data || null);
      setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      setQuestions(Array.isArray(questionsRes.data) ? questionsRes.data : []);
    } catch {
      setError('Failed to load product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProductData();
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
    } catch {
      setFeedback('Failed to add to cart.');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!user) return navigate('/login');

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
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Review could not be submitted.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    if (!user) return navigate('/login');
    const question = questionText.trim();
    if (!question) return;

    setSubmittingQuestion(true);
    setFeedback('');
    try {
      const response = await questionsAPI.create({ productId: product._id, question });
      setQuestions((current) => [response.data.question, ...current]);
      setQuestionText('');
      setFeedback('Question submitted successfully.');
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Question could not be submitted.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (questionId) => {
    const answer = answerDrafts[questionId]?.trim();
    if (!answer) return;
    try {
      const response = await questionsAPI.answer(questionId, answer);
      setQuestions((current) => current.map((question) => (question._id === questionId ? response.data.question : question)));
      setAnswerDrafts((current) => ({ ...current, [questionId]: '' }));
      setFeedback('Answer saved successfully.');
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Answer could not be saved.');
    }
  };

  if (loading) {
    return (
      <div className={`${page} grid min-h-[45vh] place-items-center`}>
        <CircularProgress color="success" />
      </div>
    );
  }
  if (error) return <div className={page}><Alert severity="error">{error}</Alert></div>;
  if (!product) return <div className={page}><Alert severity="error">Product not found</Alert></div>;

  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : [`https://via.placeholder.com/700x700?text=${encodeURIComponent(product.name || 'Product')}`];

  return (
    <div className={page}>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
        <div className={`${panel} overflow-hidden`}>
          <img src={images[0]} alt={product.name} className="aspect-square w-full bg-slate-100 object-cover" />
          <div className="flex gap-2 overflow-x-auto p-3">
            {images.map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`View ${index + 1}`} className="h-20 w-20 rounded-md border border-slate-200 object-cover" />
            ))}
          </div>
        </div>

        <div className={`${panel} p-5`}>
          <Chip label={product.category || 'Product'} color="success" variant="outlined" />
          <h1 className="mt-4 text-3xl font-black text-slate-950">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <Rating value={averageRating} precision={0.5} readOnly />
            <span className="text-sm text-slate-500">{averageRating.toFixed(1)} ({reviews.length || product.numberOfReviews || 0} reviews)</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-black text-slate-950">{money(product.price)}</span>
            {product.originalPrice && <span className="text-lg text-slate-400 line-through">{money(product.originalPrice)}</span>}
            {product.discount > 0 && <Chip label={`${product.discount}% OFF`} color="success" />}
          </div>

          <p className={product.stock > 0 ? 'mt-3 font-bold text-emerald-700' : 'mt-3 font-bold text-red-600'}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </p>

          <Divider className="!my-5" />

          <h2 className="text-lg font-bold text-slate-950">About this item</h2>
          <p className="mt-2 text-slate-600">{product.description}</p>

          <div className="mt-5 grid gap-2 rounded-lg bg-slate-50 p-4 text-sm">
            <h3 className="font-bold text-slate-950">Specifications</h3>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              Object.entries(product.specifications)
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <span className="capitalize text-slate-500">{key}</span>
                    <strong>{value}</strong>
                  </div>
                ))
            ) : (
              <p className="text-slate-500">No specifications available.</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-slate-200">
              <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))}><FaMinus className="text-xs" /></IconButton>
              <span className="min-w-10 text-center font-bold">{quantity}</span>
              <IconButton onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><FaPlus className="text-xs" /></IconButton>
            </div>
            <Button variant="contained" color="success" startIcon={<FaShoppingCart />} onClick={handleAddToCart} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              variant={isWishlisted ? 'contained' : 'outlined'}
              color="error"
              startIcon={isWishlisted ? <FaHeart /> : <FaRegHeart />}
              onClick={() => toggleWishlist(product)}
            >
              {isWishlisted ? 'Remove Wishlist' : 'Add Wishlist'}
            </Button>
          </div>

          {!user && <Alert severity="info" className="!mt-5">Login to purchase, review, or ask questions.</Alert>}
          {feedback && <Alert severity="success" className="!mt-5">{feedback}</Alert>}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={`${panel} p-5`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">Ratings & Reviews</h2>
            <Chip label={`${reviews.length} reviews`} />
          </div>
          <form onSubmit={handleReviewSubmit} className="mt-5 grid gap-4">
            <TextField select label="Rating" value={reviewForm.rating} onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}>
              {[5, 4, 3, 2, 1].map((rating) => <MenuItem key={rating} value={rating}>{rating} star</MenuItem>)}
            </TextField>
            <TextField label="Review title" value={reviewForm.title} onChange={(event) => setReviewForm((current) => ({ ...current, title: event.target.value }))} required />
            <TextField label="Your review" value={reviewForm.comment} onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))} multiline rows={4} />
            <Button type="submit" variant="contained" color="success" disabled={submittingReview}>{submittingReview ? 'Submitting...' : 'Submit Review'}</Button>
          </form>
          <div className="mt-6 grid gap-3">
            {reviews.length === 0 && <p className="text-sm text-slate-500">No reviews yet.</p>}
            {reviews.map((review) => (
              <article key={review._id} className="rounded-md bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong>{review.title}</strong>
                  <Rating value={Number(review.rating || 0)} readOnly size="small" />
                </div>
                <p className="mt-2 text-sm text-slate-600">{review.comment || 'No comment added.'}</p>
                <small className="text-slate-500">By {review.user?.name || 'Customer'}</small>
              </article>
            ))}
          </div>
        </div>

        <div className={`${panel} p-5`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">Product Q&A</h2>
            <Chip label={`${questions.length} questions`} />
          </div>
          <form onSubmit={handleQuestionSubmit} className="mt-5 grid gap-4">
            <TextField label="Ask a question" value={questionText} onChange={(event) => setQuestionText(event.target.value)} multiline rows={3} required />
            <Button type="submit" variant="contained" color="success" disabled={submittingQuestion}>{submittingQuestion ? 'Submitting...' : 'Ask Question'}</Button>
          </form>
          <div className="mt-6 grid gap-3">
            {questions.length === 0 && <p className="text-sm text-slate-500">No questions yet.</p>}
            {questions.map((question) => (
              <article key={question._id} className="rounded-md bg-slate-50 p-4">
                <p><strong>Q:</strong> {question.question}</p>
                <p className="mt-2 text-sm text-slate-600"><strong>A:</strong> {question.answer || 'Answer pending.'}</p>
                <small className="text-slate-500">Asked by {question.user?.name || 'Customer'}</small>
                {canAnswerQuestions && (
                  <div className="mt-3 flex gap-2">
                    <TextField size="small" value={answerDrafts[question._id] || ''} onChange={(event) => setAnswerDrafts((current) => ({ ...current, [question._id]: event.target.value }))} placeholder="Write answer" fullWidth />
                    <Button variant="outlined" color="success" onClick={() => handleAnswerSubmit(question._id)}>Answer</Button>
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
