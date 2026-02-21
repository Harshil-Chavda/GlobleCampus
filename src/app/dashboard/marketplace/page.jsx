"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import styles from "./Marketplace.module.css";
import Link from "next/link";
import { motion } from "framer-motion";
import Pagination from "../../components/Pagination";

export default function MarketplacePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [displayType, setDisplayType] = useState("All"); // All, Sell, Rent

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, displayType, search]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("marketplace_items")
        .select("*", { count: "exact" }) // Get total count for pagination
        .eq("status", "active");

      // 1. Search Filter
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      // 2. Type Filter
      if (displayType !== "All") {
        query = query.eq("type", displayType.toLowerCase());
      }

      // 3. Pagination & Ordering
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setItems(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching marketplace items:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.spinner}></div>
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.pageHeader}
      >
        <h1 className={styles.pageTitle}>Campus Marketplace 🛒</h1>
        <p className={styles.pageSubtitle}>
          Buy, sell, and rent books, tools, and accessories within the campus.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={styles.toolbar}
      >
        <input
          className={styles.searchInput}
          placeholder="🔍 Search items..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`${styles.filterBtn} ${displayType === "All" ? styles.filterBtnActive : ""}`}
            onClick={() => {
              setDisplayType("All");
              setPage(1);
            }}
          >
            All Items
          </button>
          <button
            className={`${styles.filterBtn} ${displayType === "Sell" ? styles.filterBtnActive : ""}`}
            onClick={() => {
              setDisplayType("Sell");
              setPage(1);
            }}
          >
            For Sale
          </button>
          <button
            className={`${styles.filterBtn} ${displayType === "Rent" ? styles.filterBtnActive : ""}`}
            onClick={() => {
              setDisplayType("Rent");
              setPage(1);
            }}
          >
            For Rent
          </button>
        </div>

        <Link href="/dashboard/marketplace/sell">
          <button className={styles.actionBtn}>➕ List Item</button>
        </Link>
      </motion.div>

      {filtered.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={styles.grid}
        >
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              variants={itemAnim}
              className={styles.card}
            >
              <div className={styles.cardHeader} style={{ padding: 0 }}>
                {/* Image or Placeholder */}
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className={styles.cardImage}
                  />
                ) : (
                  <div
                    className={styles.cardImage}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      fontSize: "3rem",
                    }}
                  >
                    📖
                  </div>
                )}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <span
                    className={`${styles.badge} ${item.type === "sell" ? styles.badgeSell : styles.badgeRent}`}
                  >
                    {item.type === "sell" ? "FOR SALE" : "FOR RENT"}
                  </span>
                  <div className={styles.price}>
                    {item.type === "sell"
                      ? `₹${item.price}`
                      : `₹${item.price}/mo`}
                  </div>
                </div>

                <div className={styles.cardTitle}>{item.title}</div>
                <div className={styles.cardDesc}>{item.description}</div>
              </div>

              <div className={styles.cardFooter}>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                <a
                  href={`mailto:${item.contact_info}?subject=Interested in ${item.title}`}
                  className={styles.contactBtn}
                >
                  📩 Contact
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className={styles.emptyState}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛍️</div>
          <div
            style={{
              fontSize: "1.1rem",
              color: "#94a3b8",
              marginBottom: "0.5rem",
            }}
          >
            No items found.
          </div>
          <p>Be the first to list something!</p>
        </div>
      )}
    </div>
  );
}

