import { usePreferencesStore } from "@/store/preferences-store";
import { type PropsWithChildren, useEffect, useState } from "react";

import { useLocales } from "expo-localization";
import { I18nextProvider } from "react-i18next";

import { createAppI18n } from "./instance";
import { resolveLocale } from "./locale";

export function LocalizationProvider({ children }: PropsWithChildren) {
    const preference = usePreferencesStore((state) => state.locale);
    const deviceLocales = useLocales();
    const locale = resolveLocale(
        preference,
        deviceLocales.map((entry) => entry.languageTag),
    );
    const [instance] = useState(() => createAppI18n(locale));

    useEffect(() => {
        if (instance.language !== locale) void instance.changeLanguage(locale);
    }, [instance, locale]);

    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
