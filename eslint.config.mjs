import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.config({
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-this-alias": "off",
      "no-undef": "warn",
      "no-unused-vars": "warn",
    },
  }),
  ...compat.config({
    files: ["prisma/**/*.ts", "scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  }),
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.prisma/**",
      "**/prisma/generated/**",
      "**/prisma/client/**",
      "**/@prisma/client/**",
    ],
  },

];

export default eslintConfig;
