// src/components/HelperTable.jsx
// Reusable table for pending / approved / rejected helper lists.
// Accepts a filtered array of helpers and an onReview callback.

import { useState } from "react";
import styles from "./HelperTable.module.css";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{status}</span>;
}

export default function HelperTable({ helpers, onReview }) {
  const [sortKey,  setSortKey]  = useState("createdAt");
  const [sortDir,  setSortDir]  = useState("desc");

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...helpers].sort((a, b) => {
    let av = a[sortKey] ?? "";
    let bv = b[sortKey] ?? "";
    if (sortKey === "createdAt") {
      av = new Date(av); bv = new Date(bv);
    }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  if (helpers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <div className="empty-state__title">No helpers found</div>
        <div className="empty-state__hint">Try adjusting your filters.</div>
      </div>
    );
  }

  const SortIcon = ({ k }) =>
    sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th
              onClick={() => toggleSort("firstNameEn")}
              style={{ cursor: "pointer" }}
            >
              Name <SortIcon k="firstNameEn" />
            </th>
            <th>Phone</th>
            <th
              onClick={() => toggleSort("province")}
              style={{ cursor: "pointer" }}
            >
              Province / City <SortIcon k="province" />
            </th>
            <th
              onClick={() => toggleSort("categoryKey")}
              style={{ cursor: "pointer" }}
            >
              Category <SortIcon k="categoryKey" />
            </th>
            <th>Status</th>
            <th
              onClick={() => toggleSort("createdAt")}
              style={{ cursor: "pointer" }}
            >
              Registered <SortIcon k="createdAt" />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((h, i) => (
            <tr key={h.profileId}>
              <td style={{ color: "var(--text-muted)", width: 36 }}>{i + 1}</td>
              <td>
                <div className={styles.nameEn}>
                  {h.firstNameEn} {h.lastNameEn}
                </div>
                <div className={styles.nameNative}>
                  {h.firstNameNative} {h.lastNameNative}
                </div>
              </td>
              <td style={{ fontFamily: "monospace", fontSize: 12 }}>{h.phone}</td>
              <td>
                <span style={{ fontWeight: 600 }}>{h.province}</span>
                {h.city !== "—" && <span style={{ color: "var(--text-muted)" }}> / {h.city}</span>}
              </td>
              <td>
                <span style={{ fontWeight: 600 }}>{h.categoryKey}</span>
                {h.subcategoryKey && (
                  <span style={{ color: "var(--text-muted)" }}> / {h.subcategoryKey}</span>
                )}
              </td>
              <td><StatusBadge status={h.status} /></td>
              <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                {formatDate(h.createdAt)}
              </td>
              <td>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => onReview(h)}
                >
                  Review →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
