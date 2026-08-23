import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { ServiceWorkerRegistration } from '@/components/service-worker';
import type { TenantConfig } from '@/domain/venue';
import manifest from '@/generated/catalogue-manifest.json';
import tenantConfig from '@/generated/tenant-config.json';

import './globals.css';

const description =
  '为一桌人，配一桌好菜。选择人数、预算、菜单结构与健康目标，立即得到一桌可执行的双语菜单。 · Plan a whole table: set guests, budget, courses and an energy target, and get a menu you can actually cook.';

/** Compiled in at build time, so the tag is right on the very first byte. */
const unlisted = (tenantConfig as TenantConfig | null)?.unlisted === true;

export const metadata: Metadata = {
  metadataBase: new URL('https://onetable.pwestudio.site'),
  // An unlisted build carries a venue's name without their agreement; it is
  // for the person holding the link, not for a search result.
  robots: unlisted ? { index: false, follow: false, nocache: true } : undefined,
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
  appleWebApp: {
    capable: true,
    title: '一桌',
    statusBarStyle: 'default',
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
    // The kiosk flag below is stamped on this element before React loads, which
    // React would otherwise report as markup that changed under it.
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/*
          Both catalogue payloads start downloading alongside the JavaScript
          rather than waiting for hydration, so every interaction the reader can
          reach is already backed by local data. They are content-hashed and
          cached indefinitely.
        */}
        <link as="fetch" crossOrigin="anonymous" href={manifest.planning} rel="preload" />
        <link as="fetch" crossOrigin="anonymous" href={manifest.details} rel="preload" />
        {/*
          Kiosk chrome is pure CSS hanging off this attribute, so it has to be
          set before the first paint: a shop window that rearranged itself a
          second after waking would look broken to the person standing at it.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(new URLSearchParams(location.search).get('kiosk')==='1'){document.documentElement.dataset.kiosk='1'}}catch(e){}",
          }}
        />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
