// src/components/ProtectedRoute.jsx
// Redirects unauthenticated users to /login.

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return children;
}
