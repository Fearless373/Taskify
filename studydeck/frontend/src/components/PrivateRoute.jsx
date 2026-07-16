import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { student, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!student) return <Navigate to="/signin" replace />;

  return children;
}
