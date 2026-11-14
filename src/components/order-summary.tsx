import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { formatPrice } from "../utils/features";

// Price breakdown shared by the cart, shipping and payment pages
const OrderSummary = ({ children, footer }: { children?: ReactNode; footer?: ReactNode }) => {
  const { subtotal, tax, shippingCharges, discount, total, cartItems } = useSelector(
    (state: RootState) => state.cartReducer
  );
  const count = cartItems.reduce((n, i) => n + i.quantity, 0);

  return (
    <aside className="summary card" aria-label="Order summary">
      <h2>Order summary</h2>
      <dl>
        <div>
          <dt>
            Subtotal ({count} item{count === 1 ? "" : "s"})
          </dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{shippingCharges ? formatPrice(shippingCharges) : "Free"}</dd>
        </div>
        <div>
          <dt>GST (18%)</dt>
          <dd>{formatPrice(tax)}</dd>
        </div>
        {discount > 0 && (
          <div className="discount">
            <dt>Coupon discount</dt>
            <dd>−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="total">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {children}
      {footer && <p className="summary-note">{footer}</p>}
    </aside>
  );
};

export default OrderSummary;
