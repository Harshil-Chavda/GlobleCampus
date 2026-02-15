"use client";
import Link from "next/link";
import styles from "./Footer.module.css";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages only
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              Globle<span>Campus</span>
            </div>
            <p className={styles.tagline}>
              AI-Powered Learning for the Next Generation. Empowering students
              worldwide with quality resources.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                𝕏
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                📷
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                🔗
              </a>
              <a href="#" className={styles.socialLink} aria-label="GitHub">
                ⚙️
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.column}>
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link href="/materials">Materials</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/videos">Videos</Link>
              </li>
              <li>
                <Link href="/sell-book">Marketplace</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.column}>
            <h3>Company</h3>
            <ul>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletter}>
            <h3>Stay Updated</h3>
            <p>Get the latest resources and updates delivered to your inbox.</p>
            <div className={styles.form}>
              <input type="email" placeholder="Your email address" />
              <button>Subscribe →</button>
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div className={styles.divider}></div>

        {/* Bottom */}
        <div className={styles.copyright}>
          <p>© 2026 GlobleCampus. All rights reserved.</p>
          <div className={styles.legal}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
