"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import styles from "../../Dashboard.module.css";
import { motion } from "framer-motion";

export default function MaterialClient({ initialMaterial }) {
  const [material, setMaterial] = useState(initialMaterial);
  const router = useRouter();

  useEffect(() => {
    // Increment view count on mount
    const incrementView = async () => {
      if (initialMaterial?.id) {
        await supabase
          .from("materials")
          .update({ views: (initialMaterial.views || 0) + 1 })
          .eq("id", initialMaterial.id);
      }
    };
    incrementView();
  }, [initialMaterial]);

  if (!material) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <p className={styles.emptyText}>Material not found</p>
          <button
            onClick={() => router.push("/dashboard/materials")}
            className={styles.sectionAction}
            style={{ marginTop: "1rem" }}
          >
            ← Back to Materials
          </button>
        </div>
      </div>
    );
  }

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

  const isPDF = material.file_url?.toLowerCase().endsWith(".pdf");
  const isImage = material.file_url?.match(/\.(jpeg|jpg|png)$/i);

  return (
    <div className={styles.dashboardContainer}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <div>
          <button
            onClick={() => router.push("/dashboard/materials")}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            ← Back to Materials
          </button>
          <h1 className={styles.pageTitle} style={{ fontSize: "2.5rem" }}>
            {material.title}
          </h1>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              marginTop: "0.5rem",
            }}
          >
            <span
              className={styles.tag}
              style={{
                ...getTagStyle(material.material_type),
                fontSize: "1rem",
                padding: "0.4rem 1rem",
              }}
            >
              {getIcon(material.material_type)} {material.material_type}
            </span>
            <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Added on {new Date(material.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <a
            href={material.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sectionAction}
            download
          >
            ⬇️ Download
          </a>
          {!isPDF && !isImage && (
            <a
              href={material.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sectionAction}
              style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
            >
              📄 View File
            </a>
          )}
        </div>
      </motion.div>

      <div
        className={styles.mainGrid}
        style={{ gridTemplateColumns: "2fr 1fr" }}
      >
        {/* Left Column: Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
        >
          <div
            className={styles.section}
            style={{
              minHeight: "500px",
              padding: 0,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            {isPDF ? (
              <iframe
                src={`${material.file_url}#toolbar=0`}
                width="100%"
                height="600px"
                style={{ border: "none" }}
                title="PDF Preview"
              />
            ) : isImage ? (
              <img
                src={material.file_url}
                alt={material.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "600px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📄</div>
                <p style={{ color: "#94a3b8" }}>
                  Preview not available for this file type.
                </p>
                <a
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#a855f7",
                    textDecoration: "underline",
                    marginTop: "1rem",
                    display: "block",
                  }}
                >
                  Open file in new tab
                </a>
              </div>
            )}
          </div>

          {material.description && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>📝 Description</h2>
              </div>
              <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
                {material.description}
              </p>
            </div>
          )}
        </motion.div>

        {/* Right Column: Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div
            className={styles.statCard}
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
              }}
            >
              <div
                className={styles.statIconWrapper}
                style={{
                  background: "rgba(99, 102, 241, 0.2)",
                  color: "#818cf8",
                }}
              >
                👤
              </div>
              <div>
                <div className={styles.statLabel}>Uploaded By</div>
                <div
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  {material.uploaded_by || "GlobalCampus User"}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Details</h2>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <DetailItem label="Course" value={material.course} icon="🎓" />
              <DetailItem
                label="Specialization"
                value={material.specialization}
                icon="🎯"
              />
              <DetailItem label="Subject" value={material.subject} icon="📖" />
              <DetailItem
                label="University"
                value={material.university}
                icon="🏛️"
              />
              <DetailItem
                label="Language"
                value={material.language}
                icon="🌐"
              />
              <DetailItem label="Views" value={material.views || 0} icon="👁️" />
            </div>
          </div>

          <div
            className={styles.section}
            style={{
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
              border: "1px solid rgba(168, 85, 247, 0.2)",
            }}
          >
            <h3
              style={{
                color: "white",
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
              }}
            >
              Find this helpful?
            </h3>
            <p
              style={{
                color: "#cbd5e1",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              Share it with your friends or classmates!
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard! 📋");
              }}
              className={styles.sectionAction}
              style={{
                width: "100%",
                justifyContent: "center",
                background: "rgba(255,255,255,0.1)",
              }}
            >
              🔗 Copy Link
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: "0.8rem",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          color: "#94a3b8",
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={{ color: "white", fontWeight: "500" }}>{value || "N/A"}</div>
    </div>
  );
}
