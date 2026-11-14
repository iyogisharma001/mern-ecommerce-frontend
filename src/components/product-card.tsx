import { FiShoppingBag } from "react-icons/fi";
import { Link } from "react-router-dom";
import { CartItem, Product } from "../types/types";
import { formatPrice, transformImage } from "../utils/features";
import Stars from "./ratings";

type Props = {
  product: Product;
  onAddToCart: (cartItem: CartItem) => void;
};

const ProductCard = ({ product, onAddToCart }: Props) => {
  const { _id, name, price, stock, photos, category, ratings, numOfReviews } = product;
  const photo = photos?.[0]?.url || "";
  const outOfStock = stock < 1;

  return (
    <article className="product-card">
      <Link to={`/product/${_id}`} className="product-card-media">
        <img src={transformImage(photo, 500)} alt={name} loading="lazy" />
        {outOfStock ? (
          <span className="badge badge-danger product-card-flag">Sold out</span>
        ) : stock <= 5 ? (
          <span className="badge badge-warning product-card-flag">Only {stock} left</span>
        ) : null}
      </Link>

      <div className="product-card-body">
        <span className="product-card-category">{category}</span>
        <Link to={`/product/${_id}`} className="product-card-name">
          {name}
        </Link>

        <div className="product-card-rating">
          {numOfReviews > 0 ? (
            <>
              <Stars value={ratings} size="sm" />
              <span>({numOfReviews})</span>
            </>
          ) : (
            <span className="text-muted">No reviews yet</span>
          )}
        </div>

        <div className="product-card-footer">
          <strong>{formatPrice(price)}</strong>
          <button
            className="btn btn-outline btn-sm"
            disabled={outOfStock}
            onClick={() =>
              onAddToCart({ productId: _id, name, price, stock, photo, quantity: 1 })
            }
            aria-label={`Add ${name} to cart`}
          >
            <FiShoppingBag /> Add
          </button>
        </div>
      </div>
    </article>
  );
};

export const ProductCardSkeleton = () => (
  <div className="product-card product-card-skeleton" aria-hidden="true">
    <div className="skeleton-block media" />
    <div className="product-card-body">
      <div className="skeleton-block line short" />
      <div className="skeleton-block line" />
      <div className="skeleton-block line short" />
    </div>
  </div>
);

export default ProductCard;
