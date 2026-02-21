"use client";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const notifFetchedRef = useRef(false);

  // Hide navbar on admin pages (admin has its own sidebar)
  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const fetchProfileData = async (userId) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, gc_token_balance, is_admin")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data);
      } else {
        console.error("Navbar: Profile not found or error:", error);
        setProfile({ gc_token_balance: 0, first_name: "", last_name: "" });
      }
    };

    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchProfileData(session.user.id);
      }
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        // FETCH PROFILE ON AUTH STATE CHANGE TO FIX LOGIN/LOGOUT BUG
        await fetchProfileData(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setNotifications([]);
        notifFetchedRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close notification/menu popup on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async (userId) => {
    // Run ALL notification queries in parallel
    const [txnRes, matRes, blogRes] = await Promise.all([
      supabase
        .from("gc_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("materials")
        .select("id, title, status, reviewed_at")
        .eq("user_id", userId)
        .in("status", ["approved", "rejected"])
        .order("reviewed_at", { ascending: false })
        .limit(5),
      supabase
        .from("blogs")
        .select("id, title, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const notifs = [];

    if (txnRes.data) {
      txnRes.data.forEach((t) => {
        const icon =
          t.type === "earned" ? "🪙" : t.type === "spent" ? "💸" : "🎁";
        notifs.push({
          id: `txn-${t.id}`,
          icon,
          text:
            t.description ||
            `${t.type === "earned" ? "+" : "-"}${t.amount} GC-Tokens`,
          time: t.created_at,
          type: t.type,
        });
      });
    }

    if (matRes.data) {
      matRes.data.forEach((m) => {
        notifs.push({
          id: `mat-${m.id}`,
          icon: m.status === "approved" ? "✅" : "❌",
          text: `Material "${m.title}" ${m.status}`,
          time: m.reviewed_at || m.created_at,
          type: m.status,
        });
      });
    }

    if (blogRes.data) {
      blogRes.data.forEach((b) => {
        const icon =
          b.status === "approved"
            ? "✅"
            : b.status === "rejected"
              ? "❌"
              : "⏳";
        notifs.push({
          id: `blog-${b.id}`,
          icon,
          text: `Blog "${b.title}" ${b.status}`,
          time: b.created_at,
          type: b.status,
        });
      });
    }

    // Sort all by time descending
    notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
    setNotifications(notifs.slice(0, 15));
  };

  // Lazy-load notifications on first bell click
  const handleNotifClick = () => {
    setShowNotif((prev) => !prev);
    if (!notifFetchedRef.current && user) {
      notifFetchedRef.current = true;
      fetchNotifications(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/");
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const initials = profile
    ? `${(profile.first_name?.[0] || "").toUpperCase()}${(profile.last_name?.[0] || "").toUpperCase()}`
    : user?.email?.[0]?.toUpperCase() || "?";

  const unreadCount = notifications.length;

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        Globle<span>Campus</span>
      </Link>

      <ul className={styles.links}>
        {user ? (
          <>
            <li>
              <Link href="/" className={styles.link}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/dashboard/materials" className={styles.link}>
                Materials
              </Link>
            </li>
            <li>
              <Link href="/dashboard/blogs" className={styles.link}>
                Blogs
              </Link>
            </li>
            <li>
              <Link href="/dashboard/videos" className={styles.link}>
                Videos
              </Link>
            </li>
            <li>
              <Link href="/dashboard/marketplace" className={styles.link}>
                Marketplace
              </Link>
            </li>
            <li>
              <Link href="/contact" className={styles.link}>
                Contact
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/login" className={styles.link}>
                Materials
              </Link>
            </li>
            <li>
              <Link href="/login" className={styles.link}>
                Videos
              </Link>
            </li>
            <li>
              <Link href="/login" className={styles.link}>
                Marketplace
              </Link>
            </li>
            <li>
              <Link href="/login" className={styles.link}>
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className={styles.link}>
                Contact
              </Link>
            </li>
          </>
        )}
      </ul>

      <div className={styles.actions}>
        {user ? (
          <>
            {/* GC-Tokens */}
            <div className={styles.tokenBadge}>
              🪙 <span>{profile?.gc_token_balance || 0}</span>
            </div>

            {/* Premium Pro VIP Badge */}
            {profile?.gc_token_balance >= 50 && (
              <Link
                href="/dashboard/premium-pro"
                className={styles.vipBadge}
                title="Premium Pro Member"
              >
                👑 VIP
              </Link>
            )}

            {/* Notification Bell */}
            <div className={styles.notifWrapper} ref={notifRef}>
              <button
                className={styles.notifBtn}
                onClick={handleNotifClick}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className={styles.notifBadge}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className={styles.notifDropdown}>
                  <div className={styles.notifHeader}>
                    <span>Notifications</span>
                    <span className={styles.notifCount}>
                      {notifications.length}
                    </span>
                  </div>
                  <div className={styles.notifList}>
                    {notifications.length === 0 ? (
                      <div className={styles.notifEmpty}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={styles.notifItem}>
                          <span className={styles.notifIcon}>{n.icon}</span>
                          <div className={styles.notifContent}>
                            <div className={styles.notifText}>{n.text}</div>
                            <div className={styles.notifTime}>
                              {timeAgo(n.time)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Dropdown */}
            <div className={styles.avatarMenu} ref={menuRef}>
              <div
                className={styles.avatarCircle}
                onClick={() => setShowMenu(!showMenu)}
                style={{ cursor: "pointer" }}
              >
                {initials}
              </div>

              {showMenu && (
                <div className={styles.dropdown}>
                  <Link
                    href="/dashboard"
                    className={styles.dropdownItem}
                    onClick={() => setShowMenu(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className={styles.dropdownItem}
                    onClick={() => setShowMenu(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  {profile?.is_admin && (
                    <Link
                      href="/admin"
                      className={styles.dropdownItem}
                      onClick={() => setShowMenu(false)}
                    >
                      🔐 Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className={styles.dropdownItem}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login">
              <button className={`${styles.button} ${styles.buttonSecondary}`}>
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className={`${styles.button} ${styles.buttonPrimary}`}>
                Get Started
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

