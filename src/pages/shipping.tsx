import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/checkout-steps";
import OrderSummary from "../components/order-summary";
import { saveShippingInfo } from "../redux/reducer/cartReducer";
import { RootState, server } from "../redux/store";
import { formatPrice, transformImage } from "../utils/features";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const Shipping = () => {
  useDocumentTitle("Shipping");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, coupon, shippingInfo: saved } = useSelector(
    (state: RootState) => state.cartReducer
  );

  // Start from the address used last time (kept with the cart)
  const [shippingInfo, setShippingInfo] = useState({
    address: saved.address || "",
    city: saved.city || "",
    state: saved.state || "",
    country: saved.country || "india",
    pinCode: saved.pinCode || "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) navigate("/cart");
  }, [cartItems, navigate]);

  const change = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setShippingInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(shippingInfo.pinCode))
      return toast.error("Please enter a valid 6-digit PIN code");

    dispatch(saveShippingInfo(shippingInfo));
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/payment/create`, {
        // Only ids and quantities: the server looks up the real prices
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingInfo,
        coupon,
      });
      navigate("/pay", { state: data.clientSecret });
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || "Could not start the payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <CheckoutSteps current={1} />
      <h1 className="page-title">Delivery address</h1>
      <p className="page-subtitle">Where should we send your order?</p>

      <div className="checkout-layout">
        <form className="card form-card" onSubmit={submit}>
          <div className="field">
            <label htmlFor="address">Street address</label>
            <input id="address" name="address" className="input" required autoComplete="street-address"
              placeholder="House no., street, area" value={shippingInfo.address} onChange={change} />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="city">City</label>
              <input id="city" name="city" className="input" required autoComplete="address-level2"
                value={shippingInfo.city} onChange={change} />
            </div>
            <div className="field">
              <label htmlFor="state">State</label>
              <input id="state" name="state" className="input" required autoComplete="address-level1"
                value={shippingInfo.state} onChange={change} />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="pinCode">PIN code</label>
              <input id="pinCode" name="pinCode" className="input" required inputMode="numeric"
                maxLength={6} autoComplete="postal-code" placeholder="6 digits"
                value={shippingInfo.pinCode}
                onChange={(e) => setShippingInfo((p) => ({ ...p, pinCode: e.target.value.replace(/\D/g, "") }))} />
            </div>
            <div className="field">
              <label htmlFor="country">Country</label>
              <select id="country" name="country" className="input" required value={shippingInfo.country} onChange={change}>
                <option value="india">India</option>
              </select>
              <small>We currently deliver within India only.</small>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/cart" className="btn btn-ghost">
              <FiArrowLeft /> Back to cart
            </Link>
            <button className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? "Preparing payment…" : "Continue to payment"} <FiArrowRight />
            </button>
          </div>
        </form>

        <OrderSummary>
          <ul className="summary-items">
            {cartItems.map((i) => (
              <li key={i.productId}>
                <img src={transformImage(i.photo, 120)} alt="" />
                <span>
                  {i.name}
                  <small>Qty {i.quantity}</small>
                </span>
                <strong>{formatPrice(i.price * i.quantity)}</strong>
              </li>
            ))}
          </ul>
        </OrderSummary>
      </div>
    </div>
  );
};

export default Shipping;
