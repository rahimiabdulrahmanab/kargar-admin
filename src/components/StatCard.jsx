// src/components/StatCard.jsx

import styles from "./StatCard.module.css";

export default function StatCard({ label, value, color, icon }) {
  return (
    <div className={styles.card} style={{ "--accent": color }}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.body}>
        <div className={styles.value}>{value ?? "—"}</div>
        <div className={styles.label}>{label}</div>
      </div>
      <div className={styles.bar} />
    </div>
  );
}
