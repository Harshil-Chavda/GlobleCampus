"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import styles from "../Dashboard.module.css";
import { motion } from "framer-motion";
import Pagination from "../../components/Pagination";

export default function BlogsPage() {
  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 15;

  /* -------------------------------------------------------------------------- */
  /*                               Data Fetching                                */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    // Check session once
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setUser(session.user);
    };
    checkSession();
  }, []);

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab, category, search]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      let query = supabase.from("blogs").select("*", { count: "exact" });

      // 1. Tab Filter
      if (tab === "mine" && user) {
        query = query.eq("user_id", user.id);
      } else if (tab === "mine" && !user) {
        setBlogs([]);
        setLoading(false);
        return;
      } else {
        // "all" tab -> show approved only
        query = query.eq("status", "approved");
      }

      // 2. Search Filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
      }

      // 3. Category Filter
      if (category !== "All") {
        query = query.eq("category", category);
      }

      // 4. Pagination & Ordering
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setBlogs(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Helpers                                   */
  /* -------------------------------------------------------------------------- */
  const categories = [
    "All",
    "Technology",
    "Exam Tips",
    "Interview Prep",
    "Career",
    "Tutorial",
    "Experience",
  ];

  const getCategoryColor = (cat) => {
    const colors = {
      Technology: { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" },
      "Exam Tips": { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24" },
      "Interview Prep": { bg: "rgba(168, 85, 247, 0.15)", color: "#a855f7" },
      Career: { bg: "rgba(34, 197, 94, 0.15)", color: "#4ade80" },
      Tutorial: { bg: "rgba(244, 114, 182, 0.15)", color: "#f472b6" },
      Experience: { bg: "rgba(251, 146, 60, 0.15)", color: "#fb923c" },
    };
    return colors[cat] || { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8" };
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  /* -------------------------------------------------------------------------- */
  /*                                    UI                                      */
  /* -------------------------------------------------------------------------- */
  if (loading && page === 1) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.emptyState}>
          <div className={styles.spinner}></div>
          <p className={styles.emptyText}>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.pageHeader}
      >
        <div>
          <h1 className={styles.pageTitle}>Blogs & Articles ✍️</h1>
          <p className={styles.pageSubtitle}>
            Read and share knowledge, experiences, and tutorials.
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => {
            setTab("all");
            setPage(1);
          }}
          style={{
            padding: "0.6rem 1.2rem",
            background:
              tab === "all"
                ? "linear-gradient(135deg, #6366f1, #a855f7)"
                : "rgba(30, 41, 59, 0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "white",
            cursor: "pointer",
            fontWeight: "600",
            transition: "0.3s",
          }}
        >
          All Blogs
        </button>
        {user && (
          <button
            onClick={() => {
              setTab("mine");
              setPage(1);
            }}
            style={{
              padding: "0.6rem 1.2rem",
              background:
                tab === "mine"
                  ? "linear-gradient(135deg, #6366f1, #a855f7)"
                  : "rgba(30, 41, 59, 0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.3s",
            }}
          >
            My Blogs
          </button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={styles.toolbar}
      >
        <input
          className={styles.searchInput}
          placeholder="🔍 Search blogs..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className={styles.filterSelect}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All Topics" : c}
            </option>
          ))}
        </select>
        <Link href="/dashboard/blogs/write" className={styles.sectionAction}>
          ✏️ Write a Blog
        </Link>
      </motion.div>

      {/* Blog Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
          <div
            className={styles.spinner}
            style={{ margin: "0 auto 1rem auto" }}
          ></div>
          Updating...
        </div>
      ) : blogs.length > 0 ? (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={styles.contentGrid}
          >
            {blogs.map((item) => {
              const catStyle = getCategoryColor(item.category);
              const statusColors = {
                pending: {
                  bg: "rgba(251,191,36,0.15)",
                  color: "#fbbf24",
                  text: "⏳ Pending",
                },
                approved: {
                  bg: "rgba(34,197,94,0.15)",
                  color: "#4ade80",
                  text: "✅ Approved",
                },
                rejected: {
                  bg: "rgba(239,68,68,0.15)",
                  color: "#f87171",
                  text: "❌ Rejected",
                },
              };
              const statusStyle =
                statusColors[item.status] || statusColors.pending;
              const plainContent = item.content?.replace(/<[^>]*>/g, "") || "";

              return (
                <Link
                  key={item.id}
                  href={`/dashboard/blogs/${item.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <motion.div
                    variants={itemAnim}
                    className={styles.card}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div className={styles.cardIcon}>✍️</div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.4rem",
                          alignItems: "center",
                        }}
                      >
                        {tab === "mine" && (
                          <span
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              padding: "0.15rem 0.55rem",
                              borderRadius: "20px",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              border: "1px solid currentColor",
                            }}
                          >
                            {statusStyle.text}
                          </span>
                        )}
                        {item.category && (
                          <span
                            className={styles.tag}
                            style={{
                              background: catStyle.bg,
                              color: catStyle.color,
                            }}
                          >
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.cardTitle}>{item.title}</div>
                    <div className={styles.cardDesc}>
                      {item.excerpt
                        ? item.excerpt.length > 100
                          ? item.excerpt.slice(0, 100) + "..."
                          : item.excerpt
                        : plainContent.slice(0, 100) + "..."}
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.metaText}>
                        👤 {item.author_name}
                      </span>
                      <span className={styles.metaText}>
                        📅 {formatDate(item.created_at)}
                      </span>
                      <span className={styles.metaText}>
                        👁️ {item.views || 0} views
                      </span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <div className={styles.emptyText}>
            {tab === "mine"
              ? "You haven't written any blogs yet"
              : "No blogs found"}
          </div>
          <div className={styles.emptyDesc}>
            Be the first to share your knowledge!
          </div>
          <Link href="/dashboard/blogs/write" className={styles.sectionAction}>
            ✏️ Write a Blog
          </Link>
        </div>
      )}
    </div>
  );
}

