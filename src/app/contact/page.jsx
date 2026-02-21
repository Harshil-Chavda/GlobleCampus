"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "./Contact.module.css";
import { motion } from "framer-motion";
import { Mail, MapPin, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Save to Database
    const { error } = await supabase.from("contact_queries").insert([
      {
        name: form.name,
        email: form.email,
        message: form.message,
      },
    ]);

    if (!error) {
      // 2. Send Email via API
      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } catch (err) {
        console.error("Email send failed:", err);
      }

      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } else {
      alert("Error sending message: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.blob}
        style={{
          background: "rgba(79, 70, 229, 0.2)",
          width: "500px",
          height: "500px",
          top: "-10%",
          left: "-10%",
          filter: "blur(80px)",
        }}
      ></div>
      <div
        className={styles.blob}
        style={{
          background: "rgba(236, 72, 153, 0.2)",
          width: "400px",
          height: "400px",
          bottom: "-10%",
          right: "-10%",
          filter: "blur(80px)",
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.hero}
      >
        <h1 className={styles.title}>Let's Connect 🤝</h1>
        <p className={styles.subtitle}>
          Have a question, feedback, or just want to say hello? eMaterial is
          here to help you on your learning journey.
        </p>
      </motion.div>

      <div className={styles.contentWrapper}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={styles.infoSection}
        >
          <div className={styles.infoCard}>
            <div className={styles.iconBox}>
              <Mail size={24} />
            </div>
            <div className={styles.cardLabel}>General Inquiries</div>
            <a
              href="mailto:e.material.study@gmail.com"
              className={styles.cardValue}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              e.material.study@gmail.com
            </a>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconBox}>
              <MessageSquare size={24} />
            </div>
            <div className={styles.cardLabel}>Support & Feedback</div>
            <a
              href="mailto:e.material.study@gmail.com"
              className={styles.cardValue}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              e.material.study@gmail.com
            </a>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconBox}>
              <MapPin size={24} />
            </div>
            <div className={styles.cardLabel}>Location</div>
            <div className={styles.cardValue}>GlobalCampus HQ 🌍</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={styles.formSection}
        >
          {sent ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={styles.iconBox}
                style={{
                  margin: "0 auto 1.5rem",
                  background: "#22c55e",
                  color: "white",
                }}
              >
                <Send size={24} />
              </motion.div>
              <h2 style={{ color: "#fff", marginBottom: "0.5rem" }}>
                Message Sent! 🚀
              </h2>
              <p style={{ color: "#94a3b8" }}>
                Thanks for reaching out. We'll get back to you shortly.
              </p>
              <button
                onClick={() => setSent(false)}
                className={styles.submitBtn}
                style={{
                  marginTop: "2rem",
                  background: "transparent",
                  border: "1px solid var(--card-border)",
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className={styles.formTitle}>Send us a Message</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>Your Name</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  required
                  className={styles.input}
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Message</label>
                <textarea
                  required
                  rows={5}
                  className={styles.textarea}
                  placeholder="How can we help you?"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

