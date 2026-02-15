"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./page.module.css";

export default function Home() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, college, gc_token_balance")
        .order("gc_token_balance", { ascending: false })
        .limit(10);
      if (data) setLeaders(data);
    };
    fetchLeaders();
  }, []);

  const getRankClass = (i) => {
    if (i === 0) return styles.rank1;
    if (i === 1) return styles.rank2;
    if (i === 2) return styles.rank3;
    return styles.rankDefault;
  };

  const getRankIcon = (i) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return i + 1;
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.title} fade-in`}>
            The Future of <span className={styles.highlight}>Education</span>
            <br />
            gets Built Here.
          </h1>
          <p
            className={`${styles.subtitle} fade-in`}
            style={{ animationDelay: "0.2s" }}
          >
            Access premium notes, AI-powered tutoring, and a global community of
            learners. Earn GC-Tokens and unlock premium features. Join
            GlobleCampus today.
          </p>

          <div
            className={`${styles.ctaGroup} fade-in`}
            style={{ animationDelay: "0.4s" }}
          >
            <Link href="/signup" className={styles.primaryBtn}>
              Start Learning Free
            </Link>
            <Link href="/login" className={styles.secondaryBtn}>
              Explore Materials
            </Link>
          </div>
        </div>

        <div
          className={`${styles.heroVisual} fade-in`}
          style={{ animationDelay: "0.6s" }}
        >
          <div className={styles.glowOrb}></div>
          <div className={styles.glassCard}>
            <h3>🪙 GC-Tokens</h3>
            <p>
              Earn tokens by uploading — spend them to download premium notes.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Everything you need to <span className={styles.highlight}>excel</span>
        </h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.icon}>📚</div>
            <h3>Premium Notes</h3>
            <p>
              Hand-picked study materials, PYQs, and lecture notes tailored to
              your course.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.icon}>🤖</div>
            <h3>AI Assistant</h3>
            <p>
              24/7 Doubt solving and personalized study plans powered by
              advanced AI.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.icon}>🎥</div>
            <h3>Video Lectures</h3>
            <p>
              Curated video content from top educators, organized by topic and
              difficulty.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.icon}>💰</div>
            <h3>Marketplace</h3>
            <p>
              Buy and sell used books and equipment directly with other
              students.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.icon}>✍️</div>
            <h3>Blog Community</h3>
            <p>
              Share knowledge, tips, and experiences through blogs. Read and
              learn from fellow students.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.icon}>🏆</div>
            <h3>Leaderboard & Rewards</h3>
            <p>
              Top contributors earn GC-Tokens and get featured on the
              leaderboard. Compete and grow!
            </p>
          </div>
        </div>
      </section>

      {/* GC-Token Economy Section */}
      <section className={styles.tokenSection}>
        <div className={styles.tokenGrid}>
          <div className={styles.tokenInfo}>
            <h2>
              🪙 What are <span className={styles.highlight}>GC-Tokens</span>?
            </h2>
            <p>
              GC-Tokens are the heart of the GlobleCampus economy. They reward
              you for contributing and let you access premium materials uploaded
              by others. The more you share, the more you earn!
            </p>

            <div className={styles.tokenFeatures}>
              <div className={styles.tokenFeature}>
                <span className={styles.tokenFeatureIcon}>🎁</span>
                <div className={styles.tokenFeatureText}>
                  <h4>15 Free Tokens on Signup</h4>
                  <p>Every new user gets 15 GC-Tokens to start exploring.</p>
                </div>
              </div>

              <div className={styles.tokenFeature}>
                <span className={styles.tokenFeatureIcon}>📤</span>
                <div className={styles.tokenFeatureText}>
                  <h4>Earn by Uploading</h4>
                  <p>
                    Upload materials, blogs, or videos and earn 3-10 GC-Tokens
                    per approval.
                  </p>
                </div>
              </div>

              <div className={styles.tokenFeature}>
                <span className={styles.tokenFeatureIcon}>📥</span>
                <div className={styles.tokenFeatureText}>
                  <h4>Spend to Download</h4>
                  <p>Download any material for just 0.25 - 0.50 GC-Tokens.</p>
                </div>
              </div>

              <div className={styles.tokenFeature}>
                <span className={styles.tokenFeatureIcon}>⭐</span>
                <div className={styles.tokenFeatureText}>
                  <h4>Unlock GC Premium Pro</h4>
                  <p>
                    Reach 50+ GC-Tokens to unlock Premium Pro features including
                    priority support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.tokenVisual}>
            <div className={styles.tokenCoin}>🪙</div>
            <div className={styles.tokenFlow}>
              <div className={styles.tokenFlowStep}>
                <span>📝</span>
                <p>Sign Up</p>
              </div>
              <div className={styles.tokenFlowStep}>
                <span>📤</span>
                <p>Upload</p>
              </div>
              <div className={styles.tokenFlowStep}>
                <span>✅</span>
                <p>Get Approved</p>
              </div>
              <div className={styles.tokenFlowStep}>
                <span>🪙</span>
                <p>Earn Tokens</p>
              </div>
              <div className={styles.tokenFlowStep}>
                <span>📥</span>
                <p>Download</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`${styles.section} ${styles.altSection}`}>
        <h2 className={styles.sectionTitle}>How GlobleCampus Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>01</span>
            <h3>Sign Up</h3>
            <p>Create your profile and select your college and course.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>02</span>
            <h3>Explore</h3>
            <p>Access materials and videos specific to your syllabus.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>03</span>
            <h3>Contribute</h3>
            <p>
              Upload your own notes and earn GC-Tokens & recognition on the
              leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section — Updated */}
      <section className={styles.statsSection}>
        <div className={styles.stat}>
          <div className={styles.statValue}>500+</div>
          <div className={styles.statLabel}>Study Notes</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>1.5k+</div>
          <div className={styles.statLabel}>Active Students</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>10+</div>
          <div className={styles.statLabel}>Countries Reached</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>25+</div>
          <div className={styles.statLabel}>Top Contributors</div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className={styles.leaderboardSection}>
        <h2 className={styles.sectionTitle}>
          🏆 Top <span className={styles.highlight}>Contributors</span>
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            marginTop: "-2.5rem",
            marginBottom: "2.5rem",
            fontSize: "1.05rem",
          }}
        >
          Upload study materials and climb the leaderboard. The more you share,
          the higher you rank!
        </p>

        {leaders.length === 0 ? (
          <div className={styles.emptyLeaderboard}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏅</div>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
              Be the first to upload and claim the #1 spot!
            </p>
            <Link
              href="/signup"
              className={styles.primaryBtn}
              style={{ marginTop: "1rem", display: "inline-block" }}
            >
              Get Started
            </Link>
          </div>
        ) : (
          <table className={styles.leaderboardTable}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Contributor</th>
                <th>College</th>
                <th>🪙 GC-Tokens</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((l, i) => (
                <tr key={i}>
                  <td>
                    <span className={`${styles.rankBadge} ${getRankClass(i)}`}>
                      {getRankIcon(i)}
                    </span>
                  </td>
                  <td className={styles.leaderName}>
                    {l.first_name} {l.last_name}
                  </td>
                  <td className={styles.leaderCollege}>{l.college || "—"}</td>
                  <td className={styles.leaderTokens}>
                    🪙 {l.gc_token_balance || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* FAQ Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          <details className={styles.faqItem}>
            <summary>Is GlobleCampus free to use?</summary>
            <p>
              Yes, signing up and accessing basic materials is completely free.
              You also get 15 free GC-Tokens on signup to start downloading
              premium notes.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>How can I upload my own notes?</summary>
            <p>
              Once you sign up, you can head to your Dashboard and click on
              &quot;Upload Material&quot;. You&apos;ll earn GC-Tokens for every
              approved upload!
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>What are GC-Tokens and how do they work?</summary>
            <p>
              GC-Tokens are the platform currency. Earn them by uploading
              materials (3-10 tokens per approval). Spend them to download notes
              from others (0.25-0.50 tokens per download). Reach 50+ tokens to
              unlock GC Premium Pro features!
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>Is the AI Tutor available 24/7?</summary>
            <p>
              Absolutely. Our AI Tutor is trained on your specific curriculum
              and is available anytime to answer doubts or summarize topics.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>Can I sell my old textbooks here?</summary>
            <p>
              Yes! Our Marketplace allows you to list used books and tools. You
              can chat directly with buyers on the platform.
            </p>
          </details>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.ctaSection}>
        <h2>Ready to transform your grades?</h2>
        <p>Join thousands of students already learning smarter, not harder.</p>
        <Link
          href="/signup"
          className={`${styles.primaryBtn} ${styles.largeBtn}`}
        >
          Join GlobleCampus Now
        </Link>
      </section>
    </div>
  );
}
