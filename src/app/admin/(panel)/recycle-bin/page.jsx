"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "../../Admin.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function RecycleBinPage() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchTrashed();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTrashed = async () => {
    const [uRes, mRes, bRes, vRes, mkRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .not("trashed_at", "is", null)
        .order("trashed_at", { ascending: false }),
      supabase
        .from("materials")
        .select("*")
        .not("trashed_at", "is", null)
        .order("trashed_at", { ascending: false }),
      supabase
        .from("blogs")
        .select("*")
        .not("trashed_at", "is", null)
        .order("trashed_at", { ascending: false }),
      supabase
        .from("videos")
        .select("*")
        .not("trashed_at", "is", null)
        .order("trashed_at", { ascending: false }),
      supabase
        .from("marketplace_items")
        .select("*")
        .not("trashed_at", "is", null)
        .order("trashed_at", { ascending: false }),
    ]);

    setUsers(uRes.data || []);
    setMaterials(mRes.data || []);
    setBlogs(bRes.data || []);
    setVideos(vRes.data || []);
    setMarketplace(mkRes.data || []);
    setLoading(false);
  };

  const restore = async (table, id, setter) => {
    setProcessing(id);
    await supabase
      .from(table)
      .update({ trashed_at: null, trash_reason: null })
      .eq("id", id);
    setter((prev) => prev.filter((i) => i.id !== id));
    showToast("Item restored successfully!");
    setProcessing(null);
  };

  const permanentDelete = async () => {
    if (!deleteModal) return;
    setProcessing(deleteModal.id);
    await supabase.from(deleteModal.table).delete().eq("id", deleteModal.id);

    if (deleteModal.table === "profiles")
      setUsers((p) => p.filter((i) => i.id !== deleteModal.id));
    else if (deleteModal.table === "materials")
      setMaterials((p) => p.filter((i) => i.id !== deleteModal.id));
    else if (deleteModal.table === "blogs")
      setBlogs((p) => p.filter((i) => i.id !== deleteModal.id));
    else if (deleteModal.table === "videos")
      setVideos((p) => p.filter((i) => i.id !== deleteModal.id));
    else if (deleteModal.table === "marketplace_items")
      setMarketplace((p) => p.filter((i) => i.id !== deleteModal.id));

    showToast("Permanently deleted!", "error");
    setDeleteModal(null);
    setProcessing(null);
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const tabs = [
    { key: "users", label: "👥 Users", count: users.length },
    { key: "materials", label: "📄 Materials", count: materials.length },
    { key: "blogs", label: "✍️ Blogs", count: blogs.length },
    { key: "videos", label: "🎬 Videos", count: videos.length },
    { key: "marketplace", label: "🛒 Marketplace", count: marketplace.length },
  ];

  const totalTrashed =
    users.length +
    materials.length +
    blogs.length +
    videos.length +
    marketplace.length;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>Loading recycle bin...
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
        <h1 className={styles.pageTitle}>Recycle Bin 🗑️</h1>
        <p className={styles.pageSubtitle}>
          {totalTrashed} trashed item(s). Restore or permanently delete.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`${styles.timeRangeBtn} ${tab === t.key ? styles.timeRangeBtnActive : ""}`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </motion.div>

      {/* USERS */}
      {tab === "users" &&
        renderSection(
          users,
          (u) => (
            <>
              <td style={{ color: "#f8fafc", fontWeight: 500 }}>
                {u.first_name} {u.last_name}
              </td>
              <td>{u.email}</td>
              <td style={{ color: "#64748b", fontSize: "0.82rem" }}>
                {u.trash_reason || "—"}
              </td>
              <td style={{ fontSize: "0.8rem" }}>{formatDate(u.trashed_at)}</td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className={styles.btnRestore}
                  onClick={() => restore("profiles", u.id, setUsers)}
                  disabled={processing === u.id}
                >
                  {processing === u.id ? "..." : "♻️ Restore"}
                </button>
                <button
                  className={styles.btnDelete}
                  onClick={() =>
                    setDeleteModal({
                      id: u.id,
                      table: "profiles",
                      name: `${u.first_name} ${u.last_name}`,
                    })
                  }
                >
                  💀 Delete
                </button>
              </td>
            </>
          ),
          ["Name", "Email", "Reason", "Trashed", "Actions"],
        )}

      {/* MATERIALS */}
      {tab === "materials" &&
        renderSection(
          materials,
          (m) => (
            <>
              <td style={{ color: "#f8fafc", fontWeight: 500 }}>{m.title}</td>
              <td>{m.material_type}</td>
              <td style={{ color: "#64748b", fontSize: "0.82rem" }}>
                {m.trash_reason || "—"}
              </td>
              <td style={{ fontSize: "0.8rem" }}>{formatDate(m.trashed_at)}</td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className={styles.btnRestore}
                  onClick={() => restore("materials", m.id, setMaterials)}
                  disabled={processing === m.id}
                >
                  {processing === m.id ? "..." : "♻️ Restore"}
                </button>
                <button
                  className={styles.btnDelete}
                  onClick={() =>
                    setDeleteModal({
                      id: m.id,
                      table: "materials",
                      name: m.title,
                    })
                  }
                >
                  💀 Delete
                </button>
              </td>
            </>
          ),
          ["Title", "Type", "Reason", "Trashed", "Actions"],
        )}

      {/* BLOGS */}
      {tab === "blogs" &&
        renderSection(
          blogs,
          (b) => (
            <>
              <td style={{ color: "#f8fafc", fontWeight: 500 }}>{b.title}</td>
              <td>{b.author_name}</td>
              <td style={{ color: "#64748b", fontSize: "0.82rem" }}>
                {b.trash_reason || "—"}
              </td>
              <td style={{ fontSize: "0.8rem" }}>{formatDate(b.trashed_at)}</td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className={styles.btnRestore}
                  onClick={() => restore("blogs", b.id, setBlogs)}
                  disabled={processing === b.id}
                >
                  {processing === b.id ? "..." : "♻️ Restore"}
                </button>
                <button
                  className={styles.btnDelete}
                  onClick={() =>
                    setDeleteModal({ id: b.id, table: "blogs", name: b.title })
                  }
                >
                  💀 Delete
                </button>
              </td>
            </>
          ),
          ["Title", "Author", "Reason", "Trashed", "Actions"],
        )}

      {/* VIDEOS */}
      {tab === "videos" &&
        renderSection(
          videos,
          (v) => (
            <>
              <td style={{ color: "#f8fafc", fontWeight: 500 }}>{v.title}</td>
              <td>{v.category}</td>
              <td style={{ color: "#64748b", fontSize: "0.82rem" }}>
                {v.trash_reason || "—"}
              </td>
              <td style={{ fontSize: "0.8rem" }}>{formatDate(v.trashed_at)}</td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className={styles.btnRestore}
                  onClick={() => restore("videos", v.id, setVideos)}
                  disabled={processing === v.id}
                >
                  {processing === v.id ? "..." : "♻️ Restore"}
                </button>
                <button
                  className={styles.btnDelete}
                  onClick={() =>
                    setDeleteModal({ id: v.id, table: "videos", name: v.title })
                  }
                >
                  💀 Delete
                </button>
              </td>
            </>
          ),
          ["Title", "Category", "Reason", "Trashed", "Actions"],
        )}

      {/* MARKETPLACE */}
      {tab === "marketplace" &&
        renderSection(
          marketplace,
          (m) => (
            <>
              <td style={{ color: "#f8fafc", fontWeight: 500 }}>{m.title}</td>
              <td style={{ color: "#4ade80" }}>₹{m.price || 0}</td>
              <td style={{ color: "#64748b", fontSize: "0.82rem" }}>
                {m.trash_reason || "—"}
              </td>
              <td style={{ fontSize: "0.8rem" }}>{formatDate(m.trashed_at)}</td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className={styles.btnRestore}
                  onClick={() =>
                    restore("marketplace_items", m.id, setMarketplace)
                  }
                  disabled={processing === m.id}
                >
                  {processing === m.id ? "..." : "♻️ Restore"}
                </button>
                <button
                  className={styles.btnDelete}
                  onClick={() =>
                    setDeleteModal({
                      id: m.id,
                      table: "marketplace_items",
                      name: m.title,
                    })
                  }
                >
                  💀 Delete
                </button>
              </td>
            </>
          ),
          ["Title", "Price", "Reason", "Trashed", "Actions"],
        )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              className={styles.modalCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalTitle}>⚠️ Permanent Delete</div>
              <div className={styles.modalText}>
                Are you sure you want to{" "}
                <strong style={{ color: "#f87171" }}>permanently delete</strong>{" "}
                <strong style={{ color: "#f8fafc" }}>{deleteModal.name}</strong>
                ?
                <br />
                <br />
                <span style={{ color: "#f87171" }}>
                  This action cannot be undone!
                </span>
              </div>
              <div className={styles.modalActions}>
                <button
                  className={styles.modalBtnCancel}
                  onClick={() => setDeleteModal(null)}
                >
                  Cancel
                </button>
                <button
                  className={styles.modalBtnConfirm}
                  onClick={permanentDelete}
                  disabled={processing}
                  style={{ background: "#991b1b" }}
                >
                  {processing ? "Deleting..." : "Delete Forever"}
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
            className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast.type === "error" ? "🗑️" : "✅"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  function renderSection(items, renderRow, columns) {
    if (items.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
          <div style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
            Recycle bin is empty for this category.
          </div>
        </motion.div>
      );
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={container} initial="hidden" animate="show">
            {items.map((i) => (
              <motion.tr key={i.id} variants={item} layout>
                {renderRow(i)}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    );
  }
}
