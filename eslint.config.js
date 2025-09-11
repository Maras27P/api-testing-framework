import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  // Podstawowa konfiguracja JavaScript
  js.configs.recommended,

  {
    // Pliki których dotyczy ta konfiguracja
    files: ['**/*.{js,ts}'],

    // Parsowanie TypeScript
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        // Globalne zmienne Node.js
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        // Globalne zmienne przeglądarki
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        // Jest/Playwright globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },

    // Pluginy
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
    },

    // Reguły
    rules: {
      // Prettier rules
      'prettier/prettier': 'error',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',

      // JavaScript rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',

      // Wyłączamy niektóre reguły które mogą przeszkadzać w testach
      'no-undef': 'off', // TypeScript sprawdza to lepiej
    },
  },

  {
    // Ignorowane pliki - nowy sposób w ESLint v9
    ignores: [
      'node_modules/**',
      'dist/**',
      '*.min.js',
      '*.min.css',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'allure-results/**',
      'allure-report/**',
      '.env*',
      'eslint.config.js',
      '.eslintrc.js',
    ],
  },
];
