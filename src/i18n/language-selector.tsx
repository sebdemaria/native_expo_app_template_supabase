import { Pressable, Text, View } from "react-native";

import { usePreferencesStore } from "@/store/preferences-store";

import { useTranslation } from "react-i18next";

import type { LocalePreference } from "./locale";

const options = [
    { value: "system", label: "systemLanguage" },
    { value: "es", label: "spanish" },
    { value: "en", label: "english" },
] as const;

export function LanguageSelector() {
    const { t } = useTranslation("common");
    const locale = usePreferencesStore((state) => state.locale);
    const setLocale = usePreferencesStore((state) => state.setLocale);

    const select = (value: LocalePreference) => setLocale(value);

    return (
        <View className="gap-3">
            <Text className="text-sm font-semibold text-stone-300">
                {t("language")}
            </Text>

            <View className="flex-row flex-wrap gap-2">
                {options.map((option) => (
                    <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        accessibilityLabel={t("selectLanguage", {
                            language: t(option.label),
                        })}
                        accessibilityState={{ selected: locale === option.value }}
                        onPress={() => select(option.value)}
                        className={
                            locale === option.value
                                ? "rounded-full bg-lime-300 px-4 py-3"
                                : "rounded-full border border-stone-600 px-4 py-3"
                        }
                    >
                        <Text
                            className={
                                locale === option.value
                                    ? "font-semibold text-ink-950"
                                    : "font-semibold text-stone-50"
                            }
                        >
                            {t(option.label)}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}
