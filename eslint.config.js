const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".env*",
      "*.config.js",
      "*.config.mjs",
      "generated/**",
      "docker/**",
      "__tests__/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "prisma/seed.js",
      "scripts/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Relax TypeScript rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",

      // Essential rules only
      "no-unreachable": "error",
      "prefer-const": "warn",
      "no-var": "error",
      "no-console": "off",

      // React rules relaxed
      "react/no-unescaped-entities": "warn",

      // Next.js specific relaxed rules
      "@next/next/no-img-element": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
