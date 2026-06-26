import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSiteSetting } from "@/lib/queries";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSiteSetting();
  const title = setting?.siteName ?? "AI 导航";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: title, template: `%s | ${title}` },
    description: setting?.siteDescription ?? "发现实用的 AI 工具",
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
