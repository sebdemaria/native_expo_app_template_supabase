import { isLocalePreference, type LocalePreference } from "@/i18n/locale";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ColorSchemePreference = "dark" | "light" | "system";

type PreferencesState = {
    colorScheme: ColorSchemePreference;
    locale: LocalePreference;
    setColorScheme: (colorScheme: ColorSchemePreference) => void;
    setLocale: (locale: PreferencesState["locale"]) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            colorScheme: "system",
            locale: "system",
            setColorScheme: (colorScheme) => set({ colorScheme }),
            setLocale: (locale) => {
                if (isLocalePreference(locale)) set({ locale });
            },
        }),
        {
            name: "nutriplan-preferences",
            storage: createJSONStorage(() => AsyncStorage),
            version: 1,
            partialize: (state) => ({
                colorScheme: state.colorScheme,
                locale: state.locale,
            }),
            merge: (persisted, current) => {
                const saved = persisted as Partial<PreferencesState> | undefined;
                return {
                    ...current,
                    colorScheme:
                        saved?.colorScheme === "system" ||
                        saved?.colorScheme === "light" ||
                        saved?.colorScheme === "dark"
                            ? saved.colorScheme
                            : current.colorScheme,
                    locale: isLocalePreference(saved?.locale) ? saved.locale : "system",
                };
            },
        },
    ),
);
