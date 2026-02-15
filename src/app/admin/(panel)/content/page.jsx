"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "../../Admin.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function ContentPage() {
  const [tab, setTab] = useState("materials");
  const [materials, setMaterials] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [trashModal, setTrashModal] = useState(null);
  const [trashReason, setTrashReason] = useState("");
  const [processing, setProcessing] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    const [matRes, blogRes, vidRes, mktRes] = await Promise.all([
      supabase.from("materials").select("*").is("trashed_at", null).order("created_at", { ascending: false }),
      supabase.from("blogs").select("*").is("trashed_at", null).order("created_at", { ascending: false }),
      supabase.from("videos").select("*").is("trashed_at", null).order("created_at", { ascending: false }),
      supabase.from("marketplace_items").select("*").is("trashed_at", null).order("created_at", { ascending: false }),
    ]);

    setMaterials(matRes.data || []);
    setBlogs(blogRes.data || []);
    setVideos(vidRes.data || []);
    setMarketplace(mktRes.data || []);
    setLoading(false);
  };

  const handleTrash = async () => {
    if (!trashModal) return;
    setProcessing(trashModal.item.id);

    const table = trashModal.table;
    await supabase.from(table).update({
      trashed_at: new Date().toISOString(),
      trash_reason: trashReason || "No reason provided",
    }).eq("id", trashModal.item.id);

    if (table === "materials") setMaterials(prev => prev.filter(m => m.id !== trashModal.item.id));
    else if (table === "blogs") setBlogs(prev => prev.filter(b => b.id !== trashModal.item.id));
    else if (table === "videos") setVideos(prev => prev.filter(v => v.id !== trashModal.item.id));
    else if (table === "marketplace_items") setMarketplace(prev => prev.filter(m => m.id !== trashModal.item.id));

    showToast(`"${trashModal.item.title}" moved to Recycle Bin`);
    setTrashModal(null);
    setTrashReason("");
    setProcessing(null);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const getFiltered = (items) => {
    let result = filter === "all" ? items : items.filter(i => i.status === filter);
    if (search) {
      result = result.filter(i =>
        (i.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (i.uploaded_by || i.author_name || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  };

  const tabs = [
    { key: "materials", label: "📄 Materials", count: materials.length, color: "#a855f7" },
    { key: "blogs", label: "✍️ Blogs", count: blogs.length, color: "#818cf8" },
    { key: "videos", label: "🎬 Videos", count: videos.length, color: "#f472b6" },
    { key: "marketplace", label: "🛒 Marketplace", count: marketplace.length, color: "#f59e0b" },
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
  const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>Loading content...
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
        <h1 className={styles.pageTitle}>All Content 📁</h1>
        <p className={styles.pageSubtitle}>
          View and manage all content across the platform.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}
      >
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setFilter("all"); }}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "8px",
              border: `1px solid ${tab === t.key ? t.color : "#1e293b"}`,
              background: tab === t.key ? `${t.color}18` : "transparent",
              color: tab === t.key ? t.color : "#94a3b8",
              fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </motion.div>

      {/* Filters + Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}
      >
        {["all", "pending", "approved", "rejected"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600, fontSize: "0.8rem", fontFamily: "inherit",
              textTransform: "capitalize",
              background: filter === f ? "#ef4444" : "rgba(30, 41, 59, 0.6)",
              color: filter === f ? "white" : "#94a3b8",
              transition: "all 0.2s",
            }}
          >
            {f}
          </button>
        ))}
        <input
          placeholder="🔍 Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchBar}
          style={{ maxWidth: 250 }}
        />
      </motion.div>

      {/* MATERIALS TAB */}
      {tab === "materials" && (
        <ContentTable
          items={getFiltered(materials)}
          columns={["Title", "Type", "Subject", "University", "Status", "Tokens", "Uploaded By", "Date", "File", ""]}
          renderRow={(m) => (
            <>
              <td style={{ color: "#f8fafc", fontWeight: 500, maxWidth: 200 }}>{m.title}</td>
              <td>{m.material_type}</td>
              <td>{m.subject}</td>
              <td>{m.university}</td>
              <td><StatusBadge status={m.status} /></td>
              <td style={{ color: "#fbbf24", fontWeight: 700 }}>{m.gc_tokens_awarded > 0 ? `🪙 ${m.gc_tokens_awarded}` : "—"}</td>
              <td>{m.uploaded_by}</td>
              <td style={{ fontSize: "0.8rem" }}>{formatDate(m.created_at)}</td>
              <td>{m.file_url ? <a href={m.file_url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>📄 View</a> : "—"}</td>
              <td>
                <button className={styles.btnTrash} onClick={() => setTrashModal({ item: m, table: "materials" })}>🗑️</button>
              </td>
            </>
          )}
          container={container}
          itemVariant={item}
        />
      )}

      {/* BLOGS TAB */}
      {tab === "blogs" && (
        <ContentTable
          items={getFiltered(blogs)}
          columns={["Title", "Author", "Category", "Status", "Date", ""]}
          renderRow={(b) => (
            <>
              <td style={{ color: "#f8fafc", fontWeight: 500, maxWidth: 250 }}>{b.title}</td>
              <td>{b.author_name}</td>
              <td>{b.category || "—"}</td>
              <td><StatusBadge status={b.status} /></td>
              <td style={{ fontSize: "0.8rem" }}>{formatDate(b.created_at)}</td>
              <td>
                <button className={styles.btnTrash} onClick={() => setTrashModal({ item: b, table: "blogs" })}>🗑️</button>
              </td>
            </>
          )}
          container={container}
          itemVariant={item}
        />
      )}

      {/* VIDEOS TAB */}
      {tab === "videos" && (
        <ContentTable
          items={getFiltered(videos)}
          columns={["Title", "Category", "Status", "URL", "Date", ""]}
          renderRow={(v) => (
            <>
              <td style={{ color: "#f8fafc", fontWeight: 500, maxWidth: 250 }}>{v.title}</td>
              <td>{v.category}</td>
              <td><StatusBadge status={v.status} /></td>
              <td>
                <a href={v.video_url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                  🔗 Link
                </a>
              </td>
              <td style={{ fontSize: "0.8rem" }}>{formatDate(v.created_at)}</td>
              <td>
                <button className={styles.btnTrash} onClick={() => setTrashModal({ item: v, table: "videos" })}>🗑️</button>
              </td>
            </>
          )}
          container={container}
          itemVariant={item}
        />
      )}

      {/* MARKETPLACE TAB */}
      {tab === "marketplace" && (
        <ContentTable
          items={getFiltered(marketplace)}
          columns={["Title", "Price", "Condition", "Status", "Date", ""]}
          renderRow={(m) => (
            <>
              <td style={{ color: "#f8fafc", fontWeight: 500, maxWidth: 250 }}>{m.title}</td>
              <td style={{ color: "#4ade80", fontWeight: 600 }}>₹{m.price || 0}</td>
              <td>{m.item_condition || "—"}</td>
              <td><StatusBadge status={m.status} /></td>
              <td style={{ fontSize: "0.8rem" }}>{formatDate(m.created_at)}</td>
              <td>
                <button className={styles.btnTrash} onClick={() => setTrashModal({ item: m, table: "marketplace_items" })}>🗑️</button>
              </td>
            </>
          )}
          container={container}
          itemVariant={item}
        />
      )}

      {/* Trash Modal */}
      <AnimatePresence>
        {trashModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setTrashModal(null); setTrashReason(""); }}
          >
            <motion.div
              className={styles.modalCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalTitle}>🗑️ Move to Recycle Bin</div>
              <div className={styles.modalText}>
                Are you sure you want to trash <strong style={{ color: "#f8fafc" }}>{trashModal.item.title}</strong>?
                <br />It can be restored later from the Recycle Bin.
              </div>
              <textarea
                placeholder="Reason (optional)..."
                value={trashReason}
                onChange={e => setTrashReason(e.target.value)}
                className={styles.modalInput}
              />
              <div className={styles.modalActions}>
                <button className={styles.modalBtnCancel} onClick={() => { setTrashModal(null); setTrashReason(""); }}>Cancel</button>
                <button className={styles.modalBtnConfirm} onClick={handleTrash} disabled={processing}>
                  {processing ? "Trashing..." : "Move to Bin"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`${styles.toast} ${styles.toastSuccess}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
          >
            ✅ {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Reusable table
function ContentTable({ items, columns, renderRow, container, itemVariant }) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
        <div style={{ fontSize: "1.1rem", color: "#94a3b8" }}>No items found.</div>
      </motion.div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} style={{
                textAlign: "left", padding: "0.75rem 1rem", color: "#64748b",
                fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase",
                letterSpacing: "0.05em", borderBottom: "1px solid #1e293b", whiteSpace: "nowrap",
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={container} initial="hidden" animate="show">
          {items.map(item => (
            <motion.tr
              key={item.id}
              variants={itemVariant}
              layout
              style={{ borderBottom: "1px solid rgba(30, 41, 59, 0.5)" }}
              whileHover={{ backgroundColor: "rgba(30, 41, 59, 0.3)" }}
            >
              {renderRow(item)}
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: styles.badgePending,
    approved: styles.badgeApproved,
    rejected: styles.badgeRejected,
    active: styles.badgeApproved,
    removed: styles.badgeRejected,
  };
  return (
    <span className={`${styles.badge} ${map[status] || styles.badgePending}`}>
      {status}
    </span>
  );
}
