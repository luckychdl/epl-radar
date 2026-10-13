import Link from "next/link";
import HeaderNav from "../HeaderNav/HeaderNav";
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <div>
        <Link href="/" className={styles.wordmark} aria-label="EPL RADAR 홈">
          <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="5" />
            <path d="M12 12 19 5" />
          </svg>
          <span>
            EPL<em>Radar</em>
          </span>
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}
