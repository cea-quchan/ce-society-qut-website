module.exports = {
    i18n: {
        defaultLocale: 'fa',
        locales: ['fa', 'en'],
    },
    defaultNS: 'common',
    localePath: './public/locales',
    reloadOnPrerender: process.env.NODE_ENV === 'development',
    debug: process.env.NODE_ENV === 'development',
}