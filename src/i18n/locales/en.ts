import type { es } from "./es";

type TranslationShape<T> = {
    [Key in keyof T]: T[Key] extends string ? string : TranslationShape<T[Key]>;
};

export const en = {
    common: {
        appName: "NutriPlan",
        language: "Language",
        systemLanguage: "Automatic",
        spanish: "Español",
        english: "English",
        changeLanguage: "Change language",
        selectLanguage: "Use {{language}}",
        items_one: "{{count}} item",
        items_other: "{{count}} items",
    },
    home: {
        title: "Your meals, planned for the week.",
        description:
            "A clean foundation for weekly planning, verified recipes, and simple shopping.",
        projectStatus: "Project status",
        foundationReady: "Technical foundation ready",
        backendConfigured: "Supabase configured",
        backendMissing: "Supabase configuration missing",
        nextMilestone: "Next milestone",
        nextMilestoneDescription: "Authentication and nutrition onboarding without AI.",
    },
} as const satisfies TranslationShape<typeof es>;
