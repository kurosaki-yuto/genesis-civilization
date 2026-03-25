import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GENESIS — 関西の地図",
  description: "名前・目標・創造主を入れて、関西で光の人々が働く様子を眺める",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
