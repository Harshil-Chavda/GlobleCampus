"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "../Admin.module.css";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/reports", icon: "📈", label: "Reports" },
  { href: "/admin/approvals", icon: "✅", label: "Approvals", hasBadge: true },
  { href: "/admin/users", icon: "👥", label: "Users" },
  { href: "/admin/content", icon: "📁", label: "All Content" },
  { href: "/admin/recycle-bin", icon: "🗑️", label: "Recycle Bin" },
];

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (!profile?.is_admin) {
        router.push("/admin");
        return;
      }

      // Get pending counts for badge
      const [matRes, blogRes, vidRes, mktRes] = await Promise.all([
        supabase
          .from("materials")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("blogs")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("videos")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("marketplace_items")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      setPendingCount(
        (matRes.count || 0) +
          (blogRes.count || 0) +
          (vidRes.count || 0) +
          (mktRes.count || 0),
      );

      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>Loading...
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            Globle<span>Campus</span>
          </div>
          <div className={styles.logoSub}>Admin Panel</div>
        </div>

        <nav className={styles.navSection}>
          <div className={styles.navLabel}>Management</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
              {item.hasBadge && pendingCount > 0 && (
                <span className={styles.navBadge}>
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link
            href="/dashboard"
            className={styles.logoutBtn}
            style={{ marginBottom: "0.5rem" }}
          >
            <span className={styles.navIcon}>🏠</span> User Dashboard
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <span className={styles.navIcon}>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
