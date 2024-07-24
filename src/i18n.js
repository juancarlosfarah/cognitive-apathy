"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const ns1_json_1 = __importDefault(require("../assets/locales/en/ns1.json"));
const ns1_json_2 = __importDefault(require("../assets/locales/fr/ns1.json"));
// Initialize i18next
i18next_1.default
    .init({
    resources: {
        en: {
            translation: ns1_json_1.default,
        },
        fr: {
            translation: ns1_json_2.default,
        },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false, // React already does escaping
    },
});
exports.default = i18next_1.default;
