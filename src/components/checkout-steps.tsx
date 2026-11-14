import { FaCheck } from "react-icons/fa6";

const STEPS = ["Cart", "Shipping", "Payment"];

// Progress bar shown on the cart, shipping and payment pages
const CheckoutSteps = ({ current }: { current: 0 | 1 | 2 }) => (
  <ol className="checkout-steps" aria-label="Checkout progress">
    {STEPS.map((step, i) => (
      <li
        key={step}
        className={i < current ? "done" : i === current ? "current" : ""}
        aria-current={i === current ? "step" : undefined}
      >
        <span>{i < current ? <FaCheck /> : i + 1}</span>
        {step}
      </li>
    ))}
  </ol>
);

export default CheckoutSteps;
