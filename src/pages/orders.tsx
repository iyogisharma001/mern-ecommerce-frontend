import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { FiChevronRight, FiPackage } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import EmptyState from "../components/empty-state";
import { useMyOrdersQuery, useNewOrderMutation } from "../redux/api/orderAPI";
import { resetCart } from "../redux/reducer/cartReducer";
import { RootState } from "../redux/store";
import { CustomError } from "../types/api-types";
import { formatDate, formatPrice, shortId, transformImage } from "../utils/features";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const Orders = () => {
  useDocumentTitle("My orders");
  const { user } = useSelector((state: RootState) => state.userReducer);
  const dispatch = useDispatch();

  const { isLoading, data, isError, error } = useMyOrdersQuery(user?._id ?? "");
  const [newOrder] = useNewOrderMutation();

  // Coming back from a 3-D Secure redirect: Stripe adds ?payment_intent=...
  const [searchParams, setSearchParams] = useSearchParams();
  const confirmedRef = useRef(false);

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent");
    const status = searchParams.get("redirect_status");
    if (!paymentIntentId || confirmedRef.current) return;
    confirmedRef.current = true;

    setSearchParams({}, { replace: true });

    if (status !== "succeeded") {
      toast.error("Payment was not completed");
      return;
    }

    newOrder({ paymentIntentId }).then((res) => {
      if ("data" in res) {
        dispatch(resetCart());
        toast.success("Order placed! Thank you for shopping with us.");
      } else {
        toast.error("Payment received, but we couldn't confirm the order yet. Refresh in a minute.");
      }
    });
  }, [searchParams, setSearchParams, newOrder, dispatch]);

  useEffect(() => {
    if (isError) toast.error((error as CustomError)?.data?.message || "Could not load your orders");
  }, [isError, error]);

  const orders = data?.orders || [];

  return (
    <div className="page narrow">
      <h1 className="page-title">My orders</h1>
      <p className="page-subtitle">Track and review everything you've ordered.</p>

      {isLoading ? (
        <div className="order-list">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton-block" style={{ height: 110, borderRadius: 12 }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<FiPackage />}
          title="No orders yet"
          text="When you place an order, it will show up here so you can track it."
          action={{ label: "Start shopping", to: "/search" }}
        />
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const items = order.orderItems.reduce((n, i) => n + i.quantity, 0);
            return (
              <Link key={order._id} to={`/order/${order._id}`} className="order-card card">
                <div className="order-thumbs">
                  {order.orderItems.slice(0, 3).map((i) => (
                    <img key={i._id} src={transformImage(i.photo, 120)} alt="" />
                  ))}
                </div>
                <div className="order-meta">
                  <strong>Order {shortId(order._id)}</strong>
                  <span className="text-muted">
                    {formatDate(order.createdAt)} · {items} item{items === 1 ? "" : "s"}
                  </span>
                </div>
                <span className={`badge status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                <strong className="order-total">{formatPrice(order.total)}</strong>
                <FiChevronRight className="order-chevron" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
