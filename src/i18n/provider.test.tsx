import { Text } from "react-native";

import { usePreferencesStore } from "@/store/preferences-store";

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { useTranslation } from "react-i18next";

import { LanguageSelector } from "./language-selector";
import { LocalizationProvider } from "./provider";

jest.mock("@react-native-async-storage/async-storage", () => {
    // This factory is hoisted before imports; load Jest locally rather than using an uninitialized import.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { jest: mockJest } = require("@jest/globals");
    return mockJest.requireActual(
        "@react-native-async-storage/async-storage/jest/async-storage-mock",
    );
});
jest.mock("expo-localization", () => ({
    useLocales: () => [{ languageTag: "en-US" }],
}));

function Probe() {
    const { t } = useTranslation("home");
    return <Text>{t("foundationReady")}</Text>;
}

describe("LocalizationProvider and stored preference", () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
        usePreferencesStore.setState({ locale: "system" });
    });

    test("uses the device language and reacts to preference changes", async () => {
        const screen = await render(
            <LocalizationProvider>
                <Probe />
            </LocalizationProvider>,
        );
        expect(screen.getByText("Technical foundation ready")).toBeTruthy();
        await act(() => usePreferencesStore.getState().setLocale("es"));
        await waitFor(() =>
            expect(screen.getByText("Fundación técnica lista")).toBeTruthy(),
        );
        await act(() => usePreferencesStore.getState().setLocale("system"));
        await waitFor(() =>
            expect(screen.getByText("Technical foundation ready")).toBeTruthy(),
        );
    });

    test("persists and restores explicit language choices", async () => {
        usePreferencesStore.getState().setLocale("es");
        await waitFor(async () => {
            expect(
                JSON.parse((await AsyncStorage.getItem("nutriplan-preferences"))!).state
                    .locale,
            ).toBe("es");
        });
        const saved = await AsyncStorage.getItem("nutriplan-preferences");
        usePreferencesStore.getState().setLocale("en");
        await AsyncStorage.setItem("nutriplan-preferences", saved!);
        await act(async () => {
            await usePreferencesStore.persist.rehydrate();
        });
        expect(usePreferencesStore.getState().locale).toBe("es");
    });

    test("the language selector changes the screen without restarting", async () => {
        const screen = await render(
            <LocalizationProvider>
                <Probe />
                <LanguageSelector />
            </LocalizationProvider>,
        );
        await fireEvent.press(screen.getByRole("button", { name: "Use Español" }));
        await waitFor(() =>
            expect(screen.getByText("Fundación técnica lista")).toBeTruthy(),
        );
        expect(
            screen.getByRole("button", { name: "Usar Español" }).props
                .accessibilityState.selected,
        ).toBe(true);
    });

    test("invalid stored locales cannot break translation lookup", async () => {
        await AsyncStorage.setItem(
            "nutriplan-preferences",
            JSON.stringify({
                version: 1,
                state: { locale: "fr", colorScheme: "invalid" },
            }),
        );
        await act(async () => {
            await usePreferencesStore.persist.rehydrate();
        });
        expect(usePreferencesStore.getState().locale).toBe("system");
        expect(usePreferencesStore.getState().colorScheme).toBe("system");
    });
});
