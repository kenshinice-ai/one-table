import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

const description =
  '为一桌人，配一桌好菜。选择人数、预算、菜单结构与健康目标，从 400 道双语菜谱中组合出可执行的一桌菜。 · Plan a whole table: set guests, budget, courses and an energy target, then compose a menu from 400 bilingual recipes.';

export const metadata: Metadata = {
  metadataBase: new URL('https://menu-planning-companion.lee-liu-melbourne.workers.dev'),
  title: '一桌 · One Table',
  description,
  applicationName: 'One Table',
  alternates: {
    languages: {
      'zh-CN': '/',
      'en-AU': '/',
    },
  },
  openGraph: {
    type: 'website',
    title: '一桌 · One Table',
    description,
    siteName: 'One Table',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '一桌 · One Table' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '一桌 · One Table',
    description,
    images: ['/og-image.png'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#d96b45',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
