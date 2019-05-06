import { setCookie, getCookie } from '@/assets/javaScript/cookies';
import defaultLanguage from '@/assets/javaScript/en';

const savedLanguages = new Map();
savedLanguages.set('en', defaultLanguage);

declare const LANGUAGE: any;

export default {
  namespaced: true,
  state: {
    savedLanguages: savedLanguages,
    currentLanguage: 'en',
    strings: defaultLanguage.strings,
  },
  mutations: {
    
  },
  actions: {
    setLanguage({ state, commit }: any, lang: string) {
      return new Promise((resolve) => {
        if (lang === '' || lang === 'en') {
          state.currentLanguage = 'en';
          state.strings = state.savedLanguages.get('en');
          setCookie('watchrLanguage', 'en', 365);
          resolve();
        } else if (state.savedLanguages.has(lang)) {
          state.currentLanguage = lang;
          state.strings = state.savedLanguages.get(lang);
          setCookie('watchrLanguage', lang, 365);
          resolve();
        } else {
          const scr = document.createElement('script');
          scr.setAttribute('id', lang);
          scr.setAttribute('type', 'text/javascript');
          scr.setAttribute('src', `/assets/langs/${lang}.js`);
          scr.onload = () => {
            state.currentLanguage = lang;
            state.strings = LANGUAGE.strings;
            setCookie('watchrLanguage', lang, 365);
            state.savedLanguages.set(lang, LANGUAGE);
            resolve();
          };
          document.getElementsByTagName('head')[0].appendChild(scr);
          }
      });
    },
  },
};
