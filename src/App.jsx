import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import HelpersPage from "./pages/HelpersPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/pending"  element={<ProtectedRoute><Layout><HelpersPage status="pending" /></Layout></ProtectedRoute>} />
      <Route path="/approved" element={<ProtectedRoute><Layout><HelpersPage status="verified" /></Layout></ProtectedRoute>} />
      <Route path="/rejected" element={<ProtectedRoute><Layout><HelpersPage status="rejected" /></Layout></ProtectedRoute>} />
      <Route path="/review"   element={<ProtectedRoute><Layout><HelpersPage status="review" /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
