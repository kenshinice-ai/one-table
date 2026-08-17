import type { MetadataRoute } from 'next';

/**
 * Installing the planner is genuinely useful: the shopping list is read in a
 * supermarket, which is exactly where signal is worst. Everything the app needs
 * is static and content-hashed, so the offline copy is always a coherent one.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '一桌 · One Table',
    short_name: '一桌',
    description: '为一桌人，配一桌好菜。',
    start_url: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#fffaf2',
    theme_color: '#d96b45',
    lang: 'zh-CN',
    categories: ['food', 'lifestyle', 'utilities'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
