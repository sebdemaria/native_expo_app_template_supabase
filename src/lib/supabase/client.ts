import "react-native-url-polyfill/auto";

import { env } from "@/config/env";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    if (!env.supabaseUrl || !env.supabaseAnonKey) {
        throw new Error(
            "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
        );
    }

    client ??= createClient(env.supabaseUrl, env.supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            detectSessionInUrl: false,
            persistSession: true,
            storage: AsyncStorage,
        },
    });

    return client;
}
