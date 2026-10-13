/** @jest-environment node */
const { describe, expect, test } = require("@jest/globals");
const { ESLint, Linter } = require("eslint");
const tsParser = require("@typescript-eslint/parser");

const eslintConfig = require("../../eslint.config");
const editorSettings = require("../../.vscode/settings.json");
const packageJson = require("../../package.json");
const prettierConfig = require("../../prettier.config");
const commitlintConfig = require("../../commitlint.config.cjs");

describe("TetApp base tooling adapted to NutriPlan", () => {
    test("retains correctness checks and the effective JSX sibling-spacing rule", async () => {
        const configuration = await new ESLint({
            overrideConfigFile: true,
            overrideConfig: eslintConfig,
        }).calculateConfigForFile("src/app/index.tsx");
        for (const rule of [
            "no-unsafe-finally",
            "no-constant-binary-expression",
            "no-fallthrough",
            "no-loss-of-precision",
            "react/jsx-newline",
        ]) {
            expect(configuration.rules[rule][0]).toBe(2);
        }
        expect(configuration.rules["no-undef"][0]).toBe(0);
    });

    test("preserves the requested formatting and NativeWind class sorting", () => {
        expect(prettierConfig).toMatchObject({
            semi: true,
            singleQuote: false,
            tabWidth: 4,
            printWidth: 88,
            singleAttributePerLine: true,
            objectWrap: "preserve",
            plugins: ["prettier-plugin-tailwindcss"],
        });
    });

    test("uses ESLint on save without competing import organizers", () => {
        expect(editorSettings["editor.formatOnSave"]).toBe(true);
        expect(editorSettings["editor.defaultFormatter"]).toBe(
            "esbenp.prettier-vscode",
        );
        expect(editorSettings["editor.codeActionsOnSave"]).toMatchObject({
            "source.fixAll.eslint": "explicit",
            "source.organizeImports": "never",
            "source.sortMembers": "never",
        });
        expect(editorSettings["eslint.validate"]).toEqual(
            expect.arrayContaining(["typescript", "typescriptreact"]),
        );
    });

    test("sorts TypeScript imports into the requested groups idempotently", () => {
        const importConfig = eslintConfig.find(
            (entry) => entry.plugins?.["simple-import-sort"],
        );
        const linter = new Linter();
        const config = [
            {
                files: ["**/*.ts"],
                languageOptions: { parser: tsParser },
                plugins: importConfig.plugins,
                rules: {
                    "simple-import-sort/imports":
                        importConfig.rules["simple-import-sort/imports"],
                },
            },
        ];
        const input = [
            'import { helper } from "./helper";',
            'import { z } from "zod";',
            'import { client } from "@/lib/client";',
            'import { theme } from "@/styles/theme";',
            'import { useState } from "react";',
            'import { store } from "@/store/preferences-store";',
            'import type { Recipe } from "@/domain/recipe";',
            'import { View, type ViewProps } from "react-native";',
            'import { Button } from "@/components/button";',
            'import "@/global.css";',
            "",
        ].join("\n");
        const result = linter.verifyAndFix(input, config, { filename: "fixture.ts" });
        expect(result.messages).toEqual([]);

        const orderedGroups = [
            'import "@/global.css";',
            'from "@/components/button";',
            'from "react-native";',
            'from "@/domain/recipe";',
            'from "@/store/preferences-store";',
            'from "react";',
            'from "@/styles/theme";',
            'from "zod";',
            'from "@/lib/client";',
            'from "./helper";',
        ];
        const positions = orderedGroups.map((group) => result.output.indexOf(group));
        expect(positions.every((position) => position >= 0)).toBe(true);
        expect(positions).toEqual([...positions].sort((a, b) => a - b));
        expect(
            linter.verifyAndFix(result.output, config, { filename: "fixture.ts" })
                .fixed,
        ).toBe(false);
    });

    test("includes TypeScript staged checks and conventional commit limits", () => {
        expect(packageJson["lint-staged"]["*.{js,jsx,cjs,mjs,ts,tsx}"]).toEqual([
            "eslint --fix --no-warn-ignored",
            "prettier --write",
        ]);
        expect(packageJson.scripts.prepare).toBe("husky");
        expect(commitlintConfig.rules["header-max-length"]).toEqual([2, "always", 350]);
        expect(commitlintConfig.rules["body-max-line-length"]).toEqual([
            2,
            "always",
            600,
        ]);
        expect(commitlintConfig.rules["type-enum"][2]).toEqual([
            "feat",
            "fix",
            "docs",
            "style",
            "refactor",
            "perf",
            "test",
            "chore",
            "revert",
            "build",
            "ci",
        ]);
    });
});
