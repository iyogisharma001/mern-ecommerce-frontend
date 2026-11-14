import { onAuthStateChanged } from "firebase/auth";
import { ReactNode, Suspense, lazy, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Footer from "./components/footer";
import Header from "./components/header";
import Loader, { LoaderLayout } from "./components/loader";
import ProtectedRoute from "./components/protected-route";
import { auth } from "./firebase";
import { getUser } from "./redux/api/userAPI";
import { userExist, userNotExist } from "./redux/reducer/userReducer";
import { RootState } from "./redux/store";

const Home = lazy(() => import("./pages/home"));
const Search = lazy(() => import("./pages/search"));
const ProductDetails = lazy(() => import("./pages/product-details"));
const Cart = lazy(() => import("./pages/cart"));
const Shipping = lazy(() => import("./pages/shipping"));
const Login = lazy(() => import("./pages/login"));
const Orders = lazy(() => import("./pages/orders"));
const OrderDetails = lazy(() => import("./pages/order-details"));
const NotFound = lazy(() => import("./pages/not-found"));
const Checkout = lazy(() => import("./pages/checkout"));

// Admin
const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const Products = lazy(() => import("./pages/admin/products"));
const Customers = lazy(() => import("./pages/admin/customers"));
const Transaction = lazy(() => import("./pages/admin/transaction"));
const Discount = lazy(() => import("./pages/admin/discount"));
const Barcharts = lazy(() => import("./pages/admin/charts/barcharts"));
const Piecharts = lazy(() => import("./pages/admin/charts/piecharts"));
const Linecharts = lazy(() => import("./pages/admin/charts/linecharts"));
const Coupon = lazy(() => import("./pages/admin/apps/coupon"));
const NewProduct = lazy(() => import("./pages/admin/management/newproduct"));
const ProductManagement = lazy(() => import("./pages/admin/management/productmanagement"));
const TransactionManagement = lazy(() => import("./pages/admin/management/transactionmanagement"));
const DiscountManagement = lazy(() => import("./pages/admin/management/discountmanagement"));
const NewDiscount = lazy(() => import("./pages/admin/management/newdiscount"));

// Store pages get the header and footer; the admin panel has its own layout
const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { user } = useSelector((state: RootState) => state.userReducer);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isAdmin) return <>{children}</>;
  return (
    <div className="app-shell">
      <Header user={user} />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  );
};

const App = () => {
  const { user, loading } = useSelector((state: RootState) => state.userReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) return dispatch(userNotExist());
      try {
        const data = await getUser(fbUser.uid);
        dispatch(userExist(data.user));
      } catch {
        // Signed in with Google but no account here yet (sign-up not finished)
        dispatch(userNotExist());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoaderLayout />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />

            {/* Signed-in customers */}
            <Route element={<ProtectedRoute isAuthenticated={Boolean(user)} redirect="/login" />}>
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order/:id" element={<OrderDetails />} />
              <Route path="/pay" element={<Checkout />} />
            </Route>

            {/* Admins only */}
            <Route
              element={
                <ProtectedRoute
                  isAuthenticated={Boolean(user)}
                  redirect="/login"
                  adminOnly
                  admin={user?.role === "admin"}
                />
              }
            >
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/product" element={<Products />} />
              <Route path="/admin/customer" element={<Customers />} />
              <Route path="/admin/transaction" element={<Transaction />} />
              <Route path="/admin/discount" element={<Discount />} />
              <Route path="/admin/chart/bar" element={<Barcharts />} />
              <Route path="/admin/chart/pie" element={<Piecharts />} />
              <Route path="/admin/chart/line" element={<Linecharts />} />
              <Route path="/admin/app/coupon" element={<Coupon />} />
              <Route path="/admin/product/new" element={<NewProduct />} />
              <Route path="/admin/product/:id" element={<ProductManagement />} />
              <Route path="/admin/transaction/:id" element={<TransactionManagement />} />
              <Route path="/admin/discount/new" element={<NewDiscount />} />
              <Route path="/admin/discount/:id" element={<DiscountManagement />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
      <Toaster
        position="bottom-center"
        toastOptions={{ style: { borderRadius: "10px", background: "#0f172a", color: "#fff" } }}
      />
    </Router>
  );
};

export default App;
