module.exports = {
  // Określa środowisko w którym będzie działać kod
  env: {
    browser: true, // Kod może działać w przeglądarce
    es2021: true, // Używamy nowoczesnych funkcji ES2021
    node: true, // Kod może działać w Node.js
    jest: true, // Używamy Jest do testów
  },

  // Rozszerza konfigurację o zalecane reguły
  extends: [
    'eslint:recommended', // Podstawowe reguły ESLint
    '@typescript-eslint/recommended', // Reguły dla TypeScript
    'plugin:@typescript-eslint/recommended', // Dodatkowe reguły TS
    'prettier', // Integracja z Prettier
  ],

  // Parser dla TypeScript
  parser: '@typescript-eslint/parser',

  // Opcje parsera
  parserOptions: {
    ecmaVersion: 'latest', // Najnowsza wersja ECMAScript
    sourceType: 'module', // Używamy modułów ES6
    project: './tsconfig.json', // Ścieżka do konfiguracji TypeScript
  },

  // Pluginy które używamy
  plugins: [
    '@typescript-eslint', // Plugin dla TypeScript
    'prettier', // Plugin dla Prettier
  ],

  // Customowe reguły - możesz je dostosować do swoich potrzeb
  rules: {
    // Prettier errors jako ESLint errors
    'prettier/prettier': 'error',

    // TypeScript reguły
    '@typescript-eslint/no-unused-vars': 'error', // Błąd za nieużywane zmienne
    '@typescript-eslint/no-explicit-any': 'warn', // Ostrzeżenie za używanie 'any'
    '@typescript-eslint/explicit-function-return-type': 'off', // Nie wymuszamy typów zwracanych

    // Ogólne reguły
    'no-console': 'warn', // Ostrzeżenie za console.log w produkcji
    'no-debugger': 'error', // Błąd za debugger w kodzie
    'no-duplicate-imports': 'error', // Błąd za duplikaty importów

    // Reguły dla lepszej czytelności
    'prefer-const': 'error', // Używaj const gdzie możliwe
    'no-var': 'error', // Nie używaj var, tylko let/const
    'object-shorthand': 'error', // Używaj skróconych zapisów obiektów
  },

  // Ignoruj niektóre pliki specjalne
  ignorePatterns: ['node_modules/', 'dist/', '*.min.js'],
};
