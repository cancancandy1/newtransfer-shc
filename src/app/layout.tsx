import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Inter } from 'next/font/google'


const notoSansThai = Noto_Sans_Thai({ subsets: ["latin"] });
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "SHC Transfer - ระบบสมัครสมาชิก",
  description: "ระบบสมัครสมาชิก SHC Transfer",
  icons: {
    icon: "/SHC_Logo.svg",
    shortcut: "/SHC_Logo.svg",
    apple: "/SHC_Logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
      </head>
      <body className={notoSansThai.className}>{children}</body>
    </html>
  );
}
