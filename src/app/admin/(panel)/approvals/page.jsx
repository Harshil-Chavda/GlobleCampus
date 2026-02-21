"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import styles from "../../Admin.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function ApprovalsPage() {
  const [materials, setMaterials] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]); // Added marketplace state
  const [loading, setLoading] = useState(true);
  const [tokenAmounts, setTokenAmounts] = useState({});
  const [processing, setProcessing] = useState(null);
  const [tab, setTab] = useState("materials");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    // Fetch pending materials
    const { data: matData } = await supabase
      .from("materials")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (matData) {
      setMaterials(matData);
      const defaults = {};
      matData.forEach((m) => {
        defaults[m.id] = 3;
      });
      setTokenAmounts(defaults);
    }

    // Fetch pending blogs
    const { data: blogData } = await supabase
      .from("blogs")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (blogData) {
      setBlogs(blogData);
      setTokenAmounts((prev) => {
        const newDefaults = { ...prev };
        blogData.forEach((b) => {
          if (!newDefaults[b.id]) newDefaults[b.id] = 5;
        });
        return newDefaults;
      });
    }

    // Fetch pending videos
    const { data: videoData } = await supabase
      .from("videos")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (videoData) setVideos(videoData);

    // Fetch pending marketplace items
    const { data: marketData } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (marketData) setMarketplaceItems(marketData);

    setLoading(false);
  };

  // --- Material handlers ---
  const handleApprove = async (material) => {
    setProcessing(material.id);
    const tokens = tokenAmounts[material.id] || 3;

    const { error: updateError } = await supabase
      .from("materials")
      .update({
        status: "approved",
        gc_tokens_awarded: tokens,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", material.id);

    if (updateError) {
      console.error(updateError);
      setProcessing(null);
      return;
    }

    const { error: balanceError } = await supabase.rpc("increment_tokens", {
      user_id_input: material.user_id,
      amount_input: tokens,
    });

    if (balanceError) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("gc_token_balance")
        .eq("id", material.user_id)
        .single();

      await supabase
        .from("profiles")
        .update({ gc_token_balance: (profile?.gc_token_balance || 0) + tokens })
        .eq("id", material.user_id);
    }

    await supabase.from("gc_transactions").insert([
      {
        user_id: material.user_id,
        amount: tokens,
        type: "earned",
        description: `Material approved: ${material.title}`,
        material_id: material.id,
      },
    ]);

    setMaterials((prev) => prev.filter((m) => m.id !== material.id));
    showToast(`Material "${material.title}" approved! +${tokens} GC`);
    setProcessing(null);
  };

  const handleReject = async (material) => {
    setProcessing(material.id);
    // Update status first (guaranteed columns)
    await supabase
      .from("materials")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", material.id);
    // Then try to set trash fields (may not exist yet)
    await supabase
      .from("materials")
      .update({
        trashed_at: new Date().toISOString(),
        trash_reason: "Rejected by admin",
      })
      .eq("id", material.id);
    setMaterials((prev) => prev.filter((m) => m.id !== material.id));
    showToast(
      `Material "${material.title}" rejected & moved to Recycle Bin`,
      "error",
    );
    setProcessing(null);
  };

  // --- Blog handlers ---
  const handleBlogApprove = async (blog) => {
    setProcessing(blog.id);
    const tokens = tokenAmounts[blog.id] || 5;

    await supabase
      .from("blogs")
      .update({ status: "approved" })
      .eq("id", blog.id);

    // Award GC-Tokens for blog approval
    const { data: profile } = await supabase
      .from("profiles")
      .select("gc_token_balance")
      .eq("id", blog.user_id)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({ gc_token_balance: (profile.gc_token_balance || 0) + tokens })
        .eq("id", blog.user_id);
    }

    await supabase.from("gc_transactions").insert([
      {
        user_id: blog.user_id,
        amount: tokens,
        type: "earned",
        description: `Blog approved: ${blog.title}`,
      },
    ]);

    setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
    showToast(`Blog "${blog.title}" approved! +${tokens} GC`);
    setProcessing(null);
  };

  const handleBlogReject = async (blog) => {
    setProcessing(blog.id);
    await supabase
      .from("blogs")
      .update({ status: "rejected" })
      .eq("id", blog.id);
    await supabase
      .from("blogs")
      .update({
        trashed_at: new Date().toISOString(),
        trash_reason: "Rejected by admin",
      })
      .eq("id", blog.id);
    setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
    showToast(`Blog "${blog.title}" rejected & moved to Recycle Bin`, "error");
    setProcessing(null);
  };

  // --- Video handlers ---
  const handleVideoApprove = async (video) => {
    setProcessing(video.id);
    await supabase
      .from("videos")
      .update({ status: "approved" })
      .eq("id", video.id);

    // Award 3 GC-Tokens for video approval
    const { data: profile } = await supabase
      .from("profiles")
      .select("gc_token_balance")
      .eq("id", video.user_id)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({ gc_token_balance: (profile.gc_token_balance || 0) + 3 })
        .eq("id", video.user_id);
    }

    await supabase.from("gc_transactions").insert([
      {
        user_id: video.user_id,
        amount: 3,
        type: "earned",
        description: `Video approved: ${video.title}`,
      },
    ]);

    setVideos((prev) => prev.filter((v) => v.id !== video.id));
    setProcessing(null);
  };

  const handleVideoReject = async (video) => {
    setProcessing(video.id);
    await supabase
      .from("videos")
      .update({ status: "rejected" })
      .eq("id", video.id);
    await supabase
      .from("videos")
      .update({
        trashed_at: new Date().toISOString(),
        trash_reason: "Rejected by admin",
      })
      .eq("id", video.id);
    setVideos((prev) => prev.filter((v) => v.id !== video.id));
    showToast(
      `Video "${video.title}" rejected & moved to Recycle Bin`,
      "error",
    );
    setProcessing(null);
  };

  // --- Marketplace handlers ---
  const handleMarketplaceApprove = async (item) => {
    setProcessing(item.id);
    await supabase
      .from("marketplace_items")
      .update({ status: "active" })
      .eq("id", item.id);

    setMarketplaceItems((prev) => prev.filter((i) => i.id !== item.id));
    setProcessing(null);
  };

  const handleMarketplaceReject = async (item) => {
    setProcessing(item.id);
    await supabase
      .from("marketplace_items")
      .update({ status: "rejected" })
      .eq("id", item.id);
    await supabase
      .from("marketplace_items")
      .update({
        trashed_at: new Date().toISOString(),
        trash_reason: "Rejected by admin",
      })
      .eq("id", item.id);
    setMarketplaceItems((prev) => prev.filter((i) => i.id !== item.id));
    showToast(`"${item.title}" rejected & moved to Recycle Bin`, "error");
    setProcessing(null);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>Loading...
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
        <h1 className={styles.pageTitle}>Pending Approvals ✅</h1>
        <p className={styles.pageSubtitle}>
          {materials.length +
            blogs.length +
            videos.length +
            marketplaceItems.length}{" "}
          item(s) waiting for review.
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setTab("materials")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: tab === "materials" ? "#4ade80" : "var(--card-border)",
            background:
              tab === "materials" ? "rgba(34,197,94,0.12)" : "transparent",
            color: tab === "materials" ? "#4ade80" : "#94a3b8",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          📄 Materials ({materials.length})
        </button>
        <button
          onClick={() => setTab("blogs")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: tab === "blogs" ? "#818cf8" : "var(--card-border)",
            background:
              tab === "blogs" ? "rgba(79,70,229,0.12)" : "transparent",
            color: tab === "blogs" ? "#818cf8" : "#94a3b8",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ✍️ Blogs ({blogs.length})
        </button>
        <button
          onClick={() => setTab("videos")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: tab === "videos" ? "#f472b6" : "var(--card-border)",
            background:
              tab === "videos" ? "rgba(244,114,182,0.12)" : "transparent",
            color: tab === "videos" ? "#f472b6" : "#94a3b8",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          🎬 Videos ({videos.length})
        </button>
        <button
          onClick={() => setTab("marketplace")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "8px",
            border: "1px solid",
            borderColor:
              tab === "marketplace" ? "#f59e0b" : "var(--card-border)",
            background:
              tab === "marketplace" ? "rgba(245,158,11,0.12)" : "transparent",
            color: tab === "marketplace" ? "#f59e0b" : "#94a3b8",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          🛒 Marketplace ({marketplaceItems.length})
        </button>
      </div>

      {/* === MATERIALS TAB === */}
      {tab === "materials" && (
        <>
          {materials.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
              <div style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
                All caught up! No pending materials.
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>University</th>
                    <th>Uploaded By</th>
                    <th>Date</th>
                    <th>File</th>
                    <th>GC-Tokens</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m.id}>
                      <td
                        style={{
                          fontWeight: 600,
                          color: "#f8fafc",
                          maxWidth: 200,
                        }}
                      >
                        {m.title}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${styles.badgePending}`}
                        >
                          {m.material_type}
                        </span>
                      </td>
                      <td>{m.subject}</td>
                      <td>{m.university}</td>
                      <td>{m.uploaded_by}</td>
                      <td style={{ fontSize: "0.8rem" }}>
                        {formatDate(m.created_at)}
                      </td>
                      <td>
                        {m.file_url ? (
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.fileLink}
                          >
                            📄 {m.file_name || "View"}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="3"
                          max="50"
                          value={tokenAmounts[m.id] || 3}
                          onChange={(e) =>
                            setTokenAmounts({
                              ...tokenAmounts,
                              [m.id]: Math.max(3, Number(e.target.value)),
                            })
                          }
                          className={styles.tokenInput}
                        />
                        <span
                          style={{
                            color: "#fbbf24",
                            fontSize: "0.8rem",
                            marginLeft: "0.3rem",
                          }}
                        >
                          🪙
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.btnApprove}
                          onClick={() => handleApprove(m)}
                          disabled={processing === m.id}
                        >
                          {processing === m.id ? "..." : "✅ Approve"}
                        </button>
                        <button
                          className={styles.btnReject}
                          onClick={() => handleReject(m)}
                          disabled={processing === m.id}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* === BLOGS TAB === */}
      {tab === "blogs" && (
        <>
          {blogs.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
              <div style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
                No pending blog submissions.
              </div>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {blogs.map((b) => {
                const plainContent = b.content?.replace(/<[^>]*>/g, "") || "";
                return (
                  <div
                    key={b.id}
                    style={{
                      background: "rgba(30, 41, 59, 0.4)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "14px",
                      padding: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            color: "#f8fafc",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            margin: 0,
                          }}
                        >
                          {b.title}
                        </h3>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "0.8rem",
                            marginTop: "0.3rem",
                          }}
                        >
                          👤 {b.author_name} · 📅 {formatDate(b.created_at)} ·
                          📂 {b.category || "—"}
                        </div>
                      </div>
                      {b.tags && b.tags.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: "0.3rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {b.tags.map((t, i) => (
                            <span
                              key={i}
                              style={{
                                background: "rgba(79,70,229,0.1)",
                                color: "#818cf8",
                                padding: "0.1rem 0.5rem",
                                borderRadius: "12px",
                                fontSize: "0.7rem",
                              }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {b.excerpt && (
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.88rem",
                          marginBottom: "0.5rem",
                          fontStyle: "italic",
                        }}
                      >
                        "{b.excerpt}"
                      </p>
                    )}
                    <p
                      style={{
                        color: "#cbd5e1",
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                      }}
                    >
                      {plainContent.length > 300
                        ? plainContent.slice(0, 300) + "..."
                        : plainContent}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          marginRight: "auto",
                        }}
                      >
                        <span
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          GC-Tokens:
                        </span>
                        <input
                          type="number"
                          min="5"
                          max="50"
                          value={tokenAmounts[b.id] || 5}
                          onChange={(e) =>
                            setTokenAmounts({
                              ...tokenAmounts,
                              [b.id]: Math.max(5, Number(e.target.value)),
                            })
                          }
                          className={styles.tokenInput}
                        />
                        <span style={{ color: "#fbbf24", fontSize: "0.85rem" }}>
                          🪙
                        </span>
                      </div>
                      <button
                        className={styles.btnApprove}
                        onClick={() => handleBlogApprove(b)}
                        disabled={processing === b.id}
                      >
                        {processing === b.id ? "..." : "✅ Approve"}
                      </button>
                      <button
                        className={styles.btnReject}
                        onClick={() => handleBlogReject(b)}
                        disabled={processing === b.id}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* === VIDEOS TAB === */}
      {tab === "videos" && (
        <>
          {videos.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
              <div style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
                No pending video submissions.
              </div>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {videos.map((v) => (
                <div
                  key={v.id}
                  style={{
                    background: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "14px",
                    padding: "1.5rem",
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ width: "180px", flexShrink: 0 }}>
                    {v.thumbnail_url ? (
                      <img
                        src={v.thumbnail_url}
                        alt="thumbnail"
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid var(--card-border)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100px",
                          background: "#0f172a",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b",
                        }}
                      >
                        🎬 No Thumb
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        color: "#f8fafc",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        margin: "0 0 0.5rem",
                      }}
                    >
                      {v.title}
                    </h3>
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      📂 {v.category} · 📅 {formatDate(v.created_at)}
                    </div>
                    {v.description && (
                      <p
                        style={{
                          color: "#cbd5e1",
                          fontSize: "0.85rem",
                          lineHeight: 1.5,
                          marginBottom: "1rem",
                        }}
                      >
                        {v.description}
                      </p>
                    )}
                    <a
                      href={v.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#60a5fa",
                        fontSize: "0.85rem",
                        textDecoration: "underline",
                      }}
                    >
                      🔗 {v.video_url}
                    </a>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      className={styles.btnApprove}
                      onClick={() => handleVideoApprove(v)}
                      disabled={processing === v.id}
                      style={{ width: "100%" }}
                    >
                      {processing === v.id ? "..." : "✅ Approve"}
                    </button>
                    <button
                      className={styles.btnReject}
                      onClick={() => handleVideoReject(v)}
                      disabled={processing === v.id}
                      style={{ width: "100%" }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* === MARKETPLACE TAB === */}
      {tab === "marketplace" && (
        <>
          {marketplaceItems.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
              <div style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
                No pending marketplace items.
              </div>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {marketplaceItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "14px",
                    padding: "1.5rem",
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ width: "120px", flexShrink: 0 }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt="item"
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid var(--card-border)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100px",
                          background: "#0f172a",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b",
                          fontSize: "2rem",
                        }}
                      >
                        🛍️
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <h3
                        style={{
                          color: "#f8fafc",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          margin: "0 0 0.5rem",
                        }}
                      >
                        {item.title}
                      </h3>
                      <span
                        style={{
                          background:
                            item.type === "sell"
                              ? "rgba(34,197,94,0.1)"
                              : "rgba(59,130,246,0.1)",
                          color: item.type === "sell" ? "#4ade80" : "#60a5fa",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          height: "fit-content",
                        }}
                      >
                        {item.type === "sell" ? "FOR SALE" : "FOR RENT"}
                      </span>
                    </div>

                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      📂 {item.category} · 💰 ₹{item.price} · 📅{" "}
                      {formatDate(item.created_at)}
                    </div>
                    {item.description && (
                      <p
                        style={{
                          color: "#cbd5e1",
                          fontSize: "0.85rem",
                          lineHeight: 1.5,
                          marginBottom: "1rem",
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      By: {item.contact_info}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      width: "140px",
                    }}
                  >
                    <button
                      className={styles.btnApprove}
                      onClick={() => handleMarketplaceApprove(item)}
                      disabled={processing === item.id}
                      style={{ width: "100%" }}
                    >
                      {processing === item.id ? "..." : "✅ Approve"}
                    </button>
                    <button
                      className={styles.btnReject}
                      onClick={() => handleMarketplaceReject(item)}
                      disabled={processing === item.id}
                      style={{ width: "100%" }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast.type === "error" ? "❌" : "✅"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

