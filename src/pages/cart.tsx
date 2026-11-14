import axios from "axios";
import { useEffect, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiLock, FiShoppingBag, FiTag, FiXCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CartItemRow from "../components/cart-item";
import CheckoutSteps from "../components/checkout-steps";
import EmptyState from "../components/empty-state";
import OrderSummary from "../components/order-summary";
import { PRICING } from "../config";
import {
  addToCart,
  calculatePrice,
  discountApplied,
  removeCartItem,
  saveCoupon,
} from "../redux/reducer/cartReducer";
import { RootState, server } from "../redux/store";
import { CartItem } from "../types/types";
import { formatPrice } from "../utils/features";
import { useDocumentTitle } from "../utils/useDocumentTitle";

type CouponState = "idle" | "checking" | "valid" | "invalid";

const Cart = () => {
  useDocumentTitle("Your cart");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, subtotal, discount, coupon } = useSelector(
    (state: RootState) => state.cartReducer
  );
  const { user } = useSelector((state: RootState) => state.userReducer);

  const [couponCode, setCouponCode] = useState(coupon || "");
  const [couponState, setCouponState] = useState<CouponState>(coupon ? "valid" : "idle");

  const increment = (item: CartItem) => {
    if (item.quantity >= item.stock) return;
    dispatch(addToCart({ ...item, quantity: item.quantity + 1 }));
  };
  const decrement = (item: CartItem) => {
    if (item.quantity <= 1) return;
    dispatch(addToCart({ ...item, quantity: item.quantity - 1 }));
  };
  const remove = (productId: string) => dispatch(removeCartItem(productId));

  // Check the coupon with the server 0.8s after the user stops typing
  useEffect(() => {
    const code = couponCode.trim();
    if (!code) {
      dispatch(saveCoupon(""));
      dispatch(discountApplied(0));
      dispatch(calculatePrice());
      setCouponState("idle");
      return;
    }

    setCouponState("checking");
    const controller = new AbortController();
    const timer = setTimeout(() => {
      axios
        .get(`${server}/api/v1/payment/discount`, {
          params: { coupon: code },
          signal: controller.signal,
        })
        .then((res) => {
          dispatch(discountApplied(res.data.discount));
          dispatch(saveCoupon(code));
          setCouponState("valid");
          dispatch(calculatePrice());
        })
        .catch((err) => {
          if (axios.isCancel(err)) return;
          // Forget the old code too, so checkout never sends a stale coupon
          dispatch(saveCoupon(""));
          dispatch(discountApplied(0));
          setCouponState("invalid");
          dispatch(calculatePrice());
        });
    }, 800);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [couponCode, dispatch]);

  useEffect(() => {
    dispatch(calculatePrice());
  }, [cartItems, dispatch]);

  if (cartItems.length === 0)
    return (
      <div className="page">
        <EmptyState
          icon={<FiShoppingBag />}
          title="Your cart is empty"
          text="Looks like you haven't added anything yet. Explore the store and find something you love."
          action={{ label: "Start shopping", to: "/search" }}
        />
      </div>
    );

  const toFreeShipping = PRICING.freeShippingAbove - subtotal;
  const progress = Math.min(100, (subtotal / PRICING.freeShippingAbove) * 100);

  return (
    <div className="page">
      <CheckoutSteps current={0} />
      <h1 className="page-title">Your cart</h1>
      <p className="page-subtitle">Review your items before checking out.</p>

      <div className="checkout-layout">
        <section className="card cart-list">
          <div className="shipping-progress">
            <p>
              {toFreeShipping > 0 ? (
                <>
                  Add <strong>{formatPrice(toFreeShipping)}</strong> more for free delivery
                </>
              ) : (
                <>
                  <FiCheckCircle /> Your order qualifies for <strong>free delivery</strong>
                </>
              )}
            </p>
            <div className="progress">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          {cartItems.map((item) => (
            <CartItemRow
              key={item.productId}
              cartItem={item}
              incrementHandler={increment}
              decrementHandler={decrement}
              removeHandler={remove}
            />
          ))}

          <Link to="/search" className="link-arrow continue">
            Continue shopping
          </Link>
        </section>

        <OrderSummary footer={<><FiLock /> Secure checkout. Payments processed by Stripe.</>}>
          <div className="coupon">
            <label htmlFor="coupon">
              <FiTag /> Coupon code
            </label>
            <input
              id="coupon"
              className="input"
              placeholder="Enter code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            {couponState === "checking" && <small className="text-muted">Checking…</small>}
            {couponState === "valid" && (
              <small className="coupon-ok">
                <FiCheckCircle /> {formatPrice(discount)} off applied
              </small>
            )}
            {couponState === "invalid" && (
              <small className="coupon-bad">
                <FiXCircle /> This code is not valid
              </small>
            )}
          </div>

          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={() => navigate(user ? "/shipping" : "/login", { state: { from: "/shipping" } })}
          >
            {user ? "Proceed to checkout" : "Sign in to check out"} <FiArrowRight />
          </button>
        </OrderSummary>
      </div>
    </div>
  );
};

export default Cart;
