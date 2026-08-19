import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" aria-label="EPL RADAR 홈">
        <Image
          src="/symbols/logo.png"
          alt="EPL RADAR"
          width={120}
          height={80}
          priority
        />
      </Link>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/my-teams">My Teams</Link>
        <Link href="/news">News</Link>
        <Link href="/budget">Budget</Link>
      </nav>
    </header>
  );
}
