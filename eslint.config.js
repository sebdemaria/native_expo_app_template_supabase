const { defineConfig } = require("eslint/config");
const js = require("@eslint/js");
const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier/flat");
const simpleImportSort = require("eslint-plugin-simple-import-sort");

module.exports = defineConfig([
    js.configs.recommended,
    ...expoConfig,
    {
        ignores: [
            "node_modules/**",
            ".expo/**",
            "dist/**",
            "build/**",
            "coverage/**",
            "ios/**",
            "android/**",
            ".husky/_/**",
            "supabase/.temp/**",
        ],
    },
    {
        files: ["**/*.{js,jsx,cjs,mjs,ts,tsx}"],
        plugins: { "simple-import-sort": simpleImportSort },
        rules: {
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        ["^\\u0000"],
                        [
                            "^@/(?:components|screens|navigation)(?:$|/)",
                            "^@/features/.*/(?:components|screens)(?:$|/)",
                            "^react-native(?:$|\\u0000)",
                        ],
                        ["^@/(?:config|constants|consts|i18n|utils|domain)(?:$|/)"],
                        [
                            "^@/(?:hooks|store|providers)(?:$|/)",
                            "^react(?:$|\\u0000)",
                            "^react-native-safe-area-context(?:$|\\u0000)",
                            "^zustand/react/shallow(?:$|\\u0000)",
                            "^\\./use",
                        ],
                        ["^@/styles(?:$|/)"],
                        ["^@?\\w"],
                        ["^@/"],
                        ["^\\."],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",
            "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
            "no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    args: "after-used",
                    ignoreRestSiblings: true,
                    varsIgnorePattern: "^(_|React$)",
                    argsIgnorePattern: "^_",
                },
            ],
            "no-async-promise-executor": "error",
            "require-await": "warn",
            "no-debugger": "error",
            "no-unreachable": "error",
            "no-constant-condition": "error",
            "no-empty": ["warn", { allowEmptyCatch: true }],
            eqeqeq: ["error", "always", { null: "ignore" }],
            "no-var": "error",
            "prefer-const": "warn",
            "no-useless-return": "warn",
            "no-console": ["warn", { allow: ["error", "log"] }],
            "no-shadow": "warn",
            "no-use-before-define": [
                "error",
                { functions: false, classes: true, variables: false },
            ],
            "react/jsx-newline": ["error", { prevent: true, allowMultilines: true }],
            "react/jsx-no-undef": "error",
            "react/no-unknown-property": ["error", { ignore: ["className"] }],
            "react/prop-types": "off",
            "react/display-name": "off",
            "react/react-in-jsx-scope": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        rules: {
            "no-undef": "off",
            "no-unused-vars": "off",
            "no-shadow": "off",
            "no-use-before-define": "off",
            "@typescript-eslint/no-shadow": "warn",
            "@typescript-eslint/no-use-before-define": [
                "error",
                { functions: false, classes: true, variables: false },
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    args: "after-used",
                    ignoreRestSiblings: true,
                    varsIgnorePattern: "^(_|React$)",
                    argsIgnorePattern: "^_",
                },
            ],
        },
    },
    eslintConfigPrettier,
    {
        files: ["**/*.{jsx,tsx}"],
        // Preserve the explicit TetApp JSX sibling-spacing policy after Prettier compatibility rules.
        rules: {
            "react/jsx-newline": ["error", { prevent: true, allowMultilines: true }],
        },
    },
]);
