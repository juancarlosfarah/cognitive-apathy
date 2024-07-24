import i18n from 'i18next';
import enTranslation from '../assets/locales/en/ns1.json';
import frTranslation from '../assets/locales/fr/ns1.json';
// Initialize i18next
i18n
    .init({
    resources: {
        en: {
            translation: enTranslation,
        },
        fr: {
            translation: frTranslation,
        },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false, // React already does escaping
    },
});
export default i18n;
