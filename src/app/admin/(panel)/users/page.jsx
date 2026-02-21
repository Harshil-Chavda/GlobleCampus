"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import styles from "../../Admin.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [trashModal, setTrashModal] = useState(null); // { user, reason }
  const [trashReason, setTrashReason] = useState("");
  const [processing, setProcessing] = useState(null);
  const [toast, setToast] = useState(null);
  const [userStats, setUserStats] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .is("trashed_at", null)
      .order("created_at", { ascending: false });

    if (data) {
      setUsers(data);
      // Fetch stats for each user
      const statsMap = {};
      for (const u of data) {
        const [matCount, blogCount, vidCount, mktCount, txnEarned, txnSpent] =
          await Promise.all([
            supabase
              .from("materials")
              .select("id", { count: "exact", head: true })
              .eq("user_id", u.id),
            supabase
              .from("blogs")
              .select("id", { count: "exact", head: true })
              .eq("user_id", u.id),
            supabase
              .from("videos")
              .select("id", { count: "exact", head: true })
              .eq("user_id", u.id),
            supabase
              .from("marketplace_items")
              .select("id", { count: "exact", head: true })
              .eq("user_id", u.id),
            supabase
              .from("gc_transactions")
              .select("amount")
              .eq("user_id", u.id)
              .eq("type", "earned"),
            supabase
              .from("gc_transactions")
              .select("amount")
              .eq("user_id", u.id)
              .eq("type", "spent"),
          ]);

        const totalUploads =
          (matCount.count || 0) +
          (blogCount.count || 0) +
          (vidCount.count || 0) +
          (mktCount.count || 0);
        const earned =
          txnEarned.data?.reduce((s, t) => s + (t.amount || 0), 0) || 0;
        const spent =
          txnSpent.data?.reduce((s, t) => s + Math.abs(t.amount || 0), 0) || 0;

        statsMap[u.id] = { totalUploads, earned, spent };
      }
      setUserStats(statsMap);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    setProcessing(userId);
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
    showToast(`Role updated to ${newRole}`);
    setProcessing(null);
  };

  const handleTrash = async () => {
    if (!trashModal) return;
    setProcessing(trashModal.id);

    await supabase
      .from("profiles")
      .update({
        trashed_at: new Date().toISOString(),
        trash_reason: trashReason || "No reason provided",
      })
      .eq("id", trashModal.id);

    setUsers((prev) => prev.filter((u) => u.id !== trashModal.id));
    showToast(`User ${trashModal.first_name || ""} removed to Recycle Bin`);
    setTrashModal(null);
    setTrashReason("");
    setProcessing(null);
  };

  const filtered = users.filter((u) =>
    (u.first_name + " " + u.last_name + " " + u.email)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };
  const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>Loading users...
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
        <h1 className={styles.pageTitle}>Users 👥</h1>
        <p className={styles.pageSubtitle}>
          {users.length} registered users on GlobleCampus.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: "1.5rem" }}
      >
        <input
          placeholder="🔍 Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchBar}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ overflowX: "auto" }}
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>College / Company</th>
              <th>Account</th>
              <th>GC-Tokens</th>
              <th>Joined</th>
              <th>Uploads</th>
              <th>GC Earned</th>
              <th>GC Spent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={container} initial="hidden" animate="show">
            {filtered.map((u) => {
              const st = userStats[u.id] || {};
              const isPremium = (u.gc_token_balance || 0) >= 50;
              return (
                <motion.tr key={u.id} variants={item} layout>
                  <td
                    style={{
                      color: "#f8fafc",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.first_name} {u.last_name}
                    {u.is_admin && (
                      <span
                        style={{
                          color: "#ef4444",
                          marginLeft: "0.3rem",
                          fontSize: "0.75rem",
                        }}
                      >
                        Admin
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.82rem" }}>{u.email}</td>
                  <td>
                    <select
                      className={styles.roleSelect}
                      value={u.role || "student"}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={processing === u.id}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="professional">Professional</option>
                    </select>
                  </td>
                  <td>{u.college || u.company || "—"}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${isPremium ? styles.badgeApproved : styles.badgePending}`}
                    >
                      {isPremium ? "⭐ Pro" : "Free"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "#fbbf24" }}>
                    🪙 {u.gc_token_balance || 0}
                  </td>
                  <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    {formatDate(u.created_at)}
                  </td>
                  <td style={{ fontWeight: 600, textAlign: "center" }}>
                    {st.totalUploads || 0}
                  </td>
                  <td
                    style={{
                      color: "#4ade80",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {st.earned || 0}
                  </td>
                  <td
                    style={{
                      color: "#f87171",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {st.spent || 0}
                  </td>
                  <td>
                    <button
                      className={styles.btnTrash}
                      onClick={() => setTrashModal(u)}
                      disabled={u.is_admin}
                      title={
                        u.is_admin
                          ? "Cannot remove admin"
                          : "Move to Recycle Bin"
                      }
                    >
                      🗑️
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </motion.div>

      {/* Trash Confirmation Modal */}
      <AnimatePresence>
        {trashModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setTrashModal(null);
              setTrashReason("");
            }}
          >
            <motion.div
              className={styles.modalCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalTitle}>🗑️ Remove User</div>
              <div className={styles.modalText}>
                Are you sure you want to remove{" "}
                <strong style={{ color: "#f8fafc" }}>
                  {trashModal.first_name} {trashModal.last_name}
                </strong>{" "}
                ({trashModal.email})?
                <br />
                <br />
                This user will be moved to the Recycle Bin and can be restored
                later.
              </div>
              <textarea
                placeholder="Reason for removal (optional)..."
                value={trashReason}
                onChange={(e) => setTrashReason(e.target.value)}
                className={styles.modalInput}
              />
              <div className={styles.modalActions}>
                <button
                  className={styles.modalBtnCancel}
                  onClick={() => {
                    setTrashModal(null);
                    setTrashReason("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.modalBtnConfirm}
                  onClick={handleTrash}
                  disabled={processing}
                >
                  {processing ? "Removing..." : "Remove User"}
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
            className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

