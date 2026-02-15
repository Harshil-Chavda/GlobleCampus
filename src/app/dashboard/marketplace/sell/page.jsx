"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "../Marketplace.module.css";

export default function SellItemPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    type: "sell",
    category: "Books",
    image_url: "",
    contact_info: "",
  });

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
      setForm((prev) => ({ ...prev, contact_info: session.user.email }));
    };
    getUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("marketplace_items").insert([
      {
        user_id: user.id,
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        type: form.type,
        category: form.category,
        image_url: form.image_url,
        contact_info: form.contact_info,
        status: "pending", // Changed to pending for admin approval
      },
    ]);

    if (!error) {
      setSuccess(true);
      window.scrollTo(0, 0);
    } else {
      console.error("Listing error:", error);
      alert("❌ Failed to list item: " + error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className={styles.formContainer}
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 className={styles.pageTitle} style={{ fontSize: "2.5rem" }}>
            Submitted for Review! 🎉
          </h1>
          <p className={styles.pageSubtitle}>
            Your item has been sent to the admin for approval.
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
            marginTop: "2rem",
            textAlign: "center",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⏳</div>
          <h2 style={{ color: "white", marginBottom: "1rem" }}>Under Review</h2>
          <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
            Our admin team will review your listing and make it live soon.
          </p>

          <button
            onClick={() => router.push("/dashboard/marketplace")}
            className={styles.submitBtn}
            style={{ margin: "0 auto", display: "inline-block" }}
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.pageHeader} style={{ textAlign: "center" }}>
        <h1 className={styles.pageTitle}>List an Item 🏷️</h1>
        <p className={styles.pageSubtitle}>
          Sell or rent books, gadgets, and notes.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Item Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Engineering Physics Textbook"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={styles.input}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div className={styles.fieldGroup} style={{ flex: 1 }}>
            <label className={styles.label}>Price (₹) *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 500"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={styles.input}
            />
          </div>
          <div className={styles.fieldGroup} style={{ flex: 1 }}>
            <label className={styles.label}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={styles.select}
            >
              <option value="Books">📚 Books</option>
              <option value="Electronics">💻 Electronics</option>
              <option value="Notes">Notes</option>
              <option value="Tools">🛠️ Tools</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Listing Type *</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="type"
                value="sell"
                checked={form.type === "sell"}
                onChange={() => setForm({ ...form, type: "sell" })}
              />
              For Sale
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="type"
                value="rent"
                checked={form.type === "rent"}
                onChange={() => setForm({ ...form, type: "rent" })}
              />
              For Rent
            </label>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            rows={4}
            placeholder="Describe condition, edition, etc..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={styles.textarea}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Item Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                // Upload logic
                const fileName = `marketplace/${Date.now()}-${file.name}`;
                const { data, error } = await supabase.storage
                  .from("materials")
                  .upload(fileName, file);

                if (error) {
                  alert("Error uploading image: " + error.message);
                } else {
                  const {
                    data: { publicUrl },
                  } = supabase.storage.from("materials").getPublicUrl(fileName);
                  setForm({ ...form, image_url: publicUrl });
                }
              }
            }}
            className={styles.input}
            style={{ padding: "0.5rem" }}
          />
          {form.image_url && (
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.8rem",
                color: "#4ade80",
              }}
            >
              ✅ Image uploaded successfully!
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Contact Info *</label>
          <input
            type="text"
            required
            placeholder="Email or Phone Number"
            value={form.contact_info}
            onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
            className={styles.input}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => router.push("/dashboard/marketplace")}
            style={{
              background: "transparent",
              border: "1px solid var(--card-border)",
              color: "#94a3b8",
              borderRadius: "10px",
              padding: "0.9rem",
              flex: 1,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Listing..." : "✅ List Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
