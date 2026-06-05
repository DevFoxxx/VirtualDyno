import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import it from './locales/it.json';
import es from './locales/es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
      es: { translation: es}, // Added spanish translation
    },
    lng: 'en', // Default language set to english
    fallbackLng: 'en',  
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;
