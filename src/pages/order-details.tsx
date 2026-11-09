import { Link, Navigate, useParams } from "react-router-dom";
import { Skeleton } from "../components/loader";
import { useOrderDetailsQuery } from "../redux/api/orderAPI";
import { transformImage } from "../utils/features";

// Was an empty stub even though /order/:id is routed here
const OrderDetails = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useOrderDetailsQuery(id!);

  if (isError) return <Navigate to="/orders" />;

  if (isLoading || !data)
    return (
      <div className="container">
        <Skeleton length={12} />
      </div>
    );

  const {
    orderItems,
    shippingInfo: { address, city, state, country, pinCode },
    subtotal,
    tax,
    shippingCharges,
    discount,
    total,
    status,
  } = data.order;

  return (
    <div className="container">
      <h1>Order Details</h1>
      <p>
        <b>Order ID:</b> {data.order._id}
      </p>
      <p>
        <b>Status:</b>{" "}
        <span
          className={
            status === "Delivered"
              ? "purple"
              : status === "Shipped"
              ? "green"
              : "red"
          }
        >
          {status}
        </span>
      </p>

      <h2>Items</h2>
      {orderItems.map((i) => (
        <div
          key={i._id}
          style={{ display: "flex", gap: "1rem", alignItems: "center", margin: "1rem 0" }}
        >
          <img
            src={transformImage(i.photo)}
            alt={i.name}
            style={{ width: 64, height: 64, objectFit: "cover" }}
          />
          <Link to={`/product/${i.productId}`}>{i.name}</Link>
          <span>
            ₹{i.price} × {i.quantity} = ₹{i.price * i.quantity}
          </span>
        </div>
      ))}

      <h2>Shipping</h2>
      <p>{`${address}, ${city}, ${state}, ${country} ${pinCode}`}</p>

      <h2>Amount</h2>
      <p>Subtotal: ₹{subtotal}</p>
      <p>Shipping Charges: ₹{shippingCharges}</p>
      <p>Tax: ₹{tax}</p>
      <p>Discount: - ₹{discount}</p>
      <p>
        <b>Total: ₹{total}</b>
      </p>
    </div>
  );
};

export default OrderDetails;
