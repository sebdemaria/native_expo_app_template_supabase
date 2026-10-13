import { z } from "zod";

const optionalString = z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().optional(),
);
const optionalUrl = z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().url().optional(),
);

const publicEnvSchema = z.object({
    posthogApiKey: optionalString,
    posthogHost: optionalUrl.default("https://us.i.posthog.com"),
    revenueCatAppleApiKey: optionalString,
    revenueCatGoogleApiKey: optionalString,
    supabaseAnonKey: optionalString,
    supabaseUrl: optionalUrl,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export const parsePublicEnv = (values: Record<string, string | undefined>): PublicEnv =>
    publicEnvSchema.parse(values);

export const env = parsePublicEnv({
    posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    revenueCatAppleApiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY,
    revenueCatGoogleApiKey: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
});

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
