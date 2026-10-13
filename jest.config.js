module.exports = {
    preset: "jest-expo",
    maxWorkers: 1,
    moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "cjs", "mjs"],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/.expo/",
        "/android/",
        "/ios/",
        "/dist/",
        "/build/",
    ],
    moduleNameMapper: {
        "^@/assets/(.*)$": "<rootDir>/assets/$1",
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts",
        "!src/lib/supabase/database.types.ts",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
};
