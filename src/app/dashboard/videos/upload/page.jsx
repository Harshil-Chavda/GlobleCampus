"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./VideoUpload.module.css";
import Link from "next/link";

export default function VideoUploadPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    video_url: "",
    category: "Programming",
  });
  const [previewId, setPreviewId] = useState(null);

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
    };
    getUser();
  }, []);

  const extractYouTubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  useEffect(() => {
    const id = extractYouTubeId(form.video_url);
    if (id) setPreviewId(id);
    else setPreviewId(null);
  }, [form.video_url]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const videoId = extractYouTubeId(form.video_url);
    const thumbnail_url = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;

    const { error } = await supabase.from("videos").insert([
      {
        user_id: user.id,
        title: form.title,
        description: form.description,
        video_url: form.video_url,
        category: form.category,
        thumbnail_url: thumbnail_url,
        status: "pending", // Default to pending approval
      },
    ]);

    if (!error) {
      setSuccess(true);
      window.scrollTo(0, 0); // Scroll to top for success message
    } else {
      console.error("Video upload error:", error);
      alert("❌ Failed to submit video: " + error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <h1 className={styles.title} style={{ fontSize: "2.5rem" }}>
            Submitted for Review! 🎉
          </h1>
          <p className={styles.subtitle}>
            Your video has been sent to the admin for approval.
          </p>
        </div>

        <div
          style={{
            background: "rgba(30, 41, 59, 0.5)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "3rem",
            maxWidth: "600px",
            margin: "3rem auto",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⏳</div>
          <h2 style={{ color: "white", marginBottom: "1rem" }}>Under Review</h2>
          <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
            Our admin team will review your video and approve it soon.
            <br />
            You'll earn <span style={{ color: "#fbbf24" }}>
              GC-Tokens 🪙
            </span>{" "}
            once approved!
          </p>

          <button
            onClick={() => router.push("/dashboard/videos")}
            className={styles.submitBtn}
            style={{ margin: "0 auto", display: "inline-block" }}
          >
            ← Back to Videos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>📤 Upload Video</h1>
        <p className={styles.subtitle}>
          Share educational content with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Video Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Introduction to React Hooks"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Video URL (YouTube) *</label>
          <input
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            className={styles.input}
          />
          {previewId && (
            <div className={styles.preview}>
              <iframe
                src={`https://www.youtube.com/embed/${previewId}`}
                title="Video preview"
                allowFullScreen
              />
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={styles.select}
          >
            <option value="Programming">💻 Programming</option>
            <option value="Web Development">🌐 Web Development</option>
            <option value="AI/ML">🧠 AI/ML</option>
            <option value="Mobile Dev">📱 Mobile Dev</option>
            <option value="Cybersecurity">🔐 Cybersecurity</option>
            <option value="Cloud">☁️ Cloud</option>
            <option value="Data Science">📊 Data Science</option>
            <option value="Other">📌 Other</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            rows={4}
            placeholder="Briefly describe what this video covers..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={styles.textarea}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.push("/dashboard/videos")}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !form.title || !form.video_url}
            className={styles.submitBtn}
          >
            {loading ? "Submitting..." : "🚀 Submit Video"}
          </button>
        </div>
      </form>
    </div>
  );
}
