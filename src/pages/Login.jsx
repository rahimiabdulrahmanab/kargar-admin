// src/pages/Login.jsx
// Admin login page using Supabase email + password auth.
// Redirects to dashboard if already authenticated.

import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import styles from "./Login.module.css";

export default function Login() {
  const { session, loading } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in → go straight to dashboard
  if (!loading && session) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
        <img 
          src="/src/assets/kargar-logo-dark.svg" 
          width="220" 
          height="80" 
          style={{ marginBottom: 8 }} 
        />
      </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            className={`btn btn--primary btn--lg ${styles.submitBtn}`}
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className={styles.hint}>
          Admin access only. Contact your system administrator if you cannot log in.
        </p>
      </div>
    </div>
  );
}
