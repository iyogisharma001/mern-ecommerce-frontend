import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiLock, FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiTruck } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import ImageGallery from "../components/image-gallery";
import Stars from "../components/ratings";
import { PRICING } from "../config";
import {
  useAllReviewsOfProductsQuery,
  useDeleteReviewMutation,
  useNewReviewMutation,
  useProductDetailsQuery,
} from "../redux/api/productAPI";
import { RootState } from "../redux/store";
import { Review } from "../types/types";
import { formatDate, formatPrice, responseToast, titleCase } from "../utils/features";
import { useAddToCart } from "../utils/useAddToCart";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const ProductDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { data, isLoading, isError } = useProductDetailsQuery(id);
  const reviews = useAllReviewsOfProductsQuery(id);
  const [createReview, { isLoading: submitting }] = useNewReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const product = data?.product;
  useDocumentTitle(product?.name);
  useEffect(() => {
    setQuantity(1);
  }, [id]);

  // All hooks above this line (rules of hooks)
  if (isError) return <Navigate to="/404" replace />;
  if (isLoading || !product) return <ProductSkeleton />;

  const { name, price, stock, category, description, ratings, numOfReviews, photos } = product;
  const cartItem = {
    productId: product._id,
    name,
    price,
    stock,
    quantity,
    photo: photos[0]?.url || "",
  };

  const myReview = reviews.data?.reviews.find((r) => r.user?._id === user?._id);

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (rating < 1) return toast.error("Please pick a star rating");
    const res = await createReview({ comment: comment.trim(), rating, userId: user?._id, productId: id });
    responseToast(res, null, "");
    if ("data" in res) {
      setRating(0);
      setComment("");
    }
  };

  const removeReview = async (reviewId: string) => {
    const res = await deleteReview({ reviewId, userId: user?._id });
    responseToast(res, null, "");
  };

  return (
    <div className="page product-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/search?category=${category}`}>{titleCase(category)}</Link>
        <span>/</span>
        <span aria-current="page">{name}</span>
      </nav>

      <div className="product-layout">
        <ImageGallery images={photos.map((p) => p.url)} alt={name} />

        <div className="product-info">
          <span className="badge">{titleCase(category)}</span>
          <h1>{name}</h1>

          <a href="#reviews" className="product-rating">
            <Stars value={ratings} />
            <span>
              {numOfReviews ? `${ratings.toFixed(1)} · ${numOfReviews} review${numOfReviews > 1 ? "s" : ""}` : "No reviews yet"}
            </span>
          </a>

          <div className="product-price">
            {formatPrice(price)}
            <small>+ 18% GST at checkout</small>
          </div>

          <StockStatus stock={stock} />

          {stock > 0 && (
            <div className="product-buy">
              <div className="qty" aria-label="Quantity">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(stock, q + 1))} disabled={quantity >= stock} aria-label="Increase quantity">
                  <FiPlus />
                </button>
              </div>
              <button className="btn btn-outline btn-lg" onClick={() => addToCart(cartItem)}>
                <FiShoppingBag /> Add to cart
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  addToCart(cartItem);
                  navigate("/cart");
                }}
              >
                Buy now
              </button>
            </div>
          )}

          <ul className="product-perks">
            <li>
              <FiTruck />
              {price * quantity >= PRICING.freeShippingAbove
                ? "Free delivery on this order"
                : `Free delivery on orders over ${formatPrice(PRICING.freeShippingAbove)}`}
            </li>
            <li>
              <FiLock /> Secure payment with Stripe
            </li>
          </ul>

          <div className="product-description">
            <h2>About this product</h2>
            <p>{description}</p>
          </div>
        </div>
      </div>

      <section id="reviews" className="reviews">
        <div className="reviews-summary card">
          <h2>Customer reviews</h2>
          <div className="reviews-score">
            <strong className={numOfReviews ? "" : "text-muted"}>{ratings.toFixed(1)}</strong>
            <div>
              <Stars value={ratings} />
              <span className="text-muted">
                {numOfReviews} review{numOfReviews === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {user ? (
            <form className="review-form" onSubmit={submitReview}>
              <h3>{myReview ? "Update your review" : "Write a review"}</h3>
              <Stars value={rating} size="lg" onChange={setRating} />
              <label className="sr-only" htmlFor="review-comment">
                Your review
              </label>
              <textarea
                id="review-comment"
                className="input"
                maxLength={200}
                placeholder="What did you like or dislike?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="btn btn-dark" disabled={submitting}>
                {submitting ? "Posting…" : "Post review"}
              </button>
            </form>
          ) : (
            <p className="text-muted">
              <Link to="/login" className="link">
                Sign in
              </Link>{" "}
              to write a review.
            </p>
          )}
        </div>

        <div className="reviews-list">
          {reviews.isLoading ? (
            <p className="text-muted">Loading reviews…</p>
          ) : reviews.data?.reviews.length ? (
            reviews.data.reviews.map((review) => (
              <ReviewItem
                key={review._id}
                review={review}
                isMine={review.user?._id === user?._id}
                onDelete={removeReview}
              />
            ))
          ) : (
            <p className="text-muted">No reviews yet. Be the first to share your thoughts.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const StockStatus = ({ stock }: { stock: number }) =>
  stock < 1 ? (
    <span className="badge badge-danger">Out of stock</span>
  ) : stock <= 5 ? (
    <span className="badge badge-warning">Only {stock} left, order soon</span>
  ) : (
    <span className="badge badge-success">
      <FiCheck /> In stock
    </span>
  );

type ReviewWithDate = Review & { updatedAt?: string };

const ReviewItem = ({
  review,
  isMine,
  onDelete,
}: {
  review: ReviewWithDate;
  isMine: boolean;
  onDelete: (id: string) => void;
}) => (
  <article className="review-item">
    <div className="review-head">
      {review.user?.photo ? (
        <img src={review.user.photo} alt="" referrerPolicy="no-referrer" />
      ) : (
        <span className="review-avatar">{review.user?.name?.[0] || "?"}</span>
      )}
      <div>
        <strong>{review.user?.name || "Former customer"}</strong>
        <small className="text-muted">{formatDate(review.updatedAt)}</small>
      </div>
      {isMine && (
        <button className="icon-btn" onClick={() => onDelete(review._id)} aria-label="Delete your review">
          <FiTrash2 />
        </button>
      )}
    </div>
    <Stars value={review.rating} size="sm" />
    {review.comment && <p>{review.comment}</p>}
  </article>
);

const ProductSkeleton = () => (
  <div className="page product-page" aria-busy="true">
    <div className="product-layout">
      <div className="skeleton-block" style={{ aspectRatio: "1", borderRadius: 20 }} />
      <div className="product-info">
        <div className="skeleton-block line short" />
        <div className="skeleton-block line" style={{ height: 32 }} />
        <div className="skeleton-block line short" />
        <div className="skeleton-block line" style={{ height: 120 }} />
      </div>
    </div>
  </div>
);

export default ProductDetails;
