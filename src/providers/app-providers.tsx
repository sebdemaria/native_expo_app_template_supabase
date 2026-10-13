import { AppState, type AppStateStatus, Platform } from "react-native";

import { LocalizationProvider } from "@/i18n/provider";

import { type PropsWithChildren, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
    focusManager,
    onlineManager,
    QueryClientProvider,
} from "@tanstack/react-query";
import * as Network from "expo-network";

import { queryClient } from "@/lib/query/query-client";

const handleAppStateChange = (status: AppStateStatus) => {
    if (Platform.OS !== "web") focusManager.setFocused(status === "active");
};

export function AppProviders({ children }: PropsWithChildren) {
    useEffect(() => {
        const appStateSubscription = AppState.addEventListener(
            "change",
            handleAppStateChange,
        );
        const networkSubscription = Network.addNetworkStateListener((state) => {
            onlineManager.setOnline(Boolean(state.isConnected));
        });

        Network.getNetworkStateAsync()
            .then((state) => onlineManager.setOnline(Boolean(state.isConnected)))
            .catch(() => {});

        return () => {
            appStateSubscription.remove();
            networkSubscription.remove();
        };
    }, []);

    return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                <LocalizationProvider>{children}</LocalizationProvider>
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}
