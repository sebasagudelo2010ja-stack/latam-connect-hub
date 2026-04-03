import { Navigate } from "react-router-dom";
import { useAuthStore, type UserType } from "@/stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserType;
}

const ROLE_DASHBOARD: Record<string, string> = {
  client: "/accounts/dashboard/client",
  tutor: "/accounts/dashboard/tutor",
};

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { is_authenticated, user_type } = useAuthStore();

  if (!is_authenticated) {
    return <Navigate to="/" replace />;
  }

  if (user_type !== allowedRole && user_type) {
    return <Navigate to={ROLE_DASHBOARD[user_type] ?? "/"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
