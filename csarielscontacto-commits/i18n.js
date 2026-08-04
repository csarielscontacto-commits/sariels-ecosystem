import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      "welcome": "Bienvenido a tu ecosistema",
      "greeting": "Hola, ¿cómo estás?",
      "menu_home": "Inicio",
      "menu_profile": "Perfil",
      "language_selector": "Idioma:"
    }
  },
  en: {
    translation: {
      "welcome": "Welcome to your ecosystem",
      "greeting": "Hello, how are you?",
      "menu_home": "Home",
      "menu_profile": "Profile",
      "language_selector": "Language:"
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue dans votre écosystème",
      "greeting": "Bonjour, comment ça va?",
      "menu_home": "Accueil",
      "menu_profile": "Profil",
      "language_selector": "Langue:"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  interpolation: { escapeValue: false }
});

export default i18n;