// src/components/HelperDetailModal.jsx
// Full helper detail view for admin review.
// Fetches signed URLs for private Tazkira documents.

import { useEffect, useState } from "react";
import { setHelperStatus, deleteHelper } from "../lib/actions";
import { getSignedUrl } from "../lib/supabase";
import Lightbox from "./Lightbox";
import styles from "./HelperDetailModal.module.css";

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <div className="info-label">{label}</div>
      <div className="info-value">{value || "—"}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <div className="section-title">{title}</div>
      {children}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

const ACTION_LABELS = {
  verified: "Approve",
  rejected: "Reject",
  review:   "Flag for Review",
  pending:  "Reset to Pending",
};

const ACTION_COLORS = {
  verified: "#27AE60",
  rejected: "#E74C3C",
  review:   "#8E44AD",
  pending:  "#607087",
};

const ACTION_ICONS = {
  verified: "✅",
  rejected: "❌",
  review:   "🏳",
  pending:  "↩",
};

// ─── Styled confirmation dialog ───
function ConfirmDialog({ action, helperName, onConfirm, onCancel, isDelete }) {
  if (!action && !isDelete) return null;
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15,23,42,0.55)",
      zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "#FFFFFF",
        borderRadius: 16,
        padding: "32px 28px",
        maxWidth: 360,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
      }}>
        <div style={{ fontSize: 36, marginBottom: 14 }}>
          {isDelete ? "🗑️" : ACTION_ICONS[action]}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#1A2233", marginBottom: 8 }}>
          {isDelete ? "Delete this worker permanently?" : `${ACTION_LABELS[action]} this helper?`}
        </div>
        <div style={{ fontSize: 14, color: "#607087", marginBottom: isDelete ? 8 : 28 }}>
          {helperName}
        </div>
        {isDelete && (
          <div style={{ fontSize: 12, color: "#E74C3C", marginBottom: 24, fontWeight: 600 }}>
            This will remove all their data, photos and records. This cannot be undone.
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 22px", borderRadius: 8,
              border: "1px solid #E2EAF4",
              background: "#F4F7FB", color: "#607087",
              fontWeight: 600, cursor: "pointer", fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 22px", borderRadius: 8,
              border: "none",
              background: isDelete ? "#E74C3C" : ACTION_COLORS[action],
              color: "#FFFFFF",
              fontWeight: 700, cursor: "pointer", fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            {isDelete ? "Delete Permanently" : ACTION_LABELS[action]}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HelperDetailModal({ helper, onClose, onStatusChange, onDelete }) {
  const [acting,        setActing]        = useState(false);
  const [actionError,   setActionError]   = useState(null);
  const [tazkiraUrls,   setTazkiraUrls]   = useState([]);
  const [lightboxSrc,   setLightboxSrc]   = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch signed URLs for Tazkira files (private bucket)
  useEffect(() => {
    if (!helper?.tazkiraFiles?.length) { setTazkiraUrls([]); return; }
    let cancelled = false;
    Promise.all(helper.tazkiraFiles.map((f) => getSignedUrl(f))).then((urls) => {
      if (!cancelled) setTazkiraUrls(urls.filter(Boolean));
    });
    return () => { cancelled = true; };
  }, [helper]);

  // Status change flow
  const handleAction = (action) => setPendingAction(action);

  const executeAction = async () => {
    const action = pendingAction;
    setPendingAction(null);
    setActing(true);
    setActionError(null);
    try {
      await setHelperStatus(helper.profileId, helper.accountId, action);
      onStatusChange(helper.profileId, action);
      onClose();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActing(false);
    }
  };

  // Delete flow
  const executeDelete = async () => {
    setConfirmDelete(false);
    setActing(true);
    setActionError(null);
    try {
      await deleteHelper(helper.profileId, helper.accountId);
      onDelete?.(helper.profileId);
      onClose();
    } catch (err) {
      setActionError(err.message);
      setActing(false);
    }
  };

  if (!helper) return null;

  const currentStatus = helper.status;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="modal__header">
            <div>
              <div className="modal__title">
                {helper.firstNameEn} {helper.lastNameEn}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                Profile ID: {helper.profileId}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`badge badge--${currentStatus}`}>{currentStatus}</span>
              <button className="modal__close" onClick={onClose} title="Close">✕</button>
            </div>
          </div>

          {/* Body */}
          <div className="modal__body" style={{ maxHeight: "68vh", overflowY: "auto" }}>

            {/* Profile photo + native name */}
            <div className={styles.heroRow}>
              {helper.profilePhoto ? (
                <img
                  src={helper.profilePhoto}
                  alt="Profile"
                  className="photo-profile"
                  style={{ cursor: "zoom-in" }}
                  onClick={() => setLightboxSrc(helper.profilePhoto)}
                />
              ) : (
                <div className={styles.photoPlaceholder}>
                  <span>👤</span>
                </div>
              )}
              <div>
                <div className={styles.nativeName}>
                  {helper.firstNameNative} {helper.lastNameNative}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  Registered: {formatDate(helper.createdAt)}
                </div>
              </div>
            </div>

            {/* Identity */}
            <Section title="Identity">
              <div className="info-grid">
                <InfoRow label="English Name"  value={`${helper.firstNameEn} ${helper.lastNameEn}`} />
                <InfoRow label="Native Name"   value={`${helper.firstNameNative} ${helper.lastNameNative}`} />
                <InfoRow label="Date of Birth" value={helper.dob} />
                <InfoRow label="Phone"         value={helper.phone} />
                <InfoRow label="WhatsApp"      value={helper.whatsapp || "No WhatsApp"} />
                <InfoRow label="Province"      value={helper.province} />
                <InfoRow label="City"          value={helper.city} />
              </div>
            </Section>

            {/* Work */}
            <Section title="Work Details">
              <div className="info-grid">
                <InfoRow label="Category"    value={helper.categoryKey} />
                <InfoRow label="Subcategory" value={helper.subcategoryKey || "—"} />
                {helper.otherProfNative && (
                  <InfoRow label="Profession (Native)"  value={helper.otherProfNative} />
                )}
                {helper.otherProfEn && (
                  <InfoRow label="Profession (English)" value={helper.otherProfEn} />
                )}
                <InfoRow label="Experience" value={helper.experienceKey} />
                <InfoRow label="Work Type"  value={helper.workTypeKey} />
                <InfoRow label="Work Area"  value={helper.workAreaKey} />
                <InfoRow label="Has Tools"  value={helper.hasTools ? "Yes" : "No"} />
              </div>
            </Section>

            {/* Work photos */}
            {helper.workPhotos?.length > 0 && (
              <Section title={`Work Photos (${helper.workPhotos.length})`}>
                <div className="photo-grid">
                  {helper.workPhotos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Work ${i + 1}`}
                      className="photo-thumb"
                      onClick={() => setLightboxSrc(url)}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Tazkira */}
            <Section title="Tazkira / ID Documents">
              {tazkiraUrls.length === 0 ? (
                <div style={{ color: "var(--rejected)", fontSize: 13, fontWeight: 600 }}>
                  ⚠️ No Tazkira uploaded
                </div>
              ) : (
                <div className="photo-grid">
                  {tazkiraUrls.map((url, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <img
                        src={url}
                        alt={i === 0 ? "Tazkira Front" : "Tazkira Back"}
                        className="photo-tazkira"
                        onClick={() => setLightboxSrc(url)}
                      />
                      <div className="photo-label">{i === 0 ? "Front" : "Back"}</div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {actionError && (
              <div style={{
                background: "var(--rejected-bg)", color: "var(--rejected)",
                padding: "10px 14px", borderRadius: 8,
                fontSize: 13, fontWeight: 600, marginTop: 8,
              }}>
                Error: {actionError}
              </div>
            )}

            {/* ── DANGER ZONE ── */}
            <div style={{
              marginTop: 24,
              padding: "16px 18px",
              borderRadius: 10,
              border: "1px solid #FECACA",
              background: "#FEF2F2",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#E74C3C", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                Danger Zone
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: "#607087" }}>
                  Permanently delete this worker and all their data.
                </div>
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={acting}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "9px 18px", borderRadius: 8,
                    border: "1.5px solid #E74C3C",
                    background: "#FFFFFF", color: "#E74C3C",
                    fontWeight: 700, cursor: "pointer", fontSize: 13,
                    fontFamily: "inherit", whiteSpace: "nowrap",
                  }}
                >
                  🗑️ Delete Worker
                </button>
              </div>
            </div>

          </div>

          {/* Footer actions */}
          <div className="modal__footer">
            {currentStatus !== "verified" && (
              <button className="btn btn--approve btn--lg" onClick={() => handleAction("verified")} disabled={acting}>
                ✓ Approve
              </button>
            )}
            {currentStatus !== "review" && (
              <button className="btn btn--review" onClick={() => handleAction("review")} disabled={acting}>
                🏳 Flag for Review
              </button>
            )}
            {currentStatus !== "rejected" && (
              <button className="btn btn--reject" onClick={() => handleAction("rejected")} disabled={acting}>
                ✕ Reject
              </button>
            )}
            {currentStatus !== "pending" && (
              <button className="btn btn--ghost" onClick={() => handleAction("pending")} disabled={acting}>
                Reset to Pending
              </button>
            )}
            <button className="btn btn--ghost" onClick={onClose}>Close</button>
          </div>

        </div>
      </div>

      {/* Status change confirmation */}
      {pendingAction && (
        <ConfirmDialog
          action={pendingAction}
          helperName={`${helper.firstNameEn} ${helper.lastNameEn}`}
          onConfirm={executeAction}
          onCancel={() => setPendingAction(null)}
          isDelete={false}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          action={null}
          helperName={`${helper.firstNameEn} ${helper.lastNameEn}`}
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(false)}
          isDelete={true}
        />
      )}

      {/* Full-screen image lightbox */}
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </>
  );
}