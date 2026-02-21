"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import Link from "next/link";
import styles from "./Viewer.module.css";

export default function MaterialViewer() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (p) setProfile(p);
      }

      if (id) {
        const { data } = await supabase
          .from("materials")
          .select("*")
          .eq("id", id)
          .single();
        if (data) {
          // Increment view count
          await supabase
            .from("materials")
            .update({ views: (data.views || 0) + 1 })
            .eq("id", id);
          setMaterial({ ...data, views: (data.views || 0) + 1 });
        }
      }

      setLoading(false);
    };
    init();
  }, [id]);

  const isOwner = user && material && material.user_id === user.id;
  const downloadPrice = isOwner ? 0.25 : 0.5;
  const balance = profile?.gc_token_balance || 0;
  const canAfford = balance >= downloadPrice;
  const isPremiumPro = balance >= 50;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const getFileType = (url) => {
    if (!url) return "unknown";
    const ext = url.split(".").pop().split("?")[0].toLowerCase();
    if (["pdf"].includes(ext)) return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
      return "image";
    if (["doc", "docx"].includes(ext)) return "doc";
    if (["ppt", "pptx"].includes(ext)) return "ppt";
    return "other";
  };

  const getTypeIcon = (type) => {
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

  const getTypeColor = (type) => {
    switch (type) {
      case "Notes":
        return "#60a5fa";
      case "Important Questions":
        return "#fbbf24";
      case "Question Paper":
        return "#a855f7";
      case "Assignment":
        return "#4ade80";
      case "Lab Manual":
        return "#f472b6";
      default:
        return "#94a3b8";
    }
  };

  const handleDownload = async () => {
    if (!canAfford) {
      setDownloadError("Insufficient GC-Tokens!");
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      // 1. Deduct tokens
      const newBalance = balance - downloadPrice;
      await supabase
        .from("profiles")
        .update({ gc_token_balance: newBalance })
        .eq("id", user.id);

      // 2. Log transaction
      await supabase.from("gc_transactions").insert([
        {
          user_id: user.id,
          amount: -downloadPrice,
          type: "spent",
          description: `📥 Downloaded: ${material.title}`,
          material_id: material.id,
        },
      ]);

      // 3. Update local state
      setProfile({ ...profile, gc_token_balance: newBalance });

      // 4. Trigger download
      const a = document.createElement("a");
      a.href = material.file_url;
      a.download = material.file_name || material.title;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setShowModal(false);
    } catch (err) {
      setDownloadError("Download failed. Try again.");
    }

    setDownloading(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingRing}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <span>Loading material...</span>
      </div>
    );
  }

  if (!material) {
    return (
      <div className={styles.errorScreen}>
        <div className={styles.errorEmoji}>📄</div>
        <h2>Material Not Found</h2>
        <p>This material may have been removed or doesn't exist.</p>
        <Link href="/dashboard/materials" className={styles.actionBtn}>
          ← Back to Materials
        </Link>
      </div>
    );
  }

  const fileType = getFileType(material.file_url);
  const typeColor = getTypeColor(material.material_type);

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/dashboard" className={styles.breadcrumbLink}>
          Dashboard
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <Link href="/dashboard/materials" className={styles.breadcrumbLink}>
          Materials
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>{material.title}</span>
      </div>

      {/* Hero Card */}
      <div className={styles.heroCard}>
        <div
          className={styles.heroGlow}
          style={{
            background: `radial-gradient(circle at 20% 50%, ${typeColor}15, transparent 60%)`,
          }}
        />

        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div
              className={styles.typeIcon}
              style={{ background: `${typeColor}20`, color: typeColor }}
            >
              {getTypeIcon(material.material_type)}
            </div>
            <div>
              <span
                className={styles.typeBadge}
                style={{
                  background: `${typeColor}15`,
                  color: typeColor,
                  border: `1px solid ${typeColor}30`,
                }}
              >
                {material.material_type}
              </span>
              <h1 className={styles.heroTitle}>{material.title}</h1>
              {material.description && (
                <p className={styles.heroDesc}>{material.description}</p>
              )}
              <div className={styles.heroMeta}>
                <span>👤 {material.uploaded_by}</span>
                <span>•</span>
                <span>📅 {formatDate(material.created_at)}</span>
                <span>•</span>
                <span>👁️ {material.views || 0} views</span>
                {material.gc_tokens_awarded > 0 && (
                  <>
                    <span>•</span>
                    <span className={styles.tokenHighlight}>
                      🪙 {material.gc_tokens_awarded} Tokens Earned
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.heroActions}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={styles.previewBtn}
            >
              {showPreview ? "✕ Close Preview" : "👁️ Preview"}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className={styles.downloadBtn}
            >
              📥 Download — {downloadPrice} GC
            </button>
            {isOwner && (
              <span className={styles.ownerBadge}>✨ Your Material</span>
            )}
          </div>
        </div>
      </div>

      {/* Download Confirmation Modal */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>📥</div>
            <h3 className={styles.modalTitle}>Confirm Download</h3>
            <p className={styles.modalText}>
              This will cost{" "}
              <strong style={{ color: "#fbbf24" }}>
                {downloadPrice} GC-Tokens
              </strong>
              {isOwner ? " (your own material — discounted!)" : ""}.
            </p>

            <div className={styles.modalBalance}>
              <div className={styles.balanceRow}>
                <span>Current Balance</span>
                <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                  🪙 {balance.toFixed(2)}
                </span>
              </div>
              <div className={styles.balanceRow}>
                <span>Download Cost</span>
                <span style={{ color: "#f87171" }}>- {downloadPrice}</span>
              </div>
              <div className={styles.balanceDivider} />
              <div className={styles.balanceRow}>
                <span style={{ fontWeight: 600 }}>After Download</span>
                <span
                  style={{
                    color: canAfford ? "#4ade80" : "#f87171",
                    fontWeight: 700,
                  }}
                >
                  🪙 {(balance - downloadPrice).toFixed(2)}
                </span>
              </div>
            </div>

            {downloadError && (
              <p className={styles.modalError}>{downloadError}</p>
            )}

            {!canAfford && (
              <div className={styles.insufficientBanner}>
                ⚠️ Not enough GC-Tokens! Upload materials to earn more.
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                className={styles.modalCancel}
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={!canAfford || downloading}
                className={styles.modalConfirm}
              >
                {downloading
                  ? "Downloading..."
                  : canAfford
                    ? `Pay ${downloadPrice} GC & Download`
                    : "Insufficient Tokens"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Pro Banner */}
      {isPremiumPro && (
        <div className={styles.premiumBanner}>
          <div className={styles.premiumLeft}>
            <span className={styles.premiumBadge}>👑 GC PREMIUM PRO</span>
            <span className={styles.premiumText}>
              You've unlocked Premium Pro! Get personalized study support.
            </span>
          </div>
          <Link href="/dashboard/premium-pro" className={styles.premiumCTA}>
            Ask a Query →
          </Link>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h3>📄 File Preview</h3>
            <button
              onClick={() => setShowPreview(false)}
              className={styles.closePreviewBtn}
            >
              ✕
            </button>
          </div>
          <div className={styles.previewBody}>
            {fileType === "pdf" ? (
              <iframe
                src={`${material.file_url}#toolbar=1&navpanes=0`}
                className={styles.pdfFrame}
                title={material.title}
              />
            ) : fileType === "image" ? (
              <div className={styles.imageWrap}>
                <img src={material.file_url} alt={material.title} />
              </div>
            ) : (
              <div className={styles.noPreview}>
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                    opacity: 0.4,
                  }}
                >
                  {fileType === "doc" ? "📝" : fileType === "ppt" ? "📊" : "📁"}
                </div>
                <p>Preview not available for this file type</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <span className={styles.infoCardIcon}>🎓</span> Academic Details
          </h3>
          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Course</span>
              <span className={styles.infoValue}>{material.course}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Specialization</span>
              <span className={styles.infoValue}>
                {material.specialization}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Subject</span>
              <span className={styles.infoValue}>{material.subject}</span>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <span className={styles.infoCardIcon}>🏛️</span> Institution
          </h3>
          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>University</span>
              <span className={styles.infoValue}>{material.university}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Language</span>
              <span className={styles.infoValue}>
                {material.language || "English"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.statusBadge}>✅ Approved</span>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <span className={styles.infoCardIcon}>💰</span> Pricing
          </h3>
          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Your Price</span>
              <span
                className={styles.infoValue}
                style={{ color: "#fbbf24", fontWeight: 700 }}
              >
                🪙 {downloadPrice} GC
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Your Balance</span>
              <span
                className={styles.infoValue}
                style={{
                  color: canAfford ? "#4ade80" : "#f87171",
                  fontWeight: 700,
                }}
              >
                🪙 {balance.toFixed(2)} GC
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ownership</span>
              <span className={styles.infoValue}>
                {isOwner ? "✨ You" : material.uploaded_by}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCTA}>
        <Link href="/dashboard/materials" className={styles.secondaryBtn}>
          ← Back to Materials
        </Link>
        <button
          onClick={() => setShowModal(true)}
          className={styles.downloadBtn}
        >
          📥 Download — {downloadPrice} GC
        </button>
      </div>
    </div>
  );
}

