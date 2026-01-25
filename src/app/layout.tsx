import type { Metadata } from "next";
import Header from "./_layouts/header";

import '../styles/global.scss'


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
        {children}
      </body>
    </html>
  );
}
