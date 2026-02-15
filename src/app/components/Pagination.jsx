import styles from "../dashboard/Dashboard.module.css";
import { motion } from "framer-motion";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        marginTop: "2rem",
        padding: "1rem",
      }}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.sectionAction}
        style={{
          opacity: currentPage === 1 ? 0.5 : 1,
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          background: "rgba(255, 255, 255, 0.05)",
        }}
      >
        ← Previous
      </button>

      <span style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
        Page <strong style={{ color: "white" }}>{currentPage}</strong> of{" "}
        <strong style={{ color: "white" }}>{totalPages}</strong>
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.sectionAction}
        style={{
          opacity: currentPage === totalPages ? 0.5 : 1,
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          background: "rgba(255, 255, 255, 0.05)",
        }}
      >
        Next →
      </button>
    </div>
  );
}
