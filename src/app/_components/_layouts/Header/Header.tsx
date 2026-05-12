import Image from "next/image";
import styles from "./Header.module.scss";
import Link from "next/link";
export default function Header() {
  return (
    <header>
      <div className={styles.header}>
        <button>
          <Image
            src={`/symbols/logo.png`}
            alt="EPL RADAR"
            width={120}
            height={80}
          />
        </button>
        <nav>
          <Link href="/dashboard">News</Link>
          <Link href="/standings">Standings</Link>
          <Link href="/matches">Matches</Link>
          <Link href="/teams">Teams</Link>
          <Link href="/my-teams">My Teams</Link>
        </nav>
      </div>
    </header>
  );
}
