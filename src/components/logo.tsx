import { Link } from "react-router-dom";
import { STORE } from "../config";

export const LogoMark = () => (
  <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
    <rect width="32" height="32" rx="9" fill="var(--primary, #4338ca)" />
    <circle cx="16" cy="16" r="7.5" fill="none" stroke="#fff" strokeWidth="2.4" />
    <path d="M8.5 16h15" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const Logo = ({ onClick }: { onClick?: () => void }) => (
  <Link to="/" className="logo" onClick={onClick} aria-label={`${STORE.name} home`}>
    <LogoMark />
    <span>{STORE.name}</span>
  </Link>
);

export default Logo;
