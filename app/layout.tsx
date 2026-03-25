import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GENESIS — 文明創世シミュレータ",
  description: "あなたの文明を、ゼロから創れ",
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
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;600;800;900&family=Inter:wght@300;400;600;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
