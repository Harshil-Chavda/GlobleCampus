"use client";
import styles from "./Dashboard.module.css";
import { motion } from "framer-motion";
import {
  BookOpen,
  PenTool,
  Video,
  ShoppingBag,
  Upload,
  FileText,
  Film,
  Book,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardHome() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    materials: 0,
    blogs: 0,
    videos: 0,
    marketplace: 0,
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // Fetch profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name, last_name, role")
        .eq("id", userId)
        .single();
      if (prof) setProfile(prof);

      // Fetch counts for this user
      const { count: matCount } = await supabase
        .from("materials")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: blogCount } = await supabase
        .from("blogs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: videoCount } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: marketCount } = await supabase
        .from("marketplace_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      setStats({
        materials: matCount || 0,
        blogs: blogCount || 0,
        videos: videoCount || 0,
        marketplace: marketCount || 0,
      });

      // Fetch recent activity (latest uploads across all types)
      const recentItems = [];

      const { data: recentMats } = await supabase
        .from("materials")
        .select("id, title, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);
      if (recentMats) {
        recentMats.forEach((m) =>
          recentItems.push({
            ...m,
            type: "Material",
            icon: "📚",
            color: "rgba(59,130,246,0.1)",
            textColor: "#60a5fa",
          }),
        );
      }

      const { data: recentBlogs } = await supabase
        .from("blogs")
        .select("id, title, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);
      if (recentBlogs) {
        recentBlogs.forEach((b) =>
          recentItems.push({
            ...b,
            type: "Blog",
            icon: "✍️",
            color: "rgba(34,197,94,0.1)",
            textColor: "#4ade80",
          }),
        );
      }

      const { data: recentVids } = await supabase
        .from("videos")
        .select("id, title, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);
      if (recentVids) {
        recentVids.forEach((v) =>
          recentItems.push({
            ...v,
            type: "Video",
            icon: "🎬",
            color: "rgba(168,85,247,0.1)",
            textColor: "#c084fc",
          }),
        );
      }

      const { data: recentMarket } = await supabase
        .from("marketplace_items")
        .select("id, title, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(2);
      if (recentMarket) {
        recentMarket.forEach((i) =>
          recentItems.push({
            ...i,
            type: "Listing",
            icon: "🛒",
            color: "rgba(244,114,182,0.1)",
            textColor: "#f472b6",
          }),
        );
      }

      // Sort by created_at descending and take top 5
      recentItems.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      setActivity(recentItems.slice(0, 5));
      setLoading(false);
    };

    fetchData();
  }, []);

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const statusLabel = (status) => {
    if (status === "approved" || status === "active") return "✅ Approved";
    if (status === "rejected") return "❌ Rejected";
    return "⏳ Pending";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const greeting = profile
    ? `Welcome Back, ${profile.first_name}! 👋`
    : "Welcome Back! 👋";

  return (
    <motion.div
      className={styles.dashboardContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{greeting}</h1>
          <p className={styles.pageSubtitle}>
            Here&apos;s what&apos;s happening on your GlobleCampus today.
          </p>
        </div>
        <div className={styles.dateBadge}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Quick Stats — Real Data */}
      <div className={styles.statsGrid}>
        <motion.div
          variants={itemVariants}
          className={`${styles.statCard} ${styles.blueGradient}`}
        >
          <div className={styles.statIconWrapper}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading ? "—" : stats.materials}
            </div>
            <div className={styles.statLabel}>Materials Uploaded</div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`${styles.statCard} ${styles.greenGradient}`}
        >
          <div className={styles.statIconWrapper}>
            <PenTool size={24} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading ? "—" : stats.blogs}
            </div>
            <div className={styles.statLabel}>Blog Posts</div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`${styles.statCard} ${styles.purpleGradient}`}
        >
          <div className={styles.statIconWrapper}>
            <Video size={24} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading ? "—" : stats.videos}
            </div>
            <div className={styles.statLabel}>Videos Uploaded</div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`${styles.statCard} ${styles.pinkGradient}`}
        >
          <div className={styles.statIconWrapper}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading ? "—" : stats.marketplace}
            </div>
            <div className={styles.statLabel}>Marketplace Listings</div>
          </div>
        </motion.div>
      </div>

      <div className={styles.mainGrid}>
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🚀 Quick Actions</h2>
          </div>
          <div className={styles.actionsGrid}>
            <Link
              href="/dashboard/materials/upload"
              className={styles.actionCard}
            >
              <div className={`${styles.actionIcon} ${styles.blueIcon}`}>
                <Upload size={28} />
              </div>
              <div className={styles.actionInfo}>
                <h3>Upload Material</h3>
                <p>Share notes & guides</p>
              </div>
            </Link>

            <Link href="/dashboard/blogs/write" className={styles.actionCard}>
              <div className={`${styles.actionIcon} ${styles.greenIcon}`}>
                <FileText size={28} />
              </div>
              <div className={styles.actionInfo}>
                <h3>Write a Blog</h3>
                <p>Share your insights</p>
              </div>
            </Link>

            <Link href="/dashboard/videos/upload" className={styles.actionCard}>
              <div className={`${styles.actionIcon} ${styles.purpleIcon}`}>
                <Film size={28} />
              </div>
              <div className={styles.actionInfo}>
                <h3>Upload Video</h3>
                <p>Share educational content</p>
              </div>
            </Link>

            <Link
              href="/dashboard/marketplace/sell"
              className={styles.actionCard}
            >
              <div className={`${styles.actionIcon} ${styles.pinkIcon}`}>
                <Book size={28} />
              </div>
              <div className={styles.actionInfo}>
                <h3>List an Item</h3>
                <p>Sell books or gadgets</p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity — Real Data */}
        <motion.div variants={itemVariants} className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🕒 Recent Activity</h2>
          </div>
          <div className={styles.activityList}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#64748b",
                }}
              >
                Loading...
              </div>
            ) : activity.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#64748b",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                  📭
                </div>
                <p>
                  No activity yet. Upload your first material to get started!
                </p>
              </div>
            ) : (
              activity.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={styles.activityCard}
                >
                  <div
                    className={styles.activityIcon}
                    style={{ background: item.color, color: item.textColor }}
                  >
                    {item.icon}
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>{item.title}</div>
                    <div className={styles.activityMeta}>
                      {statusLabel(item.status)} • {timeAgo(item.created_at)}
                    </div>
                  </div>
                  <div className={styles.activityTag}>{item.type}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
