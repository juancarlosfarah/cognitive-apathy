import i18n from 'i18next';
import enTranslation from '../assets/locales/en/ns1.json';
import frTranslation from '../assets/locales/fr/ns1.json';
import { getQueryParam } from './utils';
// Initialize i18next
const language = getQueryParam('lang') || 'en'; // Default to 'en' if not specified
console.log('hello');
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
    lng: language, // Default language
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false, // React already does escaping
    },
});
export default i18n;
//# sourceMappingURL=i18n.js.map