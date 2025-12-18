import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Security rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Code quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",

      // TypeScript specific (via next config)
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "build/",
      "dist/",
      "scripts/",
    ],
  },
];

export default eslintConfig;
