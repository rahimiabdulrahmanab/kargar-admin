// src/components/Sidebar.jsx

import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import styles from "./Sidebar.module.css";

const NAV = [
  { to: "/",         icon: "⬛", label: "Dashboard"  },
  { to: "/pending",  icon: "🕐", label: "Pending"    },
  { to: "/approved", icon: "✅", label: "Approved"   },
  { to: "/rejected", icon: "❌", label: "Rejected"   },
  { to: "/review",   icon: "🏳", label: "Under Review" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <img src="/kargar-icon.svg" width="36" height="36" style={{ borderRadius: 8 }} />
        <div>
          <div className={styles.logoName}>Kargar</div>
          <div className={styles.logoSub}>Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.linkActive : ""}`
            }
          >
            <span className={styles.linkIcon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className={styles.bottom}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span>⬅</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
