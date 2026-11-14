import { signOut } from "firebase/auth";
import { FormEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiLogOut,
  FiPackage,
  FiSearch,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PRICING } from "../config";
import { auth } from "../firebase";
import { RootState } from "../redux/store";
import { User } from "../types/types";
import { formatPrice } from "../utils/features";
import Logo from "./logo";

const Header = ({ user }: { user: User | null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("search") || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const cartCount = useSelector((state: RootState) =>
    state.cartReducer.cartItems.reduce((sum, i) => sum + i.quantity, 0)
  );

  // Close the account menu on navigation or on a click outside it
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  // Keep the box in sync when the search page changes the query
  useEffect(() => {
    if (location.pathname === "/search") setQuery(params.get("search") || "");
  }, [location.pathname, params]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?search=${encodeURIComponent(q)}` : "/search");
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out");
      navigate("/");
    } catch {
      toast.error("Could not sign out, please try again");
    }
  };

  return (
    <header className="site-header">
      <div className="announcement">
        Free delivery on orders over {formatPrice(PRICING.freeShippingAbove)} · Secure payments by
        Stripe
      </div>

      <div className="header-bar">
        <Logo />

        <nav className="header-links" aria-label="Main">
          <Link to="/search">Shop all</Link>
          <Link to="/search?category=smartphones">Phones</Link>
          <Link to="/search?category=laptops">Laptops</Link>
          <Link to="/search?category=watches">Watches</Link>
        </nav>

        <form className="header-search" onSubmit={submitSearch} role="search">
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            placeholder="Search products"
            aria-label="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div className="header-actions">
          <Link to="/search" className="icon-btn mobile-only" aria-label="Search">
            <FiSearch />
          </Link>

          <Link to="/cart" className="icon-btn cart-btn" aria-label={`Cart, ${cartCount} items`}>
            <FiShoppingBag />
            {cartCount > 0 && <span className="cart-count">{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>

          {user?._id ? (
            <div className="account" ref={menuRef}>
              <button
                className="avatar-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                {user.photo ? (
                  <img src={user.photo} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <FiUser />
                )}
              </button>

              {menuOpen && (
                <div className="account-menu" role="menu">
                  <div className="account-menu-head">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                  {user.role === "admin" && (
                    <Link to="/admin/dashboard" role="menuitem">
                      <MdOutlineDashboard /> Admin dashboard
                    </Link>
                  )}
                  <Link to="/orders" role="menuitem">
                    <FiPackage /> My orders
                  </Link>
                  <button onClick={logout} role="menuitem">
                    <FiLogOut /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-dark btn-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
