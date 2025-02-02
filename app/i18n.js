import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import it from './locales/it.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
    },
    lng: 'it',  // Lingua predefinita
    fallbackLng: 'it',  // Lingua di fallback
    interpolation: {
      escapeValue: false, // React già gestisce l'escape
    },
  });

export default i18n;
