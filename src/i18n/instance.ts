import { createInstance } from "i18next";

import { type AppLocale, fallbackLocale, supportedLocales } from "./locale";
import { en } from "./locales/en";
import { es } from "./locales/es";

export const resources = { es, en };

// Independent instances let background tasks translate without changing the UI locale.
export function createAppI18n(locale: AppLocale) {
    const instance = createInstance();
    void instance.init({
        resources: {
            es: { common: { ...es.common }, home: { ...es.home } },
            en: { common: { ...en.common }, home: { ...en.home } },
        },
        lng: locale,
        fallbackLng: fallbackLocale,
        supportedLngs: [...supportedLocales],
        defaultNS: "common",
        ns: ["common", "home"],
        initAsync: false,
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    });
    return instance;
}
