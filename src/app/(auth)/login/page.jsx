"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import styles from "../Auth.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Email not confirmed") {
        setError("Your email is not verified yet. Please check your inbox.");
      } else if (error.message === "Invalid login credentials") {
        setError(
          "Incorrect email or password. Please check the credentials sent to your email.",
        );
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <>
      <h2 className={styles.title}>Welcome Back</h2>
      <p className={styles.subtitle}>
        Log in with the credentials sent to your email.
      </p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            placeholder="Paste your password from email"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p
        className={styles.footer}
        style={{ marginTop: "1rem", marginBottom: "0" }}
      >
        <Link href="/forgot-password" className={styles.link}>
          Forgot your password?
        </Link>
      </p>

      <p className={styles.footer}>
        Don&apos;t have an account?
        <Link href="/signup" className={styles.link}>
          Sign up
        </Link>
      </p>
    </>
  );
}

