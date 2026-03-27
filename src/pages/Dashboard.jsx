// src/pages/Dashboard.jsx
// Summary dashboard with total/pending/approved/rejected counts.

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useHelpers } from "../hooks/useHelpers";
import StatCard from "../components/StatCard";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { helpers, loading, error } = useHelpers();

  const counts = useMemo(() => {
    const c = { total: 0, pending: 0, verified: 0, rejected: 0, review: 0 };
    helpers.forEach((h) => {
      c.total++;
      if (c[h.status] !== undefined) c[h.status]++;
    });
    return c;
  }, [helpers]);

  // Most recently registered (top 5)
  const recent = useMemo(() =>
    [...helpers]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [helpers]
  );

  if (loading) return <Loading />;
  if (error)   return <ErrorState msg={error} />;

  return (
    <div>
              <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img 
              src="/src/assets/kargar-icon.svg" 
              width="44" 
              height="44" 
            />
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Overview of all helper registrations</p>
            </div>
          </div>
        </div>

      {/* Stat cards */}
      <div className={styles.stats}>
        <StatCard label="Total Helpers"    value={counts.total}    color="var(--amber)"    icon="👷" />
        <StatCard label="Pending Review"   value={counts.pending}  color="var(--pending)"  icon="🕐" />
        <StatCard label="Approved"         value={counts.verified} color="var(--verified)" icon="✅" />
        <StatCard label="Rejected"         value={counts.rejected} color="var(--rejected)" icon="❌" />
        {counts.review > 0 && (
          <StatCard label="Flagged for Review" value={counts.review} color="var(--review)" icon="🏳" />
        )}
      </div>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        <Link to="/pending" className={`btn btn--primary btn--lg ${styles.actionBtn}`}>
          Review Pending ({counts.pending}) →
        </Link>
        <Link to="/approved" className={`btn btn--ghost ${styles.actionBtn}`}>
          View Approved ({counts.verified})
        </Link>
      </div>

      {/* Recent registrations */}
      {recent.length > 0 && (
        <div className={styles.recentWrap}>
          <div className={styles.recentHeader}>
            <div className={styles.recentTitle}>Recent Registrations</div>
            <Link to="/pending" style={{ fontSize: 13, color: "var(--amber)", fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Province</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((h) => (
                  <tr key={h.profileId}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{h.firstNameEn} {h.lastNameEn}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {h.firstNameNative} {h.lastNameNative}
                      </div>
                    </td>
                    <td>{h.categoryKey}</td>
                    <td>{h.province}</td>
                    <td><span className={`badge badge--${h.status}`}>{h.status}</span></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {formatDate(h.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"40px 0" }}>
      <div className="spinner" />
      <span style={{ color:"var(--text-muted)" }}>Loading dashboard...</span>
    </div>
  );
}

function ErrorState({ msg }) {
  return (
    <div className="error-state">
      <p>Failed to load data</p>
      <code style={{ fontSize: 12 }}>{msg}</code>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
