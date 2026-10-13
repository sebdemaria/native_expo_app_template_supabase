import { describe, expect, test } from "@jest/globals";

import { createAppI18n } from "./instance";
import { normalizeLocale, resolveLocale } from "./locale";
import { en } from "./locales/en";
import { es } from "./locales/es";

const keys = (value: Record<string, unknown>, prefix = ""): string[] =>
    Object.entries(value).flatMap(([key, entry]) =>
        typeof entry === "object" && entry !== null
            ? keys(entry as Record<string, unknown>, `${prefix}${key}.`)
            : [`${prefix}${key}`],
    );

describe("NutriPlan localization", () => {
    test("has the same keys and interpolation variables in both languages", () => {
        expect(keys(en).sort()).toEqual(keys(es).sort());
        for (const namespace of ["common", "home"] as const) {
            for (const [key, value] of Object.entries(es[namespace])) {
                const translated = (en[namespace] as Record<string, string>)[key];
                expect(translated.trim()).not.toBe("");
                expect(translated.match(/{{\w+}}/g) ?? []).toEqual(
                    value.match(/{{\w+}}/g) ?? [],
                );
            }
        }
    });

    test("normalizes regional and underscore locale tags", () => {
        expect(normalizeLocale("es-AR")).toBe("es");
        expect(normalizeLocale("EN_us")).toBe("en");
        expect(normalizeLocale("fr-FR")).toBeNull();
    });

    test("resolves device preferences with a Spanish fallback", () => {
        expect(resolveLocale("system", ["en-GB"])).toBe("en");
        expect(resolveLocale("system", ["fr-FR", "es-MX"])).toBe("es");
        expect(resolveLocale("system", ["fr-FR"])).toBe("es");
        expect(resolveLocale("system", [])).toBe("es");
    });

    test("explicit choice overrides the device", () => {
        expect(resolveLocale("es", ["en-US"])).toBe("es");
        expect(resolveLocale("en", ["es-AR"])).toBe("en");
    });

    test("translates namespaces and interpolation", () => {
        const instance = createAppI18n("en");
        expect(instance.t("home:foundationReady")).toBe("Technical foundation ready");
        expect(instance.t("selectLanguage", { language: "Español" })).toBe(
            "Use Español",
        );
    });

    test("supports singular, plural and zero", () => {
        const instance = createAppI18n("es");
        expect(instance.t("items", { count: 1 })).toBe("1 elemento");
        expect(instance.t("items", { count: 2 })).toBe("2 elementos");
        expect(instance.t("items", { count: 0 })).toBe("0 elementos");
    });

    test("falls back to Spanish if an English translation is missing", () => {
        const instance = createAppI18n("en");
        instance.removeResourceBundle("en", "home");
        expect(instance.t("home:title")).toBe(es.home.title);
    });

    test("independent instances cannot change each other's language", async () => {
        const ui = createAppI18n("en");
        const background = createAppI18n("es");
        await background.changeLanguage("en");
        await background.changeLanguage("es");
        expect(ui.language).toBe("en");
    });
});
