"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "../../Admin.module.css";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const [range, setRange] = useState("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    signups: [],
    uploads: [],
    views: 0,
    downloads: 0,
    tokensEarned: 0,
    tokensSpent: 0,
    contentByType: { materials: 0, blogs: 0, videos: 0, marketplace: 0 },
    topUniversities: [],
    totalSignups: 0,
    avgDailyUploads: 0,
    peakDay: "—",
  });

  const getRangeDates = () => {
    const now = new Date();
    let from;
    if (range === "7d") from = new Date(now - 7 * 86400000);
    else if (range === "30d") from = new Date(now - 30 * 86400000);
    else if (range === "12m") from = new Date(now - 365 * 86400000);
    else if (range === "custom" && customFrom) from = new Date(customFrom);
    else from = new Date(now - 7 * 86400000);
    const to = range === "custom" && customTo ? new Date(customTo) : now;
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      days: Math.ceil((to - from) / 86400000),
    };
  };

  useEffect(() => {
    fetchReport();
  }, [range, customFrom, customTo]);

  const fetchReport = async () => {
    setLoading(true);
    const { from, to, days } = getRangeDates();

    // Signups per day
    const { data: profiles } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: true });

    const signupsByDay = groupByDay(profiles || [], days);

    // Uploads (materials) per day
    const { data: mats } = await supabase
      .from("materials")
      .select("created_at")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: true });

    const uploadsByDay = groupByDay(mats || [], days);

    // Views & Downloads
    const { data: viewsData } = await supabase
      .from("materials")
      .select("views, downloads");
    const totalViews = viewsData?.reduce((s, m) => s + (m.views || 0), 0) || 0;
    const totalDownloads =
      viewsData?.reduce((s, m) => s + (m.downloads || 0), 0) || 0;

    // Tokens
    const { data: txnsEarned } = await supabase
      .from("gc_transactions")
      .select("amount")
      .eq("type", "earned")
      .gte("created_at", from)
      .lte("created_at", to);
    const { data: txnsSpent } = await supabase
      .from("gc_transactions")
      .select("amount")
      .eq("type", "spent")
      .gte("created_at", from)
      .lte("created_at", to);

    const tokensEarned =
      txnsEarned?.reduce((s, t) => s + (t.amount || 0), 0) || 0;
    const tokensSpent =
      txnsSpent?.reduce((s, t) => s + (t.amount || 0), 0) || 0;

    // Content by type
    const [matCount, blogCount, vidCount, mktCount] = await Promise.all([
      supabase.from("materials").select("id", { count: "exact", head: true }),
      supabase.from("blogs").select("id", { count: "exact", head: true }),
      supabase.from("videos").select("id", { count: "exact", head: true }),
      supabase
        .from("marketplace_items")
        .select("id", { count: "exact", head: true }),
    ]);

    // Top universities
    const { data: uniData } = await supabase
      .from("materials")
      .select("university");
    const uniCounts = {};
    uniData?.forEach((m) => {
      if (m.university)
        uniCounts[m.university] = (uniCounts[m.university] || 0) + 1;
    });
    const topUniversities = Object.entries(uniCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Peak day
    let peakDay = "—";
    let peakCount = 0;
    signupsByDay.forEach((d) => {
      if (d.count > peakCount) {
        peakCount = d.count;
        peakDay = d.label;
      }
    });

    setData({
      signups: signupsByDay,
      uploads: uploadsByDay,
      views: totalViews,
      downloads: totalDownloads,
      tokensEarned,
      tokensSpent,
      contentByType: {
        materials: matCount.count || 0,
        blogs: blogCount.count || 0,
        videos: vidCount.count || 0,
        marketplace: mktCount.count || 0,
      },
      topUniversities,
      totalSignups: (profiles || []).length,
      avgDailyUploads: days > 0 ? ((mats || []).length / days).toFixed(1) : 0,
      peakDay,
    });

    setLoading(false);
  };

  const groupByDay = (items, maxDays) => {
    const map = {};
    const useMonths = maxDays > 90;

    items.forEach((item) => {
      const d = new Date(item.created_at);
      const key = useMonths
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        : d.toISOString().slice(0, 10);
      map[key] = (map[key] || 0) + 1;
    });

    const result = [];
    if (useMonths) {
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en", { month: "short" });
        result.push({ key, label, count: map[key] || 0 });
      }
    } else {
      const days = Math.min(maxDays, 30);
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("en", {
          day: "numeric",
          month: "short",
        });
        result.push({ key, label, count: map[key] || 0 });
      }
    }

    return result;
  };

  const maxVal = (arr) => Math.max(...arr.map((d) => d.count), 1);

  const contentTotal =
    data.contentByType.materials +
    data.contentByType.blogs +
    data.contentByType.videos +
    data.contentByType.marketplace;
  const contentSlices = [
    {
      label: "Materials",
      value: data.contentByType.materials,
      color: "#a855f7",
    },
    { label: "Blogs", value: data.contentByType.blogs, color: "#818cf8" },
    { label: "Videos", value: data.contentByType.videos, color: "#f472b6" },
    {
      label: "Marketplace",
      value: data.contentByType.marketplace,
      color: "#f59e0b",
    },
  ];

  const buildConicGradient = () => {
    if (contentTotal === 0) return "conic-gradient(#1e293b 0deg 360deg)";
    let segments = [];
    let cumDeg = 0;
    contentSlices.forEach((s) => {
      const deg = (s.value / contentTotal) * 360;
      segments.push(`${s.color} ${cumDeg}deg ${cumDeg + deg}deg`);
      cumDeg += deg;
    });
    return `conic-gradient(${segments.join(", ")})`;
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>Generating report...
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <h1 className={styles.pageTitle}>Reports & Analytics 📈</h1>
        <p className={styles.pageSubtitle}>
          Full platform analytics like Google Analytics.
        </p>
      </motion.div>

      {/* Time Range */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={styles.timeRangeBar}
      >
        {[
          { key: "7d", label: "Last 7 Days" },
          { key: "30d", label: "Last 30 Days" },
          { key: "12m", label: "12 Months" },
          { key: "custom", label: "Custom" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setRange(t.key)}
            className={`${styles.timeRangeBtn} ${range === t.key ? styles.timeRangeBtnActive : ""}`}
          >
            {t.label}
          </button>
        ))}
        {range === "custom" && (
          <>
            <input
              type="date"
              className={styles.dateInput}
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
            <span style={{ color: "#64748b" }}>to</span>
            <input
              type="date"
              className={styles.dateInput}
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </>
        )}
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={styles.summaryGrid}
      >
        <motion.div variants={item} className={styles.summaryCard}>
          <div className={styles.summaryValue}>{data.totalSignups}</div>
          <div className={styles.summaryLabel}>New Signups</div>
        </motion.div>
        <motion.div variants={item} className={styles.summaryCard}>
          <div className={styles.summaryValue}>{data.avgDailyUploads}</div>
          <div className={styles.summaryLabel}>Avg Daily Uploads</div>
        </motion.div>
        <motion.div variants={item} className={styles.summaryCard}>
          <div className={styles.summaryValue}>
            {data.views.toLocaleString()}
          </div>
          <div className={styles.summaryLabel}>Total Views</div>
        </motion.div>
        <motion.div variants={item} className={styles.summaryCard}>
          <div className={styles.summaryValue}>
            {data.downloads.toLocaleString()}
          </div>
          <div className={styles.summaryLabel}>Total Downloads</div>
        </motion.div>
        <motion.div variants={item} className={styles.summaryCard}>
          <div className={styles.summaryValue} style={{ color: "#4ade80" }}>
            🪙 {data.tokensEarned}
          </div>
          <div className={styles.summaryLabel}>Tokens Earned</div>
        </motion.div>
        <motion.div variants={item} className={styles.summaryCard}>
          <div className={styles.summaryValue} style={{ color: "#f87171" }}>
            🪙 {data.tokensSpent}
          </div>
          <div className={styles.summaryLabel}>Tokens Spent</div>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        {/* Signups Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.chartContainer}
        >
          <div className={styles.chartTitle}>📊 New User Signups</div>
          <div className={styles.barChart}>
            {data.signups.map((d, i) => (
              <div className={styles.barWrapper} key={i}>
                <div
                  className={styles.bar}
                  style={{
                    height: `${(d.count / maxVal(data.signups)) * 100}%`,
                    background: "linear-gradient(to top, #6366f1, #a855f7)",
                  }}
                >
                  <span className={styles.barValue}>{d.count}</span>
                </div>
                <span className={styles.barLabel}>{d.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Uploads Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.chartContainer}
        >
          <div className={styles.chartTitle}>📈 Content Uploads</div>
          <div className={styles.barChart}>
            {data.uploads.map((d, i) => (
              <div className={styles.barWrapper} key={i}>
                <div
                  className={styles.bar}
                  style={{
                    height: `${(d.count / maxVal(data.uploads)) * 100}%`,
                    background: "linear-gradient(to top, #34d399, #059669)",
                  }}
                >
                  <span className={styles.barValue}>{d.count}</span>
                </div>
                <span className={styles.barLabel}>{d.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Content by Type - Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={styles.chartContainer}
        >
          <div className={styles.chartTitle}>📂 Content by Type</div>
          <div className={styles.donutContainer}>
            <div
              className={styles.donutChart}
              style={{ background: buildConicGradient() }}
            >
              <div className={styles.donutCenter}>
                <span className={styles.donutCenterValue}>{contentTotal}</span>
                <span className={styles.donutCenterLabel}>Total</span>
              </div>
            </div>
            <div className={styles.chartLegend}>
              {contentSlices.map((s, i) => (
                <div key={i} className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ background: s.color }}
                  ></span>
                  {s.label}
                  <span className={styles.legendValue}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Universities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={styles.chartContainer}
        >
          <div className={styles.chartTitle}>🏛️ Top Universities</div>
          {data.topUniversities.length === 0 ? (
            <div
              style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}
            >
              No data yet
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {data.topUniversities.map((u, i) => {
                const maxUni = data.topUniversities[0]?.count || 1;
                return (
                  <div key={i}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.3rem",
                      }}
                    >
                      <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
                        {u.name}
                      </span>
                      <span
                        style={{
                          color: "#f8fafc",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {u.count}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        background: "#1e293b",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(u.count / maxUni) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        style={{
                          height: "100%",
                          background:
                            "linear-gradient(to right, #ef4444, #f97316)",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Token Economy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={styles.chartContainer}
      >
        <div className={styles.chartTitle}>🪙 GC-Token Economy</div>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ color: "#4ade80", fontWeight: 600 }}>Earned</span>
              <span style={{ color: "#f8fafc", fontWeight: 700 }}>
                {data.tokensEarned} 🪙
              </span>
            </div>
            <div
              style={{
                height: "12px",
                background: "#1e293b",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${data.tokensEarned + data.tokensSpent > 0 ? (data.tokensEarned / (data.tokensEarned + data.tokensSpent)) * 100 : 50}%`,
                }}
                transition={{ duration: 1 }}
                style={{
                  height: "100%",
                  background: "linear-gradient(to right, #22c55e, #4ade80)",
                  borderRadius: "6px",
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ color: "#f87171", fontWeight: 600 }}>Spent</span>
              <span style={{ color: "#f8fafc", fontWeight: 700 }}>
                {data.tokensSpent} 🪙
              </span>
            </div>
            <div
              style={{
                height: "12px",
                background: "#1e293b",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${data.tokensEarned + data.tokensSpent > 0 ? (data.tokensSpent / (data.tokensEarned + data.tokensSpent)) * 100 : 50}%`,
                }}
                transition={{ duration: 1 }}
                style={{
                  height: "100%",
                  background: "linear-gradient(to right, #ef4444, #f87171)",
                  borderRadius: "6px",
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
