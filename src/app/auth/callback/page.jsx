"use client";
import { useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase automatically picks up the token from the URL hash
      const { data, error } = await supabase.auth.getSession();

      if (data?.session) {
        // User is now logged in! Redirect to dashboard
        router.push("/dashboard");
      } else {
        // Something went wrong, send to login
        router.push("/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        color: "white",
        fontSize: "1.5rem",
      }}
    >
      <p>Verifying your account... ✨</p>
    </div>
  );
}

