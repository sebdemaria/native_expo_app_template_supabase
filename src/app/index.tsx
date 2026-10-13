import { ScrollView, Text, View } from "react-native";

import { isSupabaseConfigured } from "@/config/env";
import { LanguageSelector } from "@/i18n/language-selector";

import { SafeAreaView } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";

export default function HomeScreen() {
    const { t } = useTranslation("home");
    const backendStatus = isSupabaseConfigured
        ? t("backendConfigured")
        : t("backendMissing");

    return (
        <View className="flex-1 bg-ink-950">
            <SafeAreaView className="flex-1 px-6 py-8">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="mb-auto flex-row items-center justify-between">
                        <Text className="text-sm font-bold uppercase tracking-[3px] text-lime-300">
                            NutriPlan
                        </Text>

                        <View className="h-3 w-3 rounded-full bg-lime-300" />
                    </View>

                    <View className="gap-6 py-12">
                        <Text className="max-w-xl text-5xl font-black leading-[52px] text-stone-50">
                            {t("title")}
                        </Text>

                        <Text className="max-w-lg text-lg leading-7 text-stone-300">
                            {t("description")}
                        </Text>

                        <View className="mt-4 gap-3 rounded-[28px] border border-stone-700 bg-ink-900 p-5">
                            <Text className="text-xs font-bold uppercase tracking-[2px] text-stone-400">
                                {t("projectStatus")}
                            </Text>

                            <Text className="text-xl font-bold text-stone-50">
                                {t("foundationReady")}
                            </Text>

                            <Text className="text-base text-stone-300">
                                {backendStatus}
                            </Text>
                        </View>
                    </View>

                    <View className="gap-2 border-t border-stone-800 pt-5">
                        <Text className="text-sm font-semibold text-lime-300">
                            {t("nextMilestone")}
                        </Text>

                        <Text className="text-base text-stone-300">
                            {t("nextMilestoneDescription")}
                        </Text>

                        <LanguageSelector />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
