import "@/global.css";

import { useColorScheme } from "react-native";

import { AppProviders } from "@/providers/app-providers";

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <AppProviders>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                <Stack screenOptions={{ headerShown: false }} />
            </ThemeProvider>
        </AppProviders>
    );
}
