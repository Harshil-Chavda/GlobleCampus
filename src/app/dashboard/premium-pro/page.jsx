"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import styles from "./PremiumPro.module.css";

export default function PremiumProPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    subject: "",
    course: "",
    topic: "",
    description: "",
    urgency: "normal",
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false); // Fix: unblock loading state
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (p) setProfile(p);

      // Fetch user's queries
      const { data: q } = await supabase
        .from("support_queries")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (q) setQueries(q);

      setLoading(false);
    };
    init();
  }, [router]);

  const balance = profile?.gc_token_balance || 0;
  const isPremium = balance >= 50;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("support_queries").insert([
      {
        user_id: user.id,
        user_email: profile?.email,
        user_name:
          `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(),
        subject: form.subject,
        course: form.course,
        topic: form.topic,
        description: form.description,
        urgency: form.urgency,
        status: "pending",
      },
    ]);

    if (!error) {
      setSuccess(true);
      setShowForm(false);
      setForm({
        subject: "",
        course: "",
        topic: "",
        description: "",
        urgency: "normal",
      });

      // Reload queries
      const { data: q } = await supabase
        .from("support_queries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (q) setQueries(q);

      setTimeout(() => setSuccess(false), 4000);
    }

    setSubmitting(false);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "rgba(251, 191, 36, 0.12)",
          color: "#fbbf24",
          text: "⏳ Pending",
        };
      case "in-progress":
        return {
          bg: "rgba(59, 130, 246, 0.12)",
          color: "#60a5fa",
          text: "🔄 In Progress",
        };
      case "resolved":
        return {
          bg: "rgba(34, 197, 94, 0.12)",
          color: "#4ade80",
          text: "✅ Resolved",
        };
      default:
        return {
          bg: "rgba(148, 163, 184, 0.12)",
          color: "#94a3b8",
          text: status,
        };
    }
  };

  if (!mounted || loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
        <span>Loading Premium Pro...</span>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className={styles.lockedScreen}>
        <div className={styles.lockIcon}>🔒</div>
        <h2>GC Premium Pro</h2>
        <p>
          You need <strong style={{ color: "#fbbf24" }}>50+ GC-Tokens</strong>{" "}
          to unlock Premium Pro.
        </p>
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min((balance / 50) * 100, 100)}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {balance.toFixed(2)} / 50 GC
          </span>
        </div>
        <p className={styles.lockTip}>
          💡 Upload study materials to earn GC-Tokens and unlock Premium!
        </p>
        <button
          onClick={() => router.push("/dashboard/materials/upload")}
          className={styles.uploadBtn}
        >
          📤 Upload Materials to Earn
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.crownBadge}>👑</span>
          <div>
            <h1 className={styles.title}>GC Premium Pro</h1>
            <p className={styles.subtitle}>
              Get personalized study support from our expert team.
            </p>
          </div>
        </div>
        <div className={styles.balancePill}>🪙 {balance.toFixed(2)} GC</div>
      </div>

      {/* Features */}
      <div className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📚</div>
          <h4>Request Materials</h4>
          <p>Ask for any study material you need.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>💬</div>
          <h4>Study Queries</h4>
          <p>Get answers to your academic questions.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⚡</div>
          <h4>Fast Response</h4>
          <p>Our team reaches you in 1–2 hours.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>✅</div>
          <h4>24hr Resolution</h4>
          <p>Queries solved within 24 hours, ASAP.</p>
        </div>
      </div>

      {success && (
        <div className={styles.successBanner}>
          🎉 Your query has been submitted! Our team will reach you within 1–2
          hours.
        </div>
      )}

      {/* Submit Query Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className={styles.newQueryBtn}
        >
          ✨ Submit a New Query
        </button>
      )}

      {/* Query Form */}
      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>📩 Submit Your Query</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                />
              </div>
              <div className={styles.field}>
                <label>Course</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech CSE"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binary Trees"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Urgency</label>
                <select
                  value={form.urgency}
                  onChange={(e) =>
                    setForm({ ...form, urgency: e.target.value })
                  }
                >
                  <option value="low">🟢 Low — Anytime this week</option>
                  <option value="normal">🟡 Normal — Within 24 hours</option>
                  <option value="urgent">🔴 Urgent — ASAP</option>
                </select>
              </div>
            </div>

            <div className={styles.field} style={{ marginTop: "1rem" }}>
              <label>Description *</label>
              <textarea
                required
                rows={5}
                placeholder="Describe what you need help with in detail. The more specific you are, the faster we can help..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={styles.submitBtn}
              >
                {submitting ? "Submitting..." : "🚀 Submit Query"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Previous Queries */}
      {queries.length > 0 && (
        <div className={styles.querySection}>
          <h3 className={styles.sectionTitle}>
            📋 Your Queries ({queries.length})
          </h3>
          <div className={styles.queryList}>
            {queries.map((q) => {
              const status = getStatusStyle(q.status);
              return (
                <div key={q.id} className={styles.queryCard}>
                  <div className={styles.queryTop}>
                    <div>
                      <h4 className={styles.querySubject}>
                        {q.subject} — {q.topic}
                      </h4>
                      <span className={styles.queryDate}>
                        {formatDate(q.created_at)}
                      </span>
                    </div>
                    <span
                      className={styles.queryBadge}
                      style={{ background: status.bg, color: status.color }}
                    >
                      {status.text}
                    </span>
                  </div>
                  <p className={styles.queryDesc}>{q.description}</p>
                  {q.admin_response && (
                    <div className={styles.responseBlock}>
                      <strong>💬 Team Response:</strong>
                      <p>{q.admin_response}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {queries.length === 0 && !showForm && (
        <div className={styles.emptyQueries}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
          <p>No queries yet. Submit your first query to get started!</p>
        </div>
      )}
    </div>
  );
}
