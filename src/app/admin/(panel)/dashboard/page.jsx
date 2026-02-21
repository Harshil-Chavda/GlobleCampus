"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";
import styles from "../../Admin.module.css";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    newUsers7d: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalMaterials: 0,
    totalBlogs: 0,
    totalVideos: 0,
    marketplaceItems: 0,
    tokensDistributed: 0,
    totalDownloads: 0,
    totalViews: 0,
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const [
        usersRes,
        newUsersRes,
        pendingMatRes,
        approvedMatRes,
        rejectedMatRes,
        totalMatRes,
        totalBlogRes,
        totalVidRes,
        totalMktRes,
        tokensRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgo),
        supabase
          .from("materials")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("materials")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),
        supabase
          .from("materials")
          .select("id", { count: "exact", head: true })
          .eq("status", "rejected"),
        supabase.from("materials").select("id", { count: "exact", head: true }),
        supabase.from("blogs").select("id", { count: "exact", head: true }),
        supabase.from("videos").select("id", { count: "exact", head: true }),
        supabase
          .from("marketplace_items")
          .select("id", { count: "exact", head: true }),
        supabase.from("gc_transactions").select("amount").eq("type", "earned"),
      ]);

      // Sum views from materials
      const { data: viewsData } = await supabase
        .from("materials")
        .select("views");
      const totalViews =
        viewsData?.reduce((sum, m) => sum + (m.views || 0), 0) || 0;

      // Sum downloads
      const { data: dlData } = await supabase
        .from("materials")
        .select("downloads");
      const totalDownloads =
        dlData?.reduce((sum, m) => sum + (m.downloads || 0), 0) || 0;

      const totalTokens =
        tokensRes.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setStats({
        users: usersRes.count || 0,
        newUsers7d: newUsersRes.count || 0,
        pending: pendingMatRes.count || 0,
        approved: approvedMatRes.count || 0,
        rejected: rejectedMatRes.count || 0,
        totalMaterials: totalMatRes.count || 0,
        totalBlogs: totalBlogRes.count || 0,
        totalVideos: totalVidRes.count || 0,
        marketplaceItems: totalMktRes.count || 0,
        tokensDistributed: totalTokens,
        totalDownloads,
        totalViews,
      });

      // Recent activity
      const acts = [];
      const { data: recentMats } = await supabase
        .from("materials")
        .select("title, status, created_at, uploaded_by")
        .order("created_at", { ascending: false })
        .limit(5);
      if (recentMats) {
        recentMats.forEach((m) =>
          acts.push({
            icon:
              m.status === "approved"
                ? "✅"
                : m.status === "rejected"
                  ? "❌"
                  : "📄",
            text: `Material "${m.title}" ${m.status} by ${m.uploaded_by || "unknown"}`,
            time: m.created_at,
          }),
        );
      }

      const { data: recentBlogs } = await supabase
        .from("blogs")
        .select("title, status, created_at, author_name")
        .order("created_at", { ascending: false })
        .limit(3);
      if (recentBlogs) {
        recentBlogs.forEach((b) =>
          acts.push({
            icon: "✍️",
            text: `Blog "${b.title}" ${b.status} by ${b.author_name || "unknown"}`,
            time: b.created_at,
          }),
        );
      }

      const { data: recentUsers } = await supabase
        .from("profiles")
        .select("first_name, last_name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      if (recentUsers) {
        recentUsers.forEach((u) =>
          acts.push({
            icon: "👤",
            text: `${u.first_name || ""} ${u.last_name || ""} joined GlobleCampus`,
            time: u.created_at,
          }),
        );
      }

      acts.sort((a, b) => new Date(b.time) - new Date(a.time));
      setActivity(acts.slice(0, 10));
      setLoading(false);
    };

    fetchAll();
  }, []);

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const statCards = [
    {
      label: "Total Users",
      value: stats.users,
      icon: "👥",
      color: "rgba(59, 130, 246, 0.15)",
    },
    {
      label: "New Users (7d)",
      value: stats.newUsers7d,
      icon: "🆕",
      color: "rgba(34, 197, 94, 0.15)",
    },
    {
      label: "Pending Approvals",
      value: stats.pending,
      icon: "⏳",
      color: "rgba(251, 191, 36, 0.15)",
    },
    {
      label: "Approved Content",
      value: stats.approved,
      icon: "✅",
      color: "rgba(34, 197, 94, 0.15)",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: "❌",
      color: "rgba(239, 68, 68, 0.15)",
    },
    {
      label: "Total Materials",
      value: stats.totalMaterials,
      icon: "📚",
      color: "rgba(168, 85, 247, 0.15)",
    },
    {
      label: "Total Blogs",
      value: stats.totalBlogs,
      icon: "✍️",
      color: "rgba(79, 70, 229, 0.15)",
    },
    {
      label: "Total Videos",
      value: stats.totalVideos,
      icon: "🎬",
      color: "rgba(244, 114, 182, 0.15)",
    },
    {
      label: "Marketplace Items",
      value: stats.marketplaceItems,
      icon: "🛒",
      color: "rgba(245, 158, 11, 0.15)",
    },
    {
      label: "GC-Tokens Distributed",
      value: stats.tokensDistributed,
      icon: "🪙",
      color: "rgba(251, 191, 36, 0.15)",
    },
    {
      label: "Total Downloads",
      value: stats.totalDownloads,
      icon: "⬇️",
      color: "rgba(96, 165, 250, 0.15)",
    },
    {
      label: "Total Views",
      value: stats.totalViews,
      icon: "👁️",
      color: "rgba(148, 163, 184, 0.15)",
    },
  ];

  const quickActions = [
    { href: "/admin/approvals", icon: "✅", label: "Pending Approvals" },
    { href: "/admin/reports", icon: "📈", label: "View Reports" },
    { href: "/admin/users", icon: "👥", label: "Manage Users" },
    { href: "/admin/content", icon: "📁", label: "All Content" },
  ];

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>Loading dashboard...
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <h1 className={styles.pageTitle}>Admin Dashboard 📊</h1>
        <p className={styles.pageSubtitle}>
          Complete overview of the GlobleCampus platform.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={styles.statsGrid}
      >
        {statCards.map((s, i) => (
          <motion.div key={i} variants={item} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: s.color }}>
              {s.icon}
            </div>
            <div>
              <div className={styles.statValue}>
                <AnimatedCounter value={s.value} />
              </div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className={styles.sectionTitle}>⚡ Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          {quickActions.map((qa, i) => (
            <Link key={i} href={qa.href} className={styles.quickActionCard}>
              <span className={styles.quickActionIcon}>{qa.icon}</span>
              <span className={styles.quickActionLabel}>{qa.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={styles.activityFeed}
      >
        <div className={styles.activityHeader}>🕐 Recent Activity</div>
        {activity.length === 0 ? (
          <div
            style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}
          >
            No recent activity
          </div>
        ) : (
          activity.map((a, i) => (
            <motion.div
              key={i}
              className={styles.activityItem}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            >
              <span className={styles.activityIcon}>{a.icon}</span>
              <span className={styles.activityText}>{a.text}</span>
              <span className={styles.activityTime}>{timeAgo(a.time)}</span>
            </motion.div>
          ))
        )}
      </motion.div>
    </>
  );
}

// Animated counter component
function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const duration = 800;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

