import type { Metadata } from "next";

import "../styles/global.scss";
import Header from "./_components/_layouts/Header/Header";
import QueryProvider from "./_components/_commons/QueryProvider";

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
        <QueryProvider>
          <Header />
          <main>
            <aside />
            {children}
            <aside />
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
