import { describe, expect, it } from "@jest/globals";

import { parsePublicEnv } from "./env";

describe("parsePublicEnv", () => {
    it("normalizes empty optional values", () => {
        expect(
            parsePublicEnv({
                posthogApiKey: "",
                supabaseAnonKey: "  ",
                supabaseUrl: undefined,
            }),
        ).toMatchObject({
            posthogApiKey: undefined,
            posthogHost: "https://us.i.posthog.com",
            supabaseAnonKey: undefined,
            supabaseUrl: undefined,
        });
    });

    it("rejects malformed service URLs", () => {
        expect(() => parsePublicEnv({ supabaseUrl: "not-a-url" })).toThrow();
    });
});
