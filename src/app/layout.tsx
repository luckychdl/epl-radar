import type { Metadata } from "next";

import "../styles/global.scss";
import Header from "./_components/_layouts/Header/Header";

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
    <html lang="en">
      <body>
        <Header />
        <main>
          <aside />
          {children}
          <aside />
        </main>
      </body>
    </html>
  );
}
