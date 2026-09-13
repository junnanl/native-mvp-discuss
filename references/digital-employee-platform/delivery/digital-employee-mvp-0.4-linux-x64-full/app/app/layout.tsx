import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '数字员工广场 | Evo-Harness MVP',
  description: 'StaffDeck 风格的 Evo-Harness 数字员工交互 MVP',
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
