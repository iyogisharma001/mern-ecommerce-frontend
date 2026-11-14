import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/checkout-steps";
import OrderSummary from "../components/order-summary";
import { useNewOrderMutation } from "../redux/api/orderAPI";
import { resetCart } from "../redux/reducer/cartReducer";
import { RootState } from "../redux/store";
import { formatPrice } from "../utils/features";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const total = useSelector((state: RootState) => state.cartReducer.total);
  const { address, city, pinCode } = useSelector((state: RootState) => state.cartReducer.shippingInfo);

  const [isProcessing, setIsProcessing] = useState(false);
  const [newOrder] = useNewOrderMutation();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);

    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      // 3-D Secure redirects come back to /orders?payment_intent=..., and the
      // Orders page confirms the order from there
      confirmParams: { return_url: `${window.location.origin}/orders` },
      redirect: "if_required",
    });

    if (error) {
      setIsProcessing(false);
      return toast.error(error.message || "Payment failed. Please try another card.");
    }

    if (paymentIntent.status === "succeeded") {
      // The server checks the payment with Stripe and builds the order itself
      const res = await newOrder({ paymentIntentId: paymentIntent.id });
      if ("data" in res) {
        dispatch(resetCart());
        toast.success("Order placed! Thank you for shopping with us.");
        navigate("/orders");
      } else {
        // Money was taken, so keep the cart; the webhook will still create the order
        toast.error("Payment received, but we couldn't confirm the order yet. Check My Orders in a minute.");
      }
    }
    setIsProcessing(false);
  };

  return (
    <form className="card form-card payment-form" onSubmit={submit}>
      <div className="payment-address">
        <span className="text-muted">Delivering to</span>
        <strong>
          {address}, {city} {pinCode}
        </strong>
        <Link to="/shipping" className="link">
          Change
        </Link>
      </div>

      <PaymentElement />

      <div className="test-card">
        <strong>Test mode:</strong> use card <code>4242 4242 4242 4242</code>, any future date and any CVC.
      </div>

      <div className="form-actions">
        <Link to="/shipping" className="btn btn-ghost">
          <FiArrowLeft /> Back
        </Link>
        <button className="btn btn-primary btn-lg" disabled={!stripe || isProcessing}>
          <FiLock /> {isProcessing ? "Processing…" : `Pay ${formatPrice(total)}`}
        </button>
      </div>
    </form>
  );
};

const Checkout = () => {
  useDocumentTitle("Payment");
  const location = useLocation();
  const clientSecret: string | undefined = location.state;

  if (!clientSecret) return <Navigate to="/shipping" />;

  return (
    <div className="page">
      <CheckoutSteps current={2} />
      <h1 className="page-title">Payment</h1>
      <p className="page-subtitle">Your card details are sent directly to Stripe, never to our servers.</p>

      <div className="checkout-layout">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: { colorPrimary: "#4338ca", fontFamily: "Inter, system-ui, sans-serif", borderRadius: "8px" },
            },
          }}
        >
          <CheckoutForm />
        </Elements>
        <OrderSummary />
      </div>
    </div>
  );
};

export default Checkout;
