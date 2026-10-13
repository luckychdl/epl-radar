"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./HeaderNav.module.scss";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/my-teams", label: "My Teams" },
  { href: "/predictions", label: "Predictions" },
  { href: "/news", label: "News" },
  { href: "/budget", label: "Budget" },
] as const;

/** 리그·팀 상세는 어느 메뉴에도 속하지 않으므로 홈은 정확히 "/" 일 때만 켠다. */
function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.headerNav}>
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={current ? styles.current : undefined}
            aria-current={current ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
