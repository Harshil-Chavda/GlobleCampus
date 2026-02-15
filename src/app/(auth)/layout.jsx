import styles from "./Auth.module.css";
import Link from "next/link";

export default function AuthLayout({ children }) {
  // Styles for the glass card
  const cardStyle = {
    maxWidth: "600px", // Wider card for signup
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard} style={cardStyle}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            Globle<span>Campus</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
