import { useEffect } from "react";
import toast from "react-hot-toast";
import { IconType } from "react-icons";
import { FaGlasses } from "react-icons/fa6";
import {
  FiArrowRight,
  FiLock,
  FiPackage,
  FiShoppingBag,
  FiSmartphone,
  FiTruck,
  FiWatch,
} from "react-icons/fi";
import { GiConverseShoe } from "react-icons/gi";
import { MdLaptopMac } from "react-icons/md";
import { RiGoogleFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import ProductCard, { ProductCardSkeleton } from "../components/product-card";
import { PRICING, STORE } from "../config";
import { useCategoriesQuery, useLatestProductsQuery } from "../redux/api/productAPI";
import { formatPrice, titleCase, transformImage } from "../utils/features";
import { useAddToCart } from "../utils/useAddToCart";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const CATEGORY_ICONS: Record<string, IconType> = {
  smartphones: FiSmartphone,
  laptops: MdLaptopMac,
  watches: FiWatch,
  shoes: GiConverseShoe,
  bags: FiShoppingBag,
  sunglasses: FaGlasses,
};

// Only promises the app actually keeps
const PERKS = [
  {
    icon: FiTruck,
    title: "Free delivery",
    text: `On every order over ${formatPrice(PRICING.freeShippingAbove)}`,
  },
  { icon: FiLock, title: "Secure checkout", text: "Card payments processed by Stripe" },
  { icon: FiPackage, title: "Order tracking", text: "Follow every order from packing to doorstep" },
  { icon: RiGoogleFill, title: "One-tap sign in", text: "Sign in with your Google account" },
];

const Home = () => {
  useDocumentTitle();
  const addToCart = useAddToCart();
  const latest = useLatestProductsQuery("");
  const categories = useCategoriesQuery("");

  useEffect(() => {
    if (latest.isError) toast.error("Could not load products. Please refresh the page.");
  }, [latest.isError]);

  const products = latest.data?.products || [];
  // Showcase 3 new products from different categories, tech first
  const HERO_ORDER = ["smartphones", "laptops", "watches"];
  const rank = (category: string) => {
    const i = HERO_ORDER.indexOf(category);
    return i === -1 ? HERO_ORDER.length : i;
  };
  const heroProducts = products
    .filter((p, i, all) => all.findIndex((q) => q.category === p.category) === i)
    .sort((a, b) => rank(a.category) - rank(b.category))
    .slice(0, 3);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <span className="badge badge-primary">New arrivals every week</span>
          <h1>
            The tech and style you love, <span>delivered.</span>
          </h1>
          <p>
            Shop phones, laptops, watches and accessories from top brands. Free delivery over{" "}
            {formatPrice(PRICING.freeShippingAbove)} and secure checkout on every order.
          </p>
          <div className="hero-actions">
            <Link to="/search" className="btn btn-primary btn-lg">
              Shop now <FiArrowRight />
            </Link>
            <a href="#categories" className="btn btn-outline btn-lg">
              Browse categories
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden={heroProducts.length === 0}>
          {latest.isLoading &&
            [0, 1, 2].map((i) => <div key={i} className={`hero-tile tile-${i} skeleton-block`} />)}
          {heroProducts.map((p, i) => (
            <Link key={p._id} to={`/product/${p._id}`} className={`hero-tile tile-${i}`}>
              <img src={transformImage(p.photos[0]?.url, 500)} alt={p.name} />
              <span>
                <em>{p.name}</em>
                <strong>{formatPrice(p.price)}</strong>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="perks" aria-label="Why shop with us">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="perk">
            <Icon />
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </div>
        ))}
      </section>

      <section id="categories" className="section">
        <div className="section-head">
          <div>
            <h2>Shop by category</h2>
            <p className="text-muted">Find exactly what you are looking for</p>
          </div>
        </div>
        <div className="category-grid">
          {(categories.data?.categories || []).map((category) => {
            const Icon = CATEGORY_ICONS[category] || FiShoppingBag;
            return (
              <Link key={category} to={`/search?category=${category}`} className="category-tile">
                <span className="category-icon">
                  <Icon />
                </span>
                {titleCase(category)}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>New arrivals</h2>
            <p className="text-muted">The latest additions to the {STORE.name} store</p>
          </div>
          <Link to="/search" className="link-arrow">
            View all <FiArrowRight />
          </Link>
        </div>

        <div className="product-grid">
          {latest.isLoading
            ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p._id} product={p} onAddToCart={addToCart} />)}
        </div>
        {!latest.isLoading && products.length === 0 && (
          <p className="text-muted">New products are on their way. Check back soon.</p>
        )}
      </section>

      <section className="promo">
        <div>
          <h2>Spend {formatPrice(PRICING.freeShippingAbove)}, ship for free</h2>
          <p>Delivery is on us for every order above {formatPrice(PRICING.freeShippingAbove)}, anywhere in India.</p>
        </div>
        <Link to="/search" className="btn btn-lg promo-btn">
          Start shopping <FiArrowRight />
        </Link>
      </section>
    </div>
  );
};

export default Home;
