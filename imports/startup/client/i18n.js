import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import englishTranslate from "../../translate/en/translation.json";
import spanishTranslate from "../../translate/es-419/translation.json";

const resources = {
  en: {
    translation: englishTranslate
  },
  es: {
    translation: spanishTranslate
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "es-419", 

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;
