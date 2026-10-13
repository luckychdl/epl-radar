import type { Metadata } from "next";
import { Archivo } from "next/font/google";

import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "../styles/global.scss";
import Header from "./_components/_layouts/Header/Header";
import QueryProvider from "./_components/_commons/QueryProvider";
import ModalRoot from "./_components/_commons/ModalRoot/ModalRoot";

// 폭 축(wdth)을 같이 받아야 스코어 숫자를 좁게 조여 쓸 수 있다.
const displayFont = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EPL Radar",
  description: "Premier League",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={displayFont.variable}>
      <body>
        <QueryProvider>
          <Header />
          <main>{children}</main>
          <ModalRoot />
        </QueryProvider>
      </body>
    </html>
  );
}
