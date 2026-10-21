import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

/** Supported UI languages. English is the baseline (FD v1.1 Localization). */
export const SUPPORTED_LANGUAGES = ['en'] as const;

export const resources = { en: { translation: en } } as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
