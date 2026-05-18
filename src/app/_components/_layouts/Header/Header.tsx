import Image from "next/image";
import styles from "./Header.module.scss";
import Link from "next/link";
export default function Header() {
  return (
    <header className={styles.header}>
      <Link href={`/`}>
        <button>
          <Image
            src={`/symbols/logo.png`}
            alt="EPL RADAR"
            width={120}
            height={80}
          />
        </button>
      </Link>
    </header>
  );
}
