"use client";
import { useState } from "react";
import styles from "../Auth.module.css";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={`${styles.successBox} fade-in`}>
        <div className={styles.successIcon}>📧</div>
        <h2 className={styles.title}>Check Your Email!</h2>
        <p>
          If an account exists with <strong>{email}</strong>, we&apos;ve sent a
          new password to your inbox.
        </p>
        <p>Use the new credentials to log in.</p>
        <Link
          href="/login"
          className={styles.submitBtn}
          style={{
            textAlign: "center",
            display: "block",
            marginTop: "1.5rem",
            textDecoration: "none",
          }}
        >
          Go to Login Page →
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className={styles.title}>Forgot Password? 🔑</h2>
      <p className={styles.subtitle}>
        Enter your registered email and we&apos;ll send you a new password.
      </p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="reset-email">
            Email Address
          </label>
          <input
            id="reset-email"
            type="email"
            className={styles.input}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Sending..." : "Reset My Password"}
        </button>
      </form>

      <p className={styles.footer}>
        Remember your password?
        <Link href="/login" className={styles.link}>
          Log in
        </Link>
      </p>
    </>
  );
}
