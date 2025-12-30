import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './en.json';
import si from './si.json';
import ta from './ta.json';

// Initialize i18n
export const initI18n = async (): Promise<void> => {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        si: { translation: si },
        ta: { translation: ta },
      },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
};

export const changeLanguage = async (lng: string): Promise<void> => {
  await i18n.changeLanguage(lng);
};

export default i18n;