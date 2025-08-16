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
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn', // error -> warn
      '@typescript-eslint/no-explicit-any': 'warn', // error -> warn
      'react-hooks/exhaustive-deps': 'warn', // error -> warn
      '@next/next/no-img-element': 'warn', // error -> warn
    }
  }
];

export default eslintConfig;
