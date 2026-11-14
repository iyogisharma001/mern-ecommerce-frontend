import { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface Props {
  children?: ReactElement;
  isAuthenticated: boolean;
  adminOnly?: boolean;
  admin?: boolean;
  redirect?: string;
}

const ProtectedRoute = ({ isAuthenticated, children, adminOnly, admin, redirect = "/" }: Props) => {
  const location = useLocation();

  // Remember where the visitor was going, so login can send them back there
  if (!isAuthenticated)
    return <Navigate to={redirect} replace state={{ from: location.pathname + location.search }} />;

  if (adminOnly && !admin) return <Navigate to="/" replace />;

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
