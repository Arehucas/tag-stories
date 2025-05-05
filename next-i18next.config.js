module.exports = {
  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
    localeDetection: false,
  },
  localePath: './locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}; 