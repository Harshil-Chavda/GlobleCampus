"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "../Dashboard.module.css";
import { motion } from "framer-motion";
import Pagination from "../../components/Pagination";

export default function MaterialsPage() {
  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterUniversity, setFilterUniversity] = useState("All");
  const [tab, setTab] = useState("approved"); // 'approved' or 'my-uploads'

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
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab, filterType, filterCourse, filterUniversity, search]); // Re-fetch on any filter change

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let query = supabase.from("materials").select("*", { count: "exact" }); // Get total count for pagination

      // 1. Tab Filter
      if (tab === "approved") {
        query = query.eq("status", "approved");
      } else if (tab === "my-uploads" && user) {
        query = query.eq("user_id", user.id);
      } else if (tab === "my-uploads" && !user) {
        setMaterials([]);
        setLoading(false);
        return;
      }

      // 2. Search Filter (Client-side search was easy, server-side needs 'ilike')
      if (search) {
        // Search across title, subject, or specialization
        // Note: Supabase 'or' syntax: .or('col1.ilike.%val%,col2.ilike.%val%')
        query = query.or(
          `title.ilike.%${search}%,subject.ilike.%${search}%,specialization.ilike.%${search}%`,
        );
      }

      // 3. Dropdown Filters
      if (filterType !== "All") query = query.eq("material_type", filterType);
      if (filterCourse !== "All") query = query.eq("course", filterCourse);
      if (filterUniversity !== "All")
        query = query.eq("university", filterUniversity);

      // 4. Pagination & Ordering
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setMaterials(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Helpers                                   */
  /* -------------------------------------------------------------------------- */
  const uniqueTypes = [
    "All",
    "Notes",
    "Question Paper",
    "Important Questions",
    "Assignment",
    "Lab Manual",
  ];
  const uniqueCourses = [
    "All",
    "B.Tech",
    "BE",
    "Diploma",
    "BCA",
    "B.Com",
    "B.Sc",
    "M.Tech",
    "MCA",
  ];
  const uniqueUniversities = [
    "All",
    "GTU",
    "Monark University",
    "JG University",
    "Silver Oak University",
    "Indus University",
  ];

  const getIcon = (type) => {
    switch (type) {
      case "Notes":
        return "📝";
      case "Important Questions":
        return "⭐";
      case "Question Paper":
        return "📄";
      case "Assignment":
        return "📋";
      case "Lab Manual":
        return "🔬";
      default:
        return "📚";
    }
  };

  const getTagStyle = (type) => {
    switch (type) {
      case "Notes":
        return { background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" };
      case "Important Questions":
        return { background: "rgba(251, 191, 36, 0.15)", color: "#fbbf24" };
      case "Question Paper":
        return { background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" };
      case "Assignment":
        return { background: "rgba(34, 197, 94, 0.15)", color: "#4ade80" };
      case "Lab Manual":
        return { background: "rgba(244, 114, 182, 0.15)", color: "#f472b6" };
      default:
        return {};
    }
  };

  const getStatusBadge = (status) => {
    if (status === "pending")
      return {
        text: "⏳ Pending Review",
        bg: "rgba(251, 191, 36, 0.15)",
        color: "#fbbf24",
      };
    if (status === "rejected")
      return {
        text: "❌ Rejected",
        bg: "rgba(239, 68, 68, 0.15)",
        color: "#f87171",
      };
    return {
      text: "✅ Approved",
      bg: "rgba(34, 197, 94, 0.15)",
      color: "#4ade80",
    };
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
          <p className={styles.emptyText}>Loading materials...</p>
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
          <h1 className={styles.pageTitle}>Study Materials 📚</h1>
          <p className={styles.pageSubtitle}>
            Browse community resources or track your uploads.
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => {
            setTab("approved");
            setPage(1);
          }}
          style={{
            padding: "0.6rem 1.2rem",
            background:
              tab === "approved"
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
          📚 All Materials
        </button>
        {user && (
          <button
            onClick={() => {
              setTab("my-uploads");
              setPage(1);
            }}
            style={{
              padding: "0.6rem 1.2rem",
              background:
                tab === "my-uploads"
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
            📤 My Uploads
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
          placeholder="🔍 Search by title, subject, or specialization..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Link
          href="/dashboard/materials/upload"
          className={styles.sectionAction}
        >
          + Upload Material
        </Link>
      </motion.div>

      {tab === "approved" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.toolbar}
          style={{ marginTop: "-1rem" }}
        >
          <select
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">📂 All Types</option>
            {uniqueTypes.map(
              (t) =>
                t !== "All" && (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
            )}
          </select>

          <select
            className={styles.filterSelect}
            value={filterCourse}
            onChange={(e) => {
              setFilterCourse(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">🎓 All Courses</option>
            {uniqueCourses.map(
              (c) =>
                c !== "All" && (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
            )}
          </select>

          <select
            className={styles.filterSelect}
            value={filterUniversity}
            onChange={(e) => {
              setFilterUniversity(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">🏛️ All Universities</option>
            {uniqueUniversities.map(
              (u) =>
                u !== "All" && (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ),
            )}
          </select>
        </motion.div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
          <div
            className={styles.spinner}
            style={{ margin: "0 auto 1rem auto" }}
          ></div>
          Updating...
        </div>
      ) : materials.length > 0 ? (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={styles.contentGrid}
          >
            {materials.map((item) => {
              const statusBadge = getStatusBadge(item.status);
              return (
                <Link
                  key={item.id}
                  href={`/dashboard/materials/${item.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <motion.div variants={itemAnim} className={styles.card}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div className={styles.cardIcon}>
                        {getIcon(item.material_type)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                        }}
                      >
                        {tab === "my-uploads" && (
                          <span
                            style={{
                              ...statusBadge,
                              background: statusBadge.bg,
                              padding: "0.2rem 0.6rem",
                              borderRadius: "20px",
                              fontSize: "0.7rem",
                              fontWeight: 500,
                              border: "1px solid currentColor",
                            }}
                          >
                            {statusBadge.text}
                          </span>
                        )}
                        <span
                          className={styles.tag}
                          style={getTagStyle(item.material_type)}
                        >
                          {item.material_type}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardTitle}>{item.title}</div>
                    {item.description && (
                      <div
                        className={styles.cardDesc}
                        style={{ marginBottom: "0.75rem" }}
                      >
                        {item.description.length > 80
                          ? item.description.slice(0, 80) + "..."
                          : item.description}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                        fontSize: "0.8rem",
                        color: "#94a3b8",
                      }}
                    >
                      {item.course && (
                        <div>
                          📘{" "}
                          <strong style={{ color: "#cbd5e1" }}>Course:</strong>{" "}
                          {item.course}
                        </div>
                      )}
                      {item.specialization && (
                        <div>
                          🎯{" "}
                          <strong style={{ color: "#cbd5e1" }}>Branch:</strong>{" "}
                          {item.specialization}
                        </div>
                      )}
                      {item.subject && (
                        <div>
                          📖{" "}
                          <strong style={{ color: "#cbd5e1" }}>Subject:</strong>{" "}
                          {item.subject}
                        </div>
                      )}
                      {item.university && (
                        <div>
                          🏛️ <strong style={{ color: "#cbd5e1" }}>Univ:</strong>{" "}
                          {item.university}
                        </div>
                      )}
                      {item.language && (
                        <div>
                          🌐 <strong style={{ color: "#cbd5e1" }}>Lang:</strong>{" "}
                          {item.language}
                        </div>
                      )}
                    </div>

                    <div
                      className={styles.cardMeta}
                      style={{
                        marginTop: "1rem",
                        paddingTop: "0.8rem",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <span className={styles.metaText}>
                        👤 {item.uploaded_by || "Unknown"}
                      </span>
                      <span className={styles.metaText}>
                        📅 {formatDate(item.created_at)}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "1rem",
                        textAlign: "center",
                        background: "linear-gradient(135deg, #6366f1, #a855f7)",
                        padding: "0.6rem",
                        borderRadius: "12px",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        opacity: 0.9,
                      }}
                    >
                      📄 View Material
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
          <div className={styles.emptyIcon}>📂</div>
          <div className={styles.emptyText}>No materials found</div>
          <div className={styles.emptyDesc}>
            Try adjusting filters or upload something new!
          </div>
        </div>
      )}
    </div>
  );
}
