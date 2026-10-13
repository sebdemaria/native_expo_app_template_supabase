export const supportedLocales = ["es", "en"] as const;
export type AppLocale = (typeof supportedLocales)[number];
export type LocalePreference = AppLocale | "system";
export const fallbackLocale: AppLocale = "es";

export function normalizeLocale(value: string | null | undefined): AppLocale | null {
    const language = value?.trim().toLowerCase().split(/[-_]/)[0];
    return supportedLocales.find((locale) => locale === language) ?? null;
}

export function isLocalePreference(value: unknown): value is LocalePreference {
    return value === "system" || value === "es" || value === "en";
}

export function resolveLocale(
    preference: LocalePreference,
    deviceLocales: readonly string[],
): AppLocale {
    if (preference !== "system") return preference;

    for (const languageTag of deviceLocales) {
        const locale = normalizeLocale(languageTag);
        if (locale) return locale;
    }

    return fallbackLocale;
}
