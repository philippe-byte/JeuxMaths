import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import it from './locales/it.json';
import de from './locales/de.json';
import pt from './locales/pt.json';

const CUSTOM_LANGS_KEY = 'jeuxmaths_custom_langs';

const getCustomLanguages = () => {
  const stored = localStorage.getItem(CUSTOM_LANGS_KEY);
  return stored ? JSON.parse(stored) : {};
};

const resources: any = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  it: { translation: it },
  de: { translation: de },
  pt: { translation: pt },
};

// Load custom languages from localStorage
const customLangs = getCustomLanguages();
Object.keys(customLangs).forEach(code => {
  resources[code] = { translation: customLangs[code].translations };
});

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'fr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const addCustomLanguage = (code: string, name: string, translations: any) => {
  const customLangs = getCustomLanguages();
  customLangs[code] = { name, translations };
  localStorage.setItem(CUSTOM_LANGS_KEY, JSON.stringify(customLangs));

  i18n.addResourceBundle(code, 'translation', translations, true, true);
};

export const getAvailableLanguages = () => {
  const base = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' }
  ];
  const custom = getCustomLanguages();
  const customList = Object.keys(custom).map(code => ({
    code,
    name: custom[code].name
  }));
  return [...base, ...customList];
};

export default i18n;
