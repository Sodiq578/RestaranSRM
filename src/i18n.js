import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    uz: {
      translation: {
        home: "Bosh sahifa",
        reports: "Hisobotlar",
        admin: "Admin",
        login: "Kirish",
      },
    },
    ru: {
      translation: {
        home: "Главная",
        reports: "Отчеты",
        admin: "Админ",
        login: "Вход",
      },
    },
    en: {
      translation: {
        home: "Home",
        reports: "Reports",
        admin: "Admin",
        login: "Login",
      },
    },
  },
  lng: "uz",
  fallbackLng: "uz",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;