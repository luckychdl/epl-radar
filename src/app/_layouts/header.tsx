import Image from "next/image";
import styles from '../../styles/layout.module.scss'
import Link from "next/link";
export default function Header() {
  return <div>
    <div className={styles.header}>

<div>

    <Image src={`/symbols/logo.svg`} alt="" width={80} height={80} />
    <p>EPL RADAR</p>
</div>
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/standings">Standings</Link>
      <Link href="/matches">Matches</Link>
      <Link href="/teams">Teams</Link>
      <Link href="/my-teams">My Teams</Link>
      
    </nav>


    </div>
  </div>;
}