import { Navigate, useLocation } from "react-router";
import { getToken, removeToken, validateToken } from "../services/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Validate token structure
  if (!validateToken()) {
    // Token is invalid, clear it and redirect
    removeToken();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}