import { ReactElement, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { Column } from "react-table";
import TableHOC from "../components/admin/TableHOC";
import { Skeleton } from "../components/loader";
import { useMyOrdersQuery, useNewOrderMutation } from "../redux/api/orderAPI";
import { resetCart } from "../redux/reducer/cartReducer";
import { RootState } from "../redux/store";
import { CustomError } from "../types/api-types";

type DataType = {
  _id: string;
  amount: number;
  quantity: number;
  discount: number;
  status: ReactElement;
  action: ReactElement;
};

const column: Column<DataType>[] = [
  {
    Header: "ID",
    accessor: "_id",
  },
  {
    Header: "Quantity",
    accessor: "quantity",
  },
  {
    Header: "Discount",
    accessor: "discount",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Orders = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);
  const dispatch = useDispatch();

  const { isLoading, data, isError, error } = useMyOrdersQuery(user?._id ?? "");
  const [newOrder] = useNewOrderMutation();

  const [rows, setRows] = useState<DataType[]>([]);

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
        toast.success(res.data.message);
      } else {
        toast.error(
          "Payment received, but we couldn't confirm the order yet. Refresh in a minute."
        );
      }
    });
  }, [searchParams, setSearchParams, newOrder, dispatch]);

  // Toast once per error, not on every render
  useEffect(() => {
    if (isError)
      toast.error((error as CustomError)?.data?.message || "Something went wrong");
  }, [isError, error]);

  useEffect(() => {
    if (data)
      setRows(
        data.orders.map((i) => ({
          _id: i._id,
          amount: i.total,
          discount: i.discount,
          quantity: i.orderItems.length,
          status: (
            <span
              className={
                i.status === "Processing"
                  ? "red"
                  : i.status === "Shipped"
                  ? "green"
                  : "purple"
              }
            >
              {i.status}
            </span>
          ),
          action: <Link to={`/order/${i._id}`}>View</Link>,
        }))
      );
  }, [data]);

  const Table = TableHOC<DataType>(
    column,
    rows,
    "dashboard-product-box",
    "Orders",
    rows.length > 6
  )();
  return (
    <div className="container">
      <h1>My Orders</h1>
      {isLoading ? <Skeleton length={20} /> : Table}
    </div>
  );
};

export default Orders;
