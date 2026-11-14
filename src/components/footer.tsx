import { FaGithub } from "react-icons/fa6";
import { FiLock, FiTruck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { PRICING, STORE } from "../config";
import { formatPrice } from "../utils/features";
import Logo from "./logo";

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-grid">
      <div className="footer-brand">
        <Logo />
        <p>{STORE.tagline}</p>
        <ul className="footer-perks">
          <li>
            <FiTruck /> Free delivery over {formatPrice(PRICING.freeShippingAbove)}
          </li>
          <li>
            <FiLock /> Payments secured by Stripe
          </li>
        </ul>
      </div>

      <div>
        <h4>Shop</h4>
        <ul>
          <li><Link to="/search?category=smartphones">Smartphones</Link></li>
          <li><Link to="/search?category=laptops">Laptops</Link></li>
          <li><Link to="/search?category=watches">Watches</Link></li>
          <li><Link to="/search?category=shoes">Shoes</Link></li>
          <li><Link to="/search?category=bags">Bags</Link></li>
          <li><Link to="/search?category=sunglasses">Sunglasses</Link></li>
        </ul>
      </div>

      <div>
        <h4>Account</h4>
        <ul>
          <li><Link to="/login">Sign in</Link></li>
          <li><Link to="/orders">My orders</Link></li>
          <li><Link to="/cart">Cart</Link></li>
        </ul>
      </div>

      <div>
        <h4>Help</h4>
        <ul>
          <li><a href={`mailto:${STORE.supportEmail}`}>Contact support</a></li>
          <li><Link to="/search">Browse all products</Link></li>
        </ul>
      </div>
    </div>

    <div className="footer-bottom">
      <span>
        © {new Date().getFullYear()} {STORE.name}. A portfolio project, built with the MERN stack.
      </span>
      <span className="footer-code">
        <a href={STORE.repos.frontend} target="_blank" rel="noreferrer">
          <FaGithub /> Frontend
        </a>
        <a href={STORE.repos.backend} target="_blank" rel="noreferrer">
          <FaGithub /> Backend
        </a>
      </span>
    </div>
  </footer>
);

export default Footer;
