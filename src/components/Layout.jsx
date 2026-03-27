// src/components/Layout.jsx
// Wraps all protected pages with sidebar + main content area.

import Sidebar from "./Sidebar";
import styles from "./Layout.module.css";

export default function Layout({ children }) {
  return (
    <div className={styles.root}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
