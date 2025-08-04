import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth(); // ✅ DESTRUCTURE PROPERLY

  // Still loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-teal-600 text-lg animate-pulse">
          🔄 Checking authentication...
        </div>
      </div>
    );
  }

 // Not logged in
if (!user) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="mb-4 text-gray-700">You must be logged in to access this page.</p>
        <a
          href="/login"
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}

  // ✅ Authenticated user
  return children;
};

export default PrivateRoute;
