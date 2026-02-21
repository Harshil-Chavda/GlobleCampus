"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import styles from "./Dashboard.module.css";

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false); // Unblock UI before redirecting
        router.push("/login");
        return;
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
        <span className={styles.loadingText}>Verifying Access...</span>
      </div>
    );
  }

  return <div className={styles.pageContainer}>{children}</div>;
}

