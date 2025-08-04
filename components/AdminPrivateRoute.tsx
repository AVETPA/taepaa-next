import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AdminPrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-teal-600 text-lg animate-pulse">
          🔄 Checking authentication...
        </div>
      </div>
    );
  }

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (!user.email.includes('admin')) {
    // 🔵 TEMPORARY ADMIN CHECK 🔵
    // Until we set up Firebase custom claims properly
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Authenticated and Admin
  return children;
};

export default AdminPrivateRoute;
