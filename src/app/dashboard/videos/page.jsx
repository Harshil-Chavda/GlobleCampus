"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "../Dashboard.module.css";
import Link from "next/link";
import { motion } from "framer-motion";
import Pagination from "../../components/Pagination";

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, search]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("videos")
        .select("*", { count: "exact" })
        .eq("status", "approved");

      // 1. Search Filter
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      // 2. Category Filter
      if (category !== "All") {
        query = query.eq("category", category);
      }

      // 3. Pagination & Ordering
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setVideos(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (cat) => {
    const map = {
      Programming: "💻",
      "AI/ML": "🧠",
      "Web Development": "🌐",
      "Mobile Dev": "📱",
      Cybersecurity: "🔐",
      Cloud: "☁️",
      "Data Science": "📊",
    };
    return map[cat] || "🎥";
  };

  const categories = [
    "All",
    "Programming",
    "Web Development",
    "AI/ML",
    "Mobile Dev",
    "Cybersecurity",
    "Cloud",
    "Data Science",
    "Other",
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading && page === 1) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.emptyState}>
          <div className={styles.spinner}></div>
          <p className={styles.emptyText}>Loading videos...</p>
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
          <h1 className={styles.pageTitle}>Video Library 🎬</h1>
          <p className={styles.pageSubtitle}>
            Watch educational videos, tutorials, and lectures.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={styles.toolbar}
      >
        <input
          className={styles.searchInput}
          placeholder="🔍 Search videos..."
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
        <Link href="/dashboard/videos/upload">
          <button className={styles.sectionAction}>📹 Upload Video</button>
        </Link>
      </motion.div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
          <div
            className={styles.spinner}
            style={{ margin: "0 auto 1rem auto" }}
          ></div>
          Updating...
        </div>
      ) : videos.length > 0 ? (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={styles.contentGrid}
          >
            {videos.map((item) => (
              <a
                key={item.id}
                href={item.video_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <motion.div variants={itemAnim} className={styles.card}>
                  <div className={styles.cardIcon}>
                    {getCategoryEmoji(item.category)}
                  </div>
                  <div className={styles.cardTitle}>{item.title}</div>
                  <div className={styles.cardDesc}>{item.description}</div>
                  <div className={styles.cardMeta}>
                    <span
                      className={styles.tag}
                      style={{
                        background: "rgba(79, 70, 229, 0.1)",
                        color: "#818cf8",
                        borderRadius: "12px",
                        padding: "0.1rem 0.5rem",
                        fontSize: "0.7rem",
                      }}
                    >
                      {item.category}
                    </span>
                    <span className={styles.metaText}>
                      {item.duration || "10:00"} ·{" "}
                      {Math.floor(Math.random() * 5000 + 500)} views
                    </span>
                  </div>
                </motion.div>
              </a>
            ))}
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
          <div className={styles.emptyIcon}>🎬</div>
          <div className={styles.emptyText}>No videos found</div>
          <div className={styles.emptyDesc}>
            Check back later for new content!
          </div>
        </div>
      )}
    </div>
  );
}
