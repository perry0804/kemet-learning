import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '圣域 血与沙 · 视觉学习手册',
  description: '六人各自作战与神祇入场：3D沙盘、战斗演示、流程和五色能力图鉴。',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
