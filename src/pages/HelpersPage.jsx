// src/pages/HelpersPage.jsx
import { useMemo, useState } from "react";
import { useHelpers } from "../hooks/useHelpers";
import HelperTable from "../components/HelperTable";
import HelperDetailModal from "../components/HelperDetailModal";
import Filters from "../components/Filters";

const PAGE_CONFIG = {
  pending:  { title: "Pending Review",      subtitle: "Helpers waiting for admin verification before going live", empty: "No pending helpers right now." },
  verified: { title: "Approved Helpers",    subtitle: "Helpers approved and visible in the public app",          empty: "No approved helpers yet." },
  rejected: { title: "Rejected Helpers",    subtitle: "Rejected registrations — hidden from the public app",     empty: "No rejected helpers." },
  review:   { title: "Flagged for Review",  subtitle: "Helpers flagged for closer inspection before deciding",   empty: "No helpers flagged for review." },
};

export default function HelpersPage({ status }) {
  const { helpers, loading, error, refetch, updateLocalStatus, removeLocal } = useHelpers();
  const [selected, setSelected] = useState(null);
  const [filters,  setFilters]  = useState({ search: "", province: "", category: "" });

  const cfg = PAGE_CONFIG[status] || PAGE_CONFIG.pending;

  const filtered = useMemo(() => {
    return helpers.filter((h) => {
      if (h.status !== status) return false;
      const q = filters.search.toLowerCase();
      if (q) {
        const name  = `${h.firstNameEn} ${h.lastNameEn} ${h.firstNameNative} ${h.lastNameNative}`.toLowerCase();
        const phone = h.phone || "";
        if (!name.includes(q) && !phone.includes(q)) return false;
      }
      if (filters.province && h.province !== filters.province) return false;
      if (filters.category && h.categoryKey !== filters.category) return false;
      return true;
    });
  }, [helpers, status, filters]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{cfg.title}</h1>
          <p className="page-subtitle">{cfg.subtitle}</p>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={refetch} disabled={loading}>
          ↺ Refresh
        </button>
      </div>

      <Filters filters={filters} onChange={setFilters} />

      {loading ? (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"32px 0" }}>
          <div className="spinner" />
          <span style={{ color:"var(--text-muted)" }}>Loading...</span>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn btn--ghost" onClick={refetch}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            {status === "pending" ? "🕐" : status === "verified" ? "✅" : "❌"}
          </div>
          <div className="empty-state__title">{cfg.empty}</div>
          {(filters.search || filters.province || filters.category) && (
            <div className="empty-state__hint">Try clearing your filters.</div>
          )}
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
            Showing {filtered.length} of {helpers.filter(h => h.status === status).length} helpers
          </div>
          <HelperTable helpers={filtered} onReview={setSelected} />
        </>
      )}

      {selected && (
        <HelperDetailModal
          helper={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(profileId, newStatus) => {
            updateLocalStatus(profileId, newStatus);
            setSelected(null);
          }}
          onDelete={(profileId) => {
            removeLocal(profileId);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}