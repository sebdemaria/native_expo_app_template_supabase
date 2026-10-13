module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "type-enum": [
            2,
            "always",
            [
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
            ],
        ],
        "scope-case": [2, "always", ["pascal-case", "camel-case", "lower-case"]],
        "subject-case": [0],
        "header-max-length": [2, "always", 350],
        "body-leading-blank": [2, "always"],
        "body-max-line-length": [2, "always", 600],
        "footer-leading-blank": [2, "always"],
    },
    prompt: {
        messages: {
            emptyWarning: "El campo no puede estar vacío",
            upperLimitWarning: "Límite de caracteres excedido",
            lowerLimitWarning: "Mínimo de caracteres no alcanzado",
        },
        questions: {
            type: { description: "Selecciona el tipo de cambio que estás realizando" },
            scope: {
                description:
                    "¿Cuál es el alcance de este cambio? (ej: componente o módulo)",
            },
            subject: { description: "Escribe una descripción corta del cambio" },
            body: {
                description:
                    "Proporciona una descripción más detallada del cambio (opcional)",
            },
        },
    },
    helpUrl:
        "Formato: <tipo>(<scope>): <descripción>\nEjemplo: feat(Onboarding): agregar perfil nutricional\nTipos válidos: feat, fix, docs, style, refactor, perf, test, chore, revert, build, ci",
};
