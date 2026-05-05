import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/feedback/toast-provider";
import { BackgroundManager } from "@/components/layout/background-manager";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "个人学习工作区",
  description: "面向个人长期备考使用的学习效率工具"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${playfair.variable} relative min-h-screen font-sans text-stone-800 antialiased dark:text-stone-200`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <BackgroundManager />
          <Sidebar />

          <div className="flex min-h-screen flex-col lg:ml-[88px]">
            <TopBar />
            <main className="page-transition flex-1 pb-20 lg:pb-0">{children}</main>
          </div>

          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
