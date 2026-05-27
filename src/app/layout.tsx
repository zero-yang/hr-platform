import type { Metadata } from "next";
import "./styles.scss";
import { AppProviders } from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "HR 简历筛选平台",
  description: "基于岗位评分标准的简历批量筛选工具"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
