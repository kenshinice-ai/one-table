export const supportedLocales = ['zh-CN', 'en-AU'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

