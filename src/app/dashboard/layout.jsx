"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import styles from "./Dashboard.module.css";

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          if (!session) {
            router.push("/login");
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error verifying access:", error);
        if (mounted) setLoading(false);
      }
    };

    getUser();

    return () => {
      mounted = false;
    };
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
