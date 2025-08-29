const nextPlugin = require("@next/eslint-plugin-next");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const jsxA11yPlugin = require("eslint-plugin-jsx-a11y");
const importPlugin = require("eslint-plugin-import");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");

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
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
    },
    rules: {
      // Next.js rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      
      // React rules
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      
      // Basic jsx-a11y rules
      "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      
      // Import rules
      "import/no-anonymous-default-export": "warn",
      
      // Custom rule overrides
      "react/react-in-jsx-scope": "off", // Not needed with Next.js
      "react/prop-types": "off", // Using TypeScript
      "react/no-unknown-property": "off", // Next.js handles this
      "react/jsx-no-target-blank": "off",
      "react/no-unescaped-entities": "warn",
      
      // Next.js specific relaxed rules
      "@next/next/no-img-element": "warn",
      "react-hooks/exhaustive-deps": "warn",
      
      // Essential rules only
      "no-unreachable": "error",
      "prefer-const": "warn",
      "no-var": "error",
      "no-console": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".mts", ".cts", ".tsx", ".d.ts"],
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        // Node globals
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // TypeScript rules - relaxed as per your current config
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
];
