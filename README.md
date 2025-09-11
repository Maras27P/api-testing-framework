# 🧪 Modern API Testing Framework

Nowoczesny framework do testowania API z użyciem Playwright, TypeScript i najlepszych praktyk.

## 📋 Spis treści

- [Wymagania](#-wymagania)
- [Instalacja](#-instalacja)
- [Konfiguracja](#-konfiguracja)
- [Uruchamianie testów](#-uruchamianie-testów)
- [Struktura projektu](#-struktura-projektu)
- [Pisanie testów](#-pisanie-testów)
- [Środowiska](#-środowiska)
- [Narzędzia developerskie](#-narzędzia-developerskie)
- [Raporty](#-raporty)

## 🔧 Wymagania

- **Node.js** 18.14.0 lub nowszy
- **npm** 9.3.1 lub nowszy
- **Git** (do pre-commit hooks)

## 🚀 Instalacja

1. **Sklonuj repozytorium:**

   ```bash
   git clone <twoje-repo>
   cd moje-testy-api
   ```

2. **Zainstaluj zależności:**

   ```bash
   npm install
   ```

3. **Przygotuj plik środowiskowy:**

   ```bash
   npm run setup:env
   ```

4. **Edytuj plik `.env`** i dostosuj do swoich potrzeb

## ⚙️ Konfiguracja

### Plik `.env`

Skopiuj `env.example` do `.env` i skonfiguruj:

```bash
# Środowisko
NODE_ENV=dev

# URLs - domyślnie skonfigurowane dla awesome-localstack
# UWAGA: Bez /api na końcu! API ma własne prefiksy w endpointach
DEV_BASE_URL=http://localhost:4001
STAGING_BASE_URL=https://api-staging.example.com
PROD_BASE_URL=https://api.example.com

# Dane logowania do awesome-localstack API
DEV_USERNAME=admin
DEV_PASSWORD=admin

# JWT Tokens (będą ustawiane automatycznie po logowaniu)
DEV_JWT_TOKEN=
STAGING_JWT_TOKEN=
PROD_JWT_TOKEN=

# API Keys (dla innych środowisk)
STAGING_API_KEY=your-staging-api-key
PROD_API_KEY=your-prod-api-key

# Ustawienia testów
API_TIMEOUT=30000
RETRY_COUNT=3
PARALLEL_WORKERS=4
```

### 🔐 Autoryzacja JWT

Framework obsługuje automatyczną autoryzację JWT:

- **Automatyczne logowanie**: Jeśli podasz `username` i `password`, framework automatycznie zaloguje użytkownika
- **Zarządzanie tokenami**: Tokeny są automatycznie odświeżane gdy wygasną
- **Bezpieczeństwo**: Tokeny są przechowywane tylko w pamięci podczas testów

```typescript
// Przykład użycia w testach
const apiClient = new ApiClient(request);

// Logowanie (opcjonalne - dzieje się automatycznie)
await apiClient.login();

// Żądania są automatycznie autoryzowane
const response = await apiClient.get('/protected-endpoint');

// Sprawdzenie stanu autoryzacji
console.log('Zalogowany:', apiClient.isAuthenticated());

// Wylogowanie
await apiClient.logout();
```

### 🎯 **Gotowe funkcjonalności:**

- ✅ **Automatyczne logowanie** z danymi z konfiguracji
- ✅ **Zarządzanie tokenami JWT** z automatycznym odświeżaniem
- ✅ **Obsługa wygasania tokenów**
- ✅ **Automatyczne dodawanie nagłówków** autoryzacji
- ✅ **Graceful handling** błędów połączenia
- ✅ **Wsparcie dla różnych środowisk** (dev/staging/prod)

## 🐳 Uruchamianie awesome-localstack

Przed uruchomieniem testów, uruchom środowisko awesome-localstack:

```bash
# Sklonuj repozytorium awesome-localstack
git clone https://github.com/slawekradzyminski/awesome-localstack.git
cd awesome-localstack

# Uruchom wszystkie serwisy
docker compose up -d

# Sprawdź czy API działa
curl http://localhost:4001/health
```

**Dostępne endpointy:**

- Backend API: http://localhost:4001
- Frontend: http://localhost:8081
- Swagger UI: http://localhost:4001/swagger-ui/index.html

**⚙️ Konfiguracja danych logowania:**

Jeśli domyślne dane logowania (`admin/admin`) nie działają:

1. Sprawdź dokumentację API w Swagger UI
2. Zaktualizuj plik `.env`:
   ```bash
   DEV_USERNAME=twoj-username
   DEV_PASSWORD=twoje-haslo
   ```
3. Lub przekaż dane bezpośrednio w testach:
   ```typescript
   await apiClient.login('custom-user', 'custom-password');
   ```

## 🏃‍♂️ Uruchamianie testów

### Podstawowe komendy:

```bash
# Wszystkie testy
npm test

# Testy w trybie headed (z widoczną przeglądarką)
npm run test:headed

# Testy w trybie debug
npm run test:debug

# Tylko testy API
npm run test:api

# Testy autoryzacji JWT
npx playwright test tests/api/auth.spec.ts

# Testy performance
npm run test:performance
```

### Testy na różnych środowiskach:

```bash
# Development
npm run test:dev

# Staging
npm run test:staging

# Production (OSTROŻNIE!)
npm run test:prod
```

### Filtrowanie testów:

```bash
# Tylko testy smoke
npm run test:smoke

# Tylko testy regression
npm run test:regression

# Konkretny plik
npx playwright test tests/api/users.spec.ts
```

## 📁 Struktura projektu

```
moje-testy-api/
├── src/                          # Kod źródłowy frameworka
│   ├── config/                   # Konfiguracja środowisk
│   │   └── environment.ts        # Zarządzanie środowiskami
│   ├── fixtures/                 # Dane testowe
│   │   └── user.fixtures.ts      # Przykładowe dane użytkowników
│   ├── helpers/                  # Funkcje pomocnicze
│   │   └── api-assertions.ts     # Asercje dla API
│   ├── models/                   # Modele danych
│   │   └── user.model.ts         # Model użytkownika
│   ├── schemas/                  # Schematy JSON
│   │   └── user.schema.ts        # Schemat walidacji użytkownika
│   └── utils/                    # Narzędzia
│       ├── api-client.ts         # Klient HTTP
│       └── schema-validator.ts   # Walidator schematów
├── tests/                        # Testy
│   ├── api/                      # Testy API
│   ├── contract/                 # Testy kontraktowe
│   └── performance/              # Testy wydajnościowe
├── .husky/                       # Git hooks
├── playwright.config.ts          # Konfiguracja Playwright
├── tsconfig.json                # Konfiguracja TypeScript
├── eslint.config.js             # Konfiguracja ESLint
├── .prettierrc                  # Konfiguracja Prettier
└── README.md                    # Ta dokumentacja
```

## ✍️ Pisanie testów

### Przykład testu API:

```typescript
import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/utils/api-client';
import { ApiAssertions } from '../../src/helpers/api-assertions';
import { userSchema } from '../../src/schemas/user.schema';

test.describe('Users API', () => {
  let apiClient: ApiClient;
  let assertions: ApiAssertions;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request);
    assertions = new ApiAssertions();
  });

  test('GET /users - should return all users @smoke', async () => {
    const response = await apiClient.get('/users');

    await assertions.assertStatusCode(response, 200);
    await assertions.assertSchema(response, userSchema);

    const users = await response.json();
    expect(users).toHaveLength(10);
  });
});
```

### Tagowanie testów:

- `@smoke` - testy podstawowe, szybkie
- `@regression` - testy regresyjne, bardziej szczegółowe
- `@slow` - testy wolne (np. performance)

## 🌍 Środowiska

Framework obsługuje trzy środowiska:

### Development (`dev`)

- URL: `https://jsonplaceholder.typicode.com`
- Debug: włączony
- Retry: 2
- Używane domyślnie

### Staging (`staging`)

- URL: konfigurowalny
- Debug: wyłączony
- Retry: 3
- Do testów przed wdrożeniem

### Production (`prod`)

- URL: konfigurowalny
- Debug: zawsze wyłączony
- Retry: 3
- ⚠️ **UŻYWAJ OSTROŻNIE!**

## 🛠 Narzędzia developerskie

### Formatowanie i linting:

```bash
# Sprawdź kod
npm run code:check

# Napraw automatycznie
npm run code:fix

# Tylko ESLint
npm run lint
npm run lint:fix

# Tylko Prettier
npm run format
npm run format:check
```

### Pre-commit hooks:

Framework automatycznie sprawdza kod przed każdym commitem dzięki Husky i lint-staged.

### Konfiguracja IDE (VS Code):

1. Zainstaluj rozszerzenia:
   - ESLint
   - Prettier - Code formatter
   - Playwright Test for VSCode

2. Dodaj do settings.json:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 📊 Raporty

### HTML Report (Playwright):

```bash
npm run test:report
```

### Allure Reports:

```bash
npm run generate:report
npx allure open allure-report
```

### JSON Results:

Wyniki zapisywane w `test-results.json`

## 🔍 Rozwiązywanie problemów

### Częste problemy:

1. **Błąd "Environment not found"**
   - Sprawdź plik `.env`
   - Upewnij się że `NODE_ENV` jest poprawnie ustawiony

2. **Testy timeout**
   - Zwiększ `API_TIMEOUT` w `.env`
   - Sprawdź połączenie internetowe

3. **ESLint errors**
   - Uruchom `npm run lint:fix`
   - Sprawdź konfigurację w `eslint.config.js`

4. **Prettier conflicts**
   - Uruchom `npm run format`
   - Sprawdź `.prettierrc`

### Debug mode:

```bash
# Włącz debug w .env
DEBUG_MODE=true

# Lub bezpośrednio:
NODE_ENV=dev npm run test:debug
```

## 🤝 Współpraca

1. **Przed commitem** kod jest automatycznie sprawdzany
2. **Używaj tagów** w testach (@smoke, @regression)
3. **Pisz dokumentację** dla nowych funkcji
4. **Testuj na dev** przed staging/prod

## 📞 Pomoc

Jeśli masz problemy:

1. Sprawdź [dokumentację Playwright](https://playwright.dev/)
2. Przejrzyj logi w trybie debug
3. Sprawdź konfigurację środowiska

---

**Happy Testing!** 🚀
