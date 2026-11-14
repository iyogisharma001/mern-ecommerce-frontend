import { FiArrowLeft, FiCheck, FiHome, FiPackage, FiTruck } from "react-icons/fi";
import { Link, Navigate, useParams } from "react-router-dom";
import { useOrderDetailsQuery } from "../redux/api/orderAPI";
import { formatDate, formatPrice, shortId, titleCase, transformImage } from "../utils/features";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const STAGES = [
  { status: "Processing", label: "Order placed", icon: FiPackage },
  { status: "Shipped", label: "Shipped", icon: FiTruck },
  { status: "Delivered", label: "Delivered", icon: FiHome },
];

const OrderDetails = () => {
  const { id = "" } = useParams();
  const { data, isLoading, isError } = useOrderDetailsQuery(id);
  useDocumentTitle(data ? `Order ${shortId(data.order._id)}` : "Order");

  if (isError) return <Navigate to="/orders" />;
  if (isLoading || !data)
    return (
      <div className="page narrow">
        <div className="skeleton-block" style={{ height: 320, borderRadius: 12 }} />
      </div>
    );

  const { orderItems, shippingInfo, subtotal, tax, shippingCharges, discount, total, status, createdAt } =
    data.order;
  const stage = Math.max(0, STAGES.findIndex((s) => s.status === status));

  return (
    <div className="page narrow">
      <Link to="/orders" className="back-link">
        <FiArrowLeft /> All orders
      </Link>

      <div className="order-header">
        <div>
          <h1 className="page-title">Order {shortId(data.order._id)}</h1>
          <p className="text-muted">Placed on {formatDate(createdAt)}</p>
        </div>
        <span className={`badge status-badge ${status.toLowerCase()}`}>{status}</span>
      </div>

      <ol className="tracker card" aria-label="Delivery progress">
        {STAGES.map(({ label, icon: Icon }, i) => (
          <li key={label} className={i <= stage ? "done" : ""}>
            <span>{i < stage ? <FiCheck /> : <Icon />}</span>
            {label}
          </li>
        ))}
      </ol>

      <div className="order-grid">
        <section className="card order-items">
          <h2>Items</h2>
          {orderItems.map((item) => (
            <div key={item._id} className="order-item">
              <img src={transformImage(item.photo, 160)} alt="" />
              <div>
                <Link to={`/product/${item.productId}`} className="cart-item-name">
                  {item.name}
                </Link>
                <span className="text-muted">
                  {formatPrice(item.price)} × {item.quantity}
                </span>
              </div>
              <strong>{formatPrice(item.price * item.quantity)}</strong>
            </div>
          ))}
        </section>

        <div className="order-side">
          <section className="card order-box">
            <h2>Delivery address</h2>
            <p>
              {shippingInfo.address}
              <br />
              {shippingInfo.city}, {shippingInfo.state} {shippingInfo.pinCode}
              <br />
              {titleCase(shippingInfo.country)}
            </p>
          </section>

          <section className="card order-box">
            <h2>Payment</h2>
            <dl className="price-list">
              <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div><dt>Delivery</dt><dd>{shippingCharges ? formatPrice(shippingCharges) : "Free"}</dd></div>
              <div><dt>GST (18%)</dt><dd>{formatPrice(tax)}</dd></div>
              {discount > 0 && (
                <div className="discount"><dt>Coupon discount</dt><dd>−{formatPrice(discount)}</dd></div>
              )}
              <div className="total"><dt>Total paid</dt><dd>{formatPrice(total)}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
