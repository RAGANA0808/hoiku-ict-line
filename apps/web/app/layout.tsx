import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '保育ICT',
  description: '認定こども園せんだん幼稚園 保育ICTシステム',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
