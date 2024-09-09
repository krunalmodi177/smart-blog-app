import * as i18n from 'i18n';
import {join} from 'path';

i18n.configure({
    locales: ['en', 'es', 'fr'], // List of supported languages
    directory: join(__dirname + '/locales'), // Path to the translation files
    defaultLocale: 'en',
    autoReload: true,
    updateFiles: true,
    syncFiles: true,
});

export default i18n;