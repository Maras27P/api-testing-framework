# 📚 Framework Tutorial - Kompletny Przewodnik Krok Po Kroku

> **Kompleksowy przewodnik nauki frameworka testowego API z użyciem Playwright i TypeScript**

## 📖 Spis treści

1. [Wprowadzenie do frameworka](#1-wprowadzenie-do-frameworka)
2. [Architektura i struktura projektu](#2-architektura-i-struktura-projektu)
3. [Podstawowe koncepcje](#3-podstawowe-koncepcje)
4. [Konfiguracja środowiska](#4-konfiguracja-środowiska)
5. [Pierwsz test - krok po kroku](#5-pierwszy-test---krok-po-kroku)
6. [ApiClient - serce frameworka](#6-apiclient---serce-frameworka)
7. [Wzorzec AAA (Arrange-Act-Assert)](#7-wzorzec-aaa-arrange-act-assert)
8. [Walidacja odpowiedzi API](#8-walidacja-odpowiedzi-api)
9. [Zarządzanie danymi testowymi](#9-zarządzanie-danymi-testowymi)
10. [Autoryzacja i bezpieczeństwo](#10-autoryzacja-i-bezpieczeństwo)
11. [Testy wydajnościowe](#11-testy-wydajnościowe)
12. [Dobre praktyki](#12-dobre-praktyki)
13. [Zaawansowane techniki](#13-zaawansowane-techniki)
14. [Rozwiązywanie problemów](#14-rozwiązywanie-problemów)
15. [Ćwiczenia praktyczne](#15-ćwiczenia-praktyczne)

---

## 1. Wprowadzenie do frameworka

### Co to jest ten framework?

To nowoczesny framework do testowania API, zbudowany z wykorzystaniem:

- **Playwright** - potężne narzędzie do testowania
- **TypeScript** - silne typowanie dla bezpieczeństwa kodu
- **Wzorce projektowe** - czytelny i łatwy w utrzymaniu kod

### Kluczowe cechy

✅ **Silne typowanie** - TypeScript pilnuje poprawności kodu
✅ **Automatyczna autoryzacja JWT** - nie musisz się martwić o tokeny
✅ **Walidacja schematów JSON** - sprawdzenie struktury odpowiedzi
✅ **Wzorzec AAA** - czytelne i konsystentne testy
✅ **Wsparcie wielośrodowiskowe** - dev, staging, production
✅ **Gotowe asercje** - nie piszesz od zera
✅ **Pre-commit hooks** - automatyczna kontrola jakości kodu

### Dla kogo jest ten framework?

- Testerzy automatyzujący testy API
- Programiści piszący testy integracyjne
- QA Engineers pracujący z REST API
- DevOps automatyzujący sprawdzanie środowisk

---

## 2. Architektura i struktura projektu

### Struktura katalogów

```
moje-testy-api/
│
├── src/                          # Kod źródłowy frameworka
│   ├── config/                   # Konfiguracja środowisk
│   │   └── environment.ts        # Zarządzanie środowiskami (dev/staging/prod)
│   │
│   ├── fixtures/                 # Dane testowe
│   │   └── user.fixtures.ts      # Przygotowane dane użytkowników
│   │
│   ├── helpers/                  # Funkcje pomocnicze
│   │   └── api-assertions.ts     # Gotowe asercje dla API
│   │
│   ├── models/                   # Modele danych
│   │   └── user.model.ts         # Interfejsy TypeScript
│   │
│   ├── schemas/                  # Schematy JSON
│   │   └── user.schema.ts        # Definicje schematów walidacji
│   │
│   └── utils/                    # Narzędzia
│       ├── api-client.ts         # Klient HTTP (główna klasa)
│       ├── auth-manager.ts       # Zarządzanie autoryzacją JWT
│       └── schema-validator.ts   # Walidator schematów JSON
│
├── tests/                        # Katalog z testami
│   ├── api/                      # Testy API
│   │   ├── auth.spec.ts          # Testy autoryzacji
│   │   └── users.spec.ts         # Testy użytkowników
│   │
│   ├── contract/                 # Testy kontraktowe
│   │   └── user-contract.spec.ts
│   │
│   ├── performance/              # Testy wydajnościowe
│   │   └── load-test.spec.ts
│   │
│   └── templates/                # Szablony testów
│       └── aaa-test-template.spec.ts  # Szablon wzorca AAA
│
├── .env                          # Konfiguracja środowiska (NIE commituj!)
├── env.example                   # Przykładowa konfiguracja
├── playwright.config.ts          # Konfiguracja Playwright
├── tsconfig.json                 # Konfiguracja TypeScript
├── package.json                  # Zależności projektu
└── README.md                     # Dokumentacja projektu
```

### Przepływ danych w frameworku

```
Test → ApiClient → API Endpoint
  ↓         ↓
  ↓    AuthManager (jeśli potrzeba autoryzacji)
  ↓         ↓
  ↓    Response
  ↓         ↓
ApiAssertions ← Response
  ↓
SchemaValidator (opcjonalnie)
  ↓
✅ Test Pass / ❌ Test Fail
```

---

## 3. Podstawowe koncepcje

### REST API - Podstawy

**REST API** to interfejs, który pozwala aplikacjom komunikować się przez HTTP.

**Główne metody HTTP:**

- `GET` - pobieranie danych (np. lista użytkowników)
- `POST` - tworzenie nowych zasobów
- `PUT` - aktualizacja całego zasobu
- `PATCH` - częściowa aktualizacja
- `DELETE` - usuwanie zasobu

**Kody odpowiedzi HTTP:**

- `200 OK` - sukces
- `201 Created` - zasób utworzony
- `400 Bad Request` - nieprawidłowe dane
- `401 Unauthorized` - brak autoryzacji
- `404 Not Found` - zasób nie istnieje
- `422 Unprocessable Entity` - błąd walidacji
- `500 Internal Server Error` - błąd serwera

### Playwright - Co to jest?

Playwright to framework do testowania aplikacji webowych i API, stworzony przez Microsoft.

**Dlaczego Playwright?**

- Szybki i stabilny
- Wbudowane wsparcie dla API testing
- Doskonałe raporty
- TypeScript out-of-the-box

### TypeScript - Dlaczego?

TypeScript to JavaScript z typami - sprawdza błędy przed uruchomieniem kodu.

**Przykład:**

```typescript
// JavaScript - błąd wykryty dopiero w runtime
function greet(name) {
  return 'Hello ' + name.toUpperCase();
}
greet(123); // ❌ Błąd w runtime!

// TypeScript - błąd wykryty podczas pisania kodu
function greet(name: string): string {
  return 'Hello ' + name.toUpperCase();
}
greet(123); // ❌ Błąd kompilacji! TypeScript nie pozwoli uruchomić kodu
```

---

## 4. Konfiguracja środowiska

### Krok 1: Instalacja zależności

```bash
# Sklonuj repozytorium
git clone <twoje-repo>
cd moje-testy-api

# Zainstaluj zależności
npm install
```

### Krok 2: Konfiguracja pliku .env

```bash
# Skopiuj przykładową konfigurację
npm run setup:env

# Lub ręcznie
cp env.example .env
```

**Edytuj plik `.env`:**

```bash
# Środowisko (dev, staging, prod)
NODE_ENV=dev

# URL API - domyślnie awesome-localstack
DEV_BASE_URL=http://localhost:4001
STAGING_BASE_URL=https://api-staging.example.com
PROD_BASE_URL=https://api.example.com

# Dane logowania dla DEV (awesome-localstack)
DEV_USERNAME=admin
DEV_PASSWORD=admin

# Tokeny JWT (ustawiane automatycznie)
DEV_JWT_TOKEN=
STAGING_JWT_TOKEN=
PROD_JWT_TOKEN=

# API Keys (dla innych środowisk)
STAGING_API_KEY=your-staging-api-key
PROD_API_KEY=your-prod-api-key

# Ustawienia testów
API_TIMEOUT=30000          # Timeout w ms (30 sekund)
RETRY_COUNT=3              # Liczba ponownych prób
PARALLEL_WORKERS=4         # Liczba równoległych workerów
DEBUG_MODE=true            # Tryb debugowania
```

### Krok 3: Uruchomienie API (awesome-localstack)

```bash
# Sklonuj repozytorium awesome-localstack
git clone https://github.com/slawekradzyminski/awesome-localstack.git
cd awesome-localstack

# Uruchom Docker Compose
docker compose up -d

# Sprawdź czy API działa
curl http://localhost:4001/health

# Otwórz Swagger UI w przeglądarce
# http://localhost:4001/swagger-ui/index.html
```

### Krok 4: Weryfikacja konfiguracji

```bash
# Uruchom prosty test
npx playwright test tests/api/auth.spec.ts

# Jeśli wszystko działa, zobaczysz:
# ✅ Tests passed
```

---

## 5. Pierwszy test - krok po kroku

### Krok 1: Stwórz nowy plik testu

Utwórz plik `tests/api/my-first-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/utils/api-client';

test.describe('Mój pierwszy test API', () => {
  test('GET /users - pobierz listę użytkowników', async ({ request }) => {
    // KROK 1: Stwórz klienta API
    const apiClient = new ApiClient(request);

    // KROK 2: Zaloguj się (jeśli API wymaga autoryzacji)
    await apiClient.login();

    // KROK 3: Wykonaj żądanie GET
    const response = await apiClient.get('/users');

    // KROK 4: Sprawdź status odpowiedzi
    expect(response.status()).toBe(200);

    // KROK 5: Pobierz dane z odpowiedzi
    const users = await response.json();

    // KROK 6: Zweryfikuj dane
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);

    console.log(`Znaleziono ${users.length} użytkowników`);
  });
});
```

### Krok 2: Uruchom test

```bash
npx playwright test tests/api/my-first-test.spec.ts --headed
```

### Krok 3: Zrozum wynik

```
Running 1 test using 1 worker

  ✓  tests/api/my-first-test.spec.ts:3:3 › GET /users - pobierz listę użytkowników (234ms)

  1 passed (1s)
```

**Co się stało?**

1. Playwright uruchomił test
2. ApiClient nawiązał połączenie z API
3. Wykonano automatyczne logowanie JWT
4. Wysłano żądanie GET do `/users`
5. Sprawdzono czy status = 200
6. Zweryfikowano strukturę odpowiedzi
7. Test zakończył się sukcesem ✅

---

## 6. ApiClient - serce frameworka

### Co to jest ApiClient?

`ApiClient` to główna klasa frameworka, która:

- Zarządza połączeniem z API
- Automatycznie dodaje nagłówki
- Obsługuje autoryzację JWT
- Upraszcza żądania HTTP

### Podstawowe użycie

```typescript
import { ApiClient } from '../../src/utils/api-client';

// Inicjalizacja
const apiClient = new ApiClient(request);

// GET - pobieranie danych
const response = await apiClient.get('/users');

// POST - tworzenie zasobu
const newUser = { name: 'Jan', email: 'jan@example.com' };
const createResponse = await apiClient.post('/users', newUser);

// PUT - aktualizacja całego zasobu
const updateData = { name: 'Jan Kowalski', email: 'jan.kowalski@example.com' };
const updateResponse = await apiClient.put('/users/1', updateData);

// PATCH - częściowa aktualizacja
const patchData = { name: 'Jan Updated' };
const patchResponse = await apiClient.patch('/users/1', patchData);

// DELETE - usuwanie zasobu
const deleteResponse = await apiClient.delete('/users/1');
```

### Zaawansowane użycie

```typescript
// Dodawanie niestandardowych nagłówków
const response = await apiClient.get('/users', {
  headers: {
    'X-Custom-Header': 'custom-value',
  },
});

// Ustawienie timeout dla konkretnego żądania
const response = await apiClient.get('/slow-endpoint', {
  timeout: 60000, // 60 sekund
});

// Query parameters
const response = await apiClient.get('/users', {
  params: {
    page: 1,
    limit: 10,
    sort: 'name',
  },
});
```

### Jak działa ApiClient pod maską?

**Plik: `src/utils/api-client.ts`**

```typescript
export class ApiClient {
  private context: APIRequestContext;
  private baseURL: string;
  private authManager: AuthManager;

  constructor(context: APIRequestContext) {
    // 1. Zapisz kontekst Playwright
    this.context = context;

    // 2. Pobierz URL z konfiguracji środowiska
    this.baseURL = getCurrentEnvironment().baseUrl;

    // 3. Stwórz menedżera autoryzacji
    this.authManager = new AuthManager(context);
  }

  async get(
    endpoint: string,
    options?: APIRequestOptions
  ): Promise<APIResponse> {
    // 1. Pobierz domyślne nagłówki (w tym Authorization)
    const defaultHeaders = await this.getDefaultHeaders();

    // 2. Wykonaj żądanie GET
    return await this.context.get(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers, // Nadpisz własnymi nagłówkami jeśli podano
      },
    });
  }

  private async getDefaultHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const env = getCurrentEnvironment();

    // Automatycznie dodaj autoryzację JWT
    if (env.username && env.password) {
      const authHeaders = await this.authManager.getAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    return headers;
  }
}
```

**Kluczowe koncepcje:**

1. **Enkapsulacja** - ukrywa szczegóły implementacji
2. **Automatyzacja** - automatycznie dodaje nagłówki i autoryzację
3. **Konfigurowalność** - można nadpisać domyślne ustawienia
4. **Typowanie** - TypeScript pilnuje poprawności parametrów

---

## 7. Wzorzec AAA (Arrange-Act-Assert)

### Czym jest wzorzec AAA?

AAA to struktura testu składająca się z trzech sekcji:

1. **ARRANGE** (Przygotowanie) - konfiguracja danych i stanu
2. **ACT** (Działanie) - wykonanie testowanej akcji
3. **ASSERT** (Weryfikacja) - sprawdzenie rezultatów

### Dlaczego AAA?

✅ **Czytelność** - każdy wie co robi test
✅ **Konsystencja** - wszystkie testy wyglądają podobnie
✅ **Łatwość debugowania** - szybko znajdziesz problem
✅ **Dokumentacja** - test sam się dokumentuje

### Przykład bez AAA (źle)

```typescript
test('test użytkownika', async ({ request }) => {
  const apiClient = new ApiClient(request);
  const response = await apiClient.get('/users/admin');
  expect(response.status()).toBe(200);
  const user = await response.json();
  expect(user.username).toBe('admin');
  expect(user.roles).toContain('ADMIN');
});
```

**Problemy:**

- Trudno zrozumieć co test sprawdza
- Brak struktury
- Ciężko debugować

### Przykład z AAA (dobrze)

```typescript
test('GET /users/{username} - powinien zwrócić dane administratora', async ({
  request,
}) => {
  // ARRANGE - Przygotowanie
  const apiClient = new ApiClient(request);
  const username = 'admin';
  const expectedRole = 'ADMIN';
  const expectedStatus = 200;

  // ACT - Działanie
  const response = await apiClient.get(`/users/${username}`);

  // ASSERT - Weryfikacja
  expect(response.status()).toBe(expectedStatus);

  const user = await response.json();
  expect(user.username).toBe(username);
  expect(user.roles).toContain(expectedRole);
});
```

**Zalety:**

- Jasny podział na sekcje
- Łatwo zrozumieć cel testu
- Szybkie debugowanie
- Zrozumiałe dla każdego

### Szablon testu AAA

```typescript
test('METODA /endpoint - opis testu @tag', async ({ request }) => {
  // ==================== ARRANGE ====================
  // Przygotuj dane testowe i stan początkowy
  const apiClient = new ApiClient(request);
  const assertions = new ApiAssertions();

  const testData = {
    // dane wejściowe
  };
  const expectedStatus = 200;
  const endpoint = '/example';

  // ==================== ACT ====================
  // Wykonaj testowaną akcję
  const response = await apiClient.get(endpoint);

  // ==================== ASSERT ====================
  // Zweryfikuj rezultaty
  await assertions.assertStatusCode(response, expectedStatus);

  const data = await response.json();
  expect(data).toBeDefined();
  // więcej asercji...
});
```

### Zaawansowany przykład AAA

**Plik: `tests/templates/aaa-test-template.spec.ts`**

```typescript
test('POST /users - should create new user with valid data @regression', async ({
  request,
}) => {
  // ==================== ARRANGE ====================
  const apiClient = new ApiClient(request);
  const assertions = new ApiAssertions();

  // Przygotuj dane nowego użytkownika
  const newUser = {
    username: 'john_doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'SecurePass123!',
  };

  const endpoint = '/users';
  const expectedStatus = 201;
  const requiredFields = ['id', 'username', 'email', 'createdAt'];

  // ==================== ACT ====================
  // Wykonaj żądanie POST
  const response = await apiClient.post(endpoint, newUser);

  // ==================== ASSERT ====================
  // Sprawdź status odpowiedzi
  await assertions.assertStatusCode(response, expectedStatus);

  // Pobierz utworzonego użytkownika
  const createdUser = await response.json();

  // Sprawdź czy zwrócone dane zawierają wszystkie wymagane pola
  requiredFields.forEach(field => {
    expect(createdUser).toHaveProperty(field);
  });

  // Sprawdź czy dane się zgadzają
  expect(createdUser.username).toBe(newUser.username);
  expect(createdUser.email).toBe(newUser.email);
  expect(createdUser.firstName).toBe(newUser.firstName);
  expect(createdUser.lastName).toBe(newUser.lastName);

  // Sprawdź czy ID zostało wygenerowane
  expect(createdUser.id).toBeDefined();
  expect(typeof createdUser.id).toBe('number');

  // Sprawdź czy hasło NIE jest zwracane w odpowiedzi
  expect(createdUser).not.toHaveProperty('password');
});
```

---

## 8. Walidacja odpowiedzi API

### ApiAssertions - Gotowe asercje

Framework dostarcza klasę `ApiAssertions` z gotowymi metodami walidacji.

**Plik: `src/helpers/api-assertions.ts`**

#### 8.1. Sprawdzanie kodu statusu

```typescript
import { ApiAssertions } from '../../src/helpers/api-assertions';

const assertions = new ApiAssertions();

// Sprawdź czy status = 200
await assertions.assertStatusCode(response, 200);

// Sprawdź czy status = 201 (Created)
await assertions.assertStatusCode(response, 201);

// Sprawdź czy status = 404 (Not Found)
await assertions.assertStatusCode(response, 404);
```

#### 8.2. Sprawdzanie nagłówków

```typescript
// Sprawdź pojedynczy nagłówek
await assertions.assertHeaders(response, {
  'content-type': 'application/json',
});

// Sprawdź wiele nagłówków
await assertions.assertHeaders(response, {
  'content-type': 'application/json',
  'x-api-version': '1.0.0',
  'cache-control': 'no-cache',
});
```

#### 8.3. Walidacja schematu JSON

```typescript
import { userSchema } from '../../src/schemas/user.schema';

// Sprawdź czy odpowiedź pasuje do schematu
await assertions.assertSchema(response, userSchema);
```

**Jak działa walidacja schematów?**

**Plik: `src/schemas/user.schema.ts`**

```typescript
import { JSONSchemaType } from 'ajv';
import { User } from '../models/user.model';

export const userSchema: JSONSchemaType<User> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    username: { type: 'string', nullable: true },
    roles: {
      type: 'array',
      items: { type: 'string' },
    },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
  },
  required: ['id', 'roles', 'firstName', 'lastName'],
  additionalProperties: true,
};
```

**Co sprawdza schemat?**

- Typy pól (number, string, array)
- Wymagane pola (required)
- Struktura obiektów
- Format danych

**Przykład użycia:**

```typescript
test('GET /users/{username} - should return valid user schema', async ({
  request,
}) => {
  // ARRANGE
  const apiClient = new ApiClient(request);
  const assertions = new ApiAssertions();
  const username = 'admin';

  // ACT
  const response = await apiClient.get(`/users/${username}`);

  // ASSERT
  await assertions.assertStatusCode(response, 200);

  // Sprawdź czy odpowiedź pasuje do schematu użytkownika
  await assertions.assertSchema(response, userSchema);

  // Jeśli test przejdzie, mamy pewność że:
  // ✅ Pole 'id' jest liczbą
  // ✅ Pole 'roles' jest tablicą stringów
  // ✅ Pola 'firstName' i 'lastName' są obecne
  // ✅ Struktura jest zgodna z oczekiwaniami
});
```

#### 8.4. Sprawdzanie wartości w JSON path

```typescript
// Sprawdź wartość w zagnieżdżonym obiekcie
await assertions.assertJsonPath(response, 'user.address.city', 'Warsaw');

// Sprawdź wartość w tablicy
await assertions.assertJsonPath(response, 'users.0.name', 'John');
```

#### 8.5. Sprawdzanie długości tablicy

```typescript
// Sprawdź czy tablica ma dokładnie 10 elementów
await assertions.assertArrayLength(response, 10);
```

### Tworzenie własnych schematów

**Krok 1: Stwórz model TypeScript**

```typescript
// src/models/product.model.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  categories: string[];
}
```

**Krok 2: Stwórz schemat JSON**

```typescript
// src/schemas/product.schema.ts
import { JSONSchemaType } from 'ajv';
import { Product } from '../models/product.model';

export const productSchema: JSONSchemaType<Product> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    inStock: { type: 'boolean' },
    categories: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
  },
  required: ['id', 'name', 'price', 'inStock', 'categories'],
  additionalProperties: false,
};
```

**Krok 3: Użyj w teście**

```typescript
import { productSchema } from '../../src/schemas/product.schema';

test('GET /products/{id} - should return valid product', async ({
  request,
}) => {
  const apiClient = new ApiClient(request);
  const assertions = new ApiAssertions();

  const response = await apiClient.get('/products/1');

  await assertions.assertStatusCode(response, 200);
  await assertions.assertSchema(response, productSchema);
});
```

---

## 9. Zarządzanie danymi testowymi

### Fixtures - Przygotowane dane testowe

Fixtures to przygotowane dane, których używasz w testach.

**Plik: `src/fixtures/user.fixtures.ts`**

```typescript
import { faker } from '@faker-js/faker';

export class UserFixtures {
  // Użytkownik z poprawnymi danymi
  static createValidUser() {
    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'SecurePass123!',
      roles: ['USER'],
    };
  }

  // Użytkownik z niepoprawnymi danymi
  static createInvalidUser() {
    return {
      username: '', // Puste - nieprawidłowe
      email: 'invalid-email', // Zły format
      firstName: 'AB', // Za krótkie
      lastName: null, // Null - nieprawidłowe
    };
  }

  // Administrator
  static createAdminUser() {
    return {
      ...this.createValidUser(),
      roles: ['USER', 'ADMIN'],
    };
  }

  // Użytkownik z minimalnymi danymi
  static createMinimalUser() {
    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: 'Pass123!',
    };
  }
}
```

### Użycie Fixtures w testach

```typescript
import { UserFixtures } from '../../src/fixtures/user.fixtures';

test('POST /users - should create user with valid data', async ({
  request,
}) => {
  // ARRANGE
  const apiClient = new ApiClient(request);
  const newUser = UserFixtures.createValidUser(); // ← Użyj fixture

  // ACT
  const response = await apiClient.post('/users', newUser);

  // ASSERT
  expect(response.status()).toBe(201);

  const createdUser = await response.json();
  expect(createdUser.email).toBe(newUser.email);
});
```

### Faker.js - Generator losowych danych

Faker.js generuje realistyczne losowe dane.

```typescript
import { faker } from '@faker-js/faker';

// Dane osobowe
const firstName = faker.person.firstName(); // "John"
const lastName = faker.person.lastName(); // "Doe"
const email = faker.internet.email(); // "john.doe@example.com"
const username = faker.internet.userName(); // "john_doe123"
const password = faker.internet.password(); // "aB3$xY9!"

// Dane adresowe
const city = faker.location.city(); // "New York"
const country = faker.location.country(); // "United States"
const zipCode = faker.location.zipCode(); // "12345"

// Dane biznesowe
const companyName = faker.company.name(); // "Tech Corp"
const jobTitle = faker.person.jobTitle(); // "Software Engineer"

// Dane liczbowe
const randomNumber = faker.number.int({ min: 1, max: 100 });
const price = faker.number.float({ min: 10, max: 1000, precision: 0.01 });

// Daty
const pastDate = faker.date.past();
const futureDate = faker.date.future();
```

### Tworzenie własnych Fixtures

```typescript
// src/fixtures/product.fixtures.ts
import { faker } from '@faker-js/faker';

export class ProductFixtures {
  static createValidProduct() {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      inStock: true,
      categories: [faker.commerce.department()],
      sku: faker.string.alphanumeric(10).toUpperCase(),
    };
  }

  static createExpensiveProduct() {
    return {
      ...this.createValidProduct(),
      price: faker.number.float({ min: 1000, max: 10000, precision: 0.01 }),
    };
  }

  static createOutOfStockProduct() {
    return {
      ...this.createValidProduct(),
      inStock: false,
    };
  }
}
```

---

## 10. Autoryzacja i bezpieczeństwo

### Autoryzacja JWT - Jak działa?

**JWT (JSON Web Token)** to standard autoryzacji używany przez wiele API.

**Przepływ autoryzacji:**

```
1. Klient → POST /auth/login (username + password)
2. API → Zwraca token JWT
3. Klient → GET /protected (Authorization: Bearer TOKEN)
4. API → Sprawdza token i zwraca dane
```

### Automatyczna autoryzacja w frameworku

Framework automatycznie zarządza tokenami JWT!

**Plik: `src/utils/auth-manager.ts`**

```typescript
export class AuthManager {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  async login(username?: string, password?: string): Promise<string> {
    // 1. Użyj danych z .env jeśli nie podano
    const env = getCurrentEnvironment();
    const user = username || env.username;
    const pass = password || env.password;

    // 2. Wyślij żądanie logowania
    const response = await this.context.post(`${env.baseUrl}/auth/login`, {
      data: { username: user, password: pass },
    });

    // 3. Pobierz token z odpowiedzi
    const data = await response.json();
    this.token = data.token;
    this.tokenExpiry = new Date(data.expiresAt);

    return this.token;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    // 1. Sprawdź czy token jest ważny
    if (!this.isTokenValid()) {
      // 2. Jeśli wygasł, zaloguj się ponownie
      await this.login();
    }

    // 3. Zwróć nagłówek z tokenem
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }
    return new Date() < this.tokenExpiry;
  }
}
```

### Użycie autoryzacji w testach

#### Automatyczne logowanie

```typescript
test('GET /users - automatic authentication', async ({ request }) => {
  // ARRANGE
  const apiClient = new ApiClient(request);
  // Autoryzacja jest automatyczna!
  // Framework sam zaloguje się używając danych z .env

  // ACT
  const response = await apiClient.get('/users');

  // ASSERT
  expect(response.status()).toBe(200);
  // Token JWT został automatycznie dodany do nagłówka!
});
```

#### Ręczne logowanie (z własnymi danymi)

```typescript
test('GET /admin/users - admin access', async ({ request }) => {
  // ARRANGE
  const apiClient = new ApiClient(request);

  // Zaloguj się jako administrator (własne dane)
  await apiClient.login('admin', 'admin_password');

  // ACT
  const response = await apiClient.get('/admin/users');

  // ASSERT
  expect(response.status()).toBe(200);
  expect(apiClient.isAuthenticated()).toBe(true);
});
```

#### Testowanie bez autoryzacji

```typescript
test('GET /public - should be accessible without authentication', async ({
  request,
}) => {
  // ARRANGE
  const apiClient = new ApiClient(request);

  // NIE loguj się - test publicznego endpointa

  // ACT
  const response = await apiClient.get('/public/info');

  // ASSERT
  expect(response.status()).toBe(200);
});
```

#### Testowanie wygasłych tokenów

```typescript
test('Should refresh expired token automatically', async ({ request }) => {
  // ARRANGE
  const apiClient = new ApiClient(request);

  // Zaloguj się
  await apiClient.login();

  // Poczekaj aż token wygaśnie (symulacja)
  // W rzeczywistości framework automatycznie odświeży token

  // ACT
  const response = await apiClient.get('/users');

  // ASSERT
  expect(response.status()).toBe(200);
  // Framework automatycznie odświeżył token!
});
```

### Konfiguracja autoryzacji w .env

```bash
# Automatyczna autoryzacja JWT
DEV_USERNAME=admin
DEV_PASSWORD=admin

# LUB użyj bezpośrednio tokena (jeśli go masz)
DEV_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LUB użyj API Key (dla innych systemów)
DEV_API_KEY=your-api-key-here
```

### Bezpieczeństwo

⚠️ **WAŻNE: Nigdy nie commituj pliku .env do repozytorium!**

```bash
# .gitignore powinien zawierać:
.env
```

✅ **Dobre praktyki:**

- Używaj różnych danych dla każdego środowiska
- Rotuj tokeny regularnie
- Nie udostępniaj danych produkcyjnych
- Używaj silnych haseł

---

## 11. Testy wydajnościowe

### Czym są testy wydajnościowe?

Testy wydajnościowe sprawdzają:

- Szybkość odpowiedzi API
- Zachowanie pod obciążeniem
- Limity wydajnościowe

### Prosty test czasu odpowiedzi

```typescript
test('GET /users - should respond within 1 second @performance', async ({
  request,
}) => {
  // ARRANGE
  const apiClient = new ApiClient(request);
  const maxResponseTime = 1000; // 1 sekunda

  // ACT
  const startTime = Date.now();
  const response = await apiClient.get('/users');
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  // ASSERT
  expect(response.status()).toBe(200);
  expect(responseTime).toBeLessThan(maxResponseTime);

  console.log(`Czas odpowiedzi: ${responseTime}ms`);
});
```

### Test obciążeniowy (Load Test)

**Plik: `tests/performance/load-test.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/utils/api-client';

test.describe('Load Tests', () => {
  test('GET /users - should handle 100 concurrent requests @slow', async ({
    request,
  }) => {
    // ARRANGE
    const apiClient = new ApiClient(request);
    const numberOfRequests = 100;
    const maxAverageResponseTime = 2000; // 2 sekundy średnio

    // ACT
    const startTime = Date.now();

    // Wyślij 100 równoczesnych żądań
    const promises = Array.from({ length: numberOfRequests }, () =>
      apiClient.get('/users')
    );

    const responses = await Promise.all(promises);

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / numberOfRequests;

    // ASSERT
    // Sprawdź czy wszystkie żądania zakończyły się sukcesem
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });

    // Sprawdź średni czas odpowiedzi
    expect(averageTime).toBeLessThan(maxAverageResponseTime);

    console.log(`Całkowity czas: ${totalTime}ms`);
    console.log(`Średni czas: ${averageTime}ms`);
    console.log(
      `Żądań/sekundę: ${(numberOfRequests / (totalTime / 1000)).toFixed(2)}`
    );
  });
});
```

### Test stopniowego zwiększania obciążenia

```typescript
test('Stress test - gradual load increase @slow', async ({ request }) => {
  // ARRANGE
  const apiClient = new ApiClient(request);
  const loadLevels = [10, 50, 100, 200];
  const results: { load: number; avgTime: number }[] = [];

  // ACT & ASSERT
  for (const load of loadLevels) {
    const startTime = Date.now();

    const promises = Array.from({ length: load }, () =>
      apiClient.get('/users')
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / load;

    results.push({ load, avgTime });

    // Sprawdź czy API wytrzymuje obciążenie
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });

    console.log(`Load: ${load}, Average time: ${avgTime.toFixed(2)}ms`);
  }

  // Sprawdź czy wydajność nie spada drastycznie
  const firstAvg = results[0].avgTime;
  const lastAvg = results[results.length - 1].avgTime;
  const degradation = (lastAvg - firstAvg) / firstAvg;

  expect(degradation).toBeLessThan(2); // Nie więcej niż 2x wolniej
});
```

---

## 12. Dobre praktyki

### 12.1. Nazewnictwo testów

✅ **DOBRZE:**

```typescript
test('GET /users/{id} - should return 404 when user does not exist @regression', ...)
test('POST /users - should create user with valid data @smoke', ...)
test('PUT /users/{id} - should validate email format @regression', ...)
```

❌ **ŹLE:**

```typescript
test('test1', ...)
test('user test', ...)
test('it works', ...)
```

**Zasady:**

- Zacznij od metody HTTP i endpointa
- Opisz co test sprawdza
- Użyj tagów (@smoke, @regression)
- Bądź konkretny i opisowy

### 12.2. Organizacja testów

✅ **DOBRZE:**

```typescript
test.describe('Users API', () => {
  let apiClient: ApiClient;
  let assertions: ApiAssertions;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request);
    assertions = new ApiAssertions();
    await apiClient.login();
  });

  test.afterEach(async () => {
    await apiClient.logout();
  });

  test.describe('GET /users', () => {
    test('should return all users @smoke', ...)
    test('should filter by role @regression', ...)
  });

  test.describe('POST /users', () => {
    test('should create user @smoke', ...)
    test('should validate email @regression', ...)
  });
});
```

### 12.3. Czyszczenie po testach

```typescript
test.afterEach(async () => {
  // Usuń utworzone dane testowe
  if (createdUserId) {
    await apiClient.delete(`/users/${createdUserId}`);
  }

  // Wyloguj się
  await apiClient.logout();
});
```

### 12.4. Obsługa błędów

✅ **DOBRZE:**

```typescript
test('should handle connection errors gracefully', async ({ request }) => {
  try {
    const response = await apiClient.get('/endpoint');
    expect(response.status()).toBe(200);
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes('ECONNREFUSED')) {
      console.warn('API is offline - test skipped');
      return;
    }

    throw error; // Re-throw unexpected errors
  }
});
```

### 12.5. Tagowanie testów

```typescript
// Testy podstawowe (szybkie, krytyczne)
test('GET /health - should return 200 @smoke', ...)

// Testy szczegółowe (wolniejsze, pełna walidacja)
test('POST /users - should validate all fields @regression', ...)

// Testy wydajnościowe (bardzo wolne)
test('Load test - 1000 requests @performance @slow', ...)

// Testy kontraktowe
test('GET /users - should match contract schema @contract', ...)
```

**Uruchamianie po tagach:**

```bash
npm run test:smoke           # Tylko @smoke
npm run test:regression      # Tylko @regression
npx playwright test --grep @performance  # Tylko @performance
npx playwright test --grep-invert @slow  # Wszystkie OPRÓCZ @slow
```

### 12.6. Używanie stałych

✅ **DOBRZE:**

```typescript
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
};

test('should return 404', async ({ request }) => {
  const response = await apiClient.get('/non-existent');
  expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);
});
```

### 12.7. Komentarze w testach

✅ **DOBRZE:**

```typescript
test('PUT /users/{id} - should update user', async ({ request }) => {
  // ARRANGE
  const apiClient = new ApiClient(request);

  // Najpierw pobierz istniejącego użytkownika
  const usersResponse = await apiClient.get('/users');
  const users = await usersResponse.json();
  const firstUser = users[0];

  const updateData = {
    email: 'updated@example.com',
  };

  // ACT
  const response = await apiClient.put(`/users/${firstUser.id}`, updateData);

  // ASSERT
  expect(response.status()).toBe(200);

  const updatedUser = await response.json();
  expect(updatedUser.email).toBe(updateData.email);
});
```

---

## 13. Zaawansowane techniki

### 13.1. Parametryzowane testy

```typescript
const testCases = [
  { username: 'admin', expectedRole: 'ADMIN' },
  { username: 'user', expectedRole: 'USER' },
  { username: 'moderator', expectedRole: 'MODERATOR' },
];

testCases.forEach(({ username, expectedRole }) => {
  test(`GET /users/${username} - should have ${expectedRole} role`, async ({
    request,
  }) => {
    const apiClient = new ApiClient(request);

    const response = await apiClient.get(`/users/${username}`);
    const user = await response.json();

    expect(user.roles).toContain(expectedRole);
  });
});
```

### 13.2. Testy z zależnościami

```typescript
test.describe.serial('User lifecycle', () => {
  let userId: number;

  test('1. Create user', async ({ request }) => {
    const apiClient = new ApiClient(request);
    const newUser = UserFixtures.createValidUser();

    const response = await apiClient.post('/users', newUser);
    const createdUser = await response.json();

    userId = createdUser.id; // Zapisz ID dla następnych testów
    expect(userId).toBeDefined();
  });

  test('2. Update user', async ({ request }) => {
    const apiClient = new ApiClient(request);
    const updateData = { email: 'updated@example.com' };

    const response = await apiClient.put(`/users/${userId}`, updateData);
    expect(response.status()).toBe(200);
  });

  test('3. Delete user', async ({ request }) => {
    const apiClient = new ApiClient(request);

    const response = await apiClient.delete(`/users/${userId}`);
    expect(response.status()).toBe(200);
  });
});
```

### 13.3. Testowanie z retry

```typescript
test('Flaky endpoint - retry on failure', async ({ request }) => {
  const apiClient = new ApiClient(request);
  let response;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      response = await apiClient.get('/flaky-endpoint');
      if (response.status() === 200) {
        break;
      }
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Czekaj 1s
    }
  }

  expect(response.status()).toBe(200);
});
```

### 13.4. Mockowanie odpowiedzi

```typescript
test('Should handle mocked response', async ({ request }) => {
  // Mock odpowiedzi API
  await request.route('**/api/users', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: 1, name: 'Mocked User' }]),
    });
  });

  const apiClient = new ApiClient(request);
  const response = await apiClient.get('/users');

  const users = await response.json();
  expect(users[0].name).toBe('Mocked User');
});
```

---

## 14. Rozwiązywanie problemów

### Problem 1: API jest niedostępne

**Błąd:**

```
Error: connect ECONNREFUSED 127.0.0.1:4001
```

**Rozwiązanie:**

```bash
# Sprawdź czy Docker działa
docker ps

# Uruchom awesome-localstack
cd awesome-localstack
docker compose up -d

# Sprawdź logi
docker compose logs -f

# Sprawdź czy API odpowiada
curl http://localhost:4001/health
```

### Problem 2: Błąd autoryzacji

**Błąd:**

```
Error: 401 Unauthorized
```

**Rozwiązanie:**

1. Sprawdź dane w `.env`:

```bash
DEV_USERNAME=admin
DEV_PASSWORD=admin
```

2. Sprawdź czy endpoint logowania jest poprawny:

```bash
curl -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

3. Sprawdź logi w trybie debug:

```bash
DEBUG_MODE=true npm test
```

### Problem 3: Timeout

**Błąd:**

```
Error: Timeout of 30000ms exceeded
```

**Rozwiązanie:**

1. Zwiększ timeout w `.env`:

```bash
API_TIMEOUT=60000  # 60 sekund
```

2. Lub w konkretnym teście:

```typescript
test('Slow endpoint', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.get('/slow-endpoint', {
    timeout: 60000, // 60 sekund
  });
});
```

### Problem 4: Błędy walidacji schematu

**Błąd:**

```
Schema validation failed: data.id should be number
```

**Rozwiązanie:**

1. Sprawdź rzeczywistą odpowiedź:

```typescript
const response = await apiClient.get('/users/1');
const data = await response.json();
console.log('Otrzymane dane:', JSON.stringify(data, null, 2));
```

2. Zaktualizuj schemat:

```typescript
export const userSchema: JSONSchemaType<User> = {
  type: 'object',
  properties: {
    id: { type: 'string' }, // Zmień z number na string
    // ...
  },
  // ...
};
```

### Problem 5: ESLint errors

**Błąd:**

```
Error: Delete `␍` (prettier/prettier)
```

**Rozwiązanie:**

```bash
# Napraw automatycznie
npm run code:fix

# Lub tylko prettier
npm run format

# Lub tylko ESLint
npm run lint:fix
```

---

## 15. Ćwiczenia praktyczne

### Ćwiczenie 1: Podstawowy test GET

**Zadanie:** Napisz test, który pobiera listę użytkowników i sprawdza:

- Status 200
- Czy odpowiedź jest tablicą
- Czy tablica ma więcej niż 0 elementów

**Rozwiązanie:**

```typescript
test('GET /users - should return users list @smoke', async ({ request }) => {
  // ARRANGE
  const apiClient = new ApiClient(request);
  const assertions = new ApiAssertions();
  const expectedStatus = 200;

  // ACT
  const response = await apiClient.get('/users');

  // ASSERT
  await assertions.assertStatusCode(response, expectedStatus);

  const users = await response.json();
  expect(Array.isArray(users)).toBe(true);
  expect(users.length).toBeGreaterThan(0);
});
```

### Ćwiczenie 2: Test tworzenia użytkownika

**Zadanie:** Napisz test, który:

1. Tworzy nowego użytkownika (POST)
2. Sprawdza czy został utworzony (status 201)
3. Pobiera utworzonego użytkownika (GET)
4. Usuwa użytkownika (DELETE)

**Rozwiązanie:**

```typescript
test('User CRUD operations @regression', async ({ request }) => {
  const apiClient = new ApiClient(request);
  const newUser = UserFixtures.createValidUser();
  let createdUserId: number;

  // 1. CREATE
  const createResponse = await apiClient.post('/users', newUser);
  expect(createResponse.status()).toBe(201);

  const createdUser = await createResponse.json();
  createdUserId = createdUser.id;
  expect(createdUserId).toBeDefined();

  // 2. READ
  const getResponse = await apiClient.get(`/users/${createdUserId}`);
  expect(getResponse.status()).toBe(200);

  const fetchedUser = await getResponse.json();
  expect(fetchedUser.email).toBe(newUser.email);

  // 3. DELETE
  const deleteResponse = await apiClient.delete(`/users/${createdUserId}`);
  expect(deleteResponse.status()).toBe(200);

  // 4. VERIFY DELETED
  const verifyResponse = await apiClient.get(`/users/${createdUserId}`);
  expect(verifyResponse.status()).toBe(404);
});
```

### Ćwiczenie 3: Test walidacji

**Zadanie:** Napisz test, który sprawdza walidację pola email:

- Pusty email → błąd
- Zły format email → błąd
- Poprawny email → sukces

**Rozwiązanie:**

```typescript
const emailTestCases = [
  { email: '', shouldPass: false, description: 'empty email' },
  { email: 'invalid', shouldPass: false, description: 'invalid format' },
  { email: 'test@example.com', shouldPass: true, description: 'valid email' },
];

emailTestCases.forEach(({ email, shouldPass, description }) => {
  test(`POST /users - ${description} @regression`, async ({ request }) => {
    const apiClient = new ApiClient(request);
    const userData = {
      ...UserFixtures.createValidUser(),
      email: email,
    };

    const response = await apiClient.post('/users', userData);

    if (shouldPass) {
      expect(response.status()).toBe(201);
    } else {
      expect([400, 422]).toContain(response.status());
    }
  });
});
```

### Ćwiczenie 4: Stwórz własny Fixture

**Zadanie:** Stwórz klasę `ProductFixtures` z metodami:

- `createValidProduct()` - produkt z poprawnymi danymi
- `createInvalidProduct()` - produkt z błędami
- `createExpensiveProduct()` - produkt o cenie > 1000

**Rozwiązanie:**

```typescript
// src/fixtures/product.fixtures.ts
import { faker } from '@faker-js/faker';

export class ProductFixtures {
  static createValidProduct() {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 999 })),
      inStock: true,
      categories: [faker.commerce.department()],
      sku: faker.string.alphanumeric(10).toUpperCase(),
    };
  }

  static createInvalidProduct() {
    return {
      name: '', // Empty name - invalid
      description: faker.commerce.productDescription(),
      price: -10, // Negative price - invalid
      inStock: 'yes', // Should be boolean
      categories: [], // Empty array - invalid
    };
  }

  static createExpensiveProduct() {
    return {
      ...this.createValidProduct(),
      price: faker.number.float({ min: 1000, max: 10000, precision: 0.01 }),
    };
  }
}
```

### Ćwiczenie 5: Test wydajnościowy

**Zadanie:** Napisz test, który:

- Wysyła 50 równoległych żądań GET
- Sprawdza czy wszystkie zakończyły się sukcesem
- Mierzy średni czas odpowiedzi
- Sprawdza czy średni czas < 500ms

**Rozwiązanie:**

```typescript
test('GET /users - performance test @performance', async ({ request }) => {
  // ARRANGE
  const apiClient = new ApiClient(request);
  const numberOfRequests = 50;
  const maxAverageTime = 500; // 500ms

  // ACT
  const startTime = Date.now();

  const promises = Array.from({ length: numberOfRequests }, () =>
    apiClient.get('/users')
  );

  const responses = await Promise.all(promises);

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const averageTime = totalTime / numberOfRequests;

  // ASSERT
  responses.forEach(response => {
    expect(response.status()).toBe(200);
  });

  expect(averageTime).toBeLessThan(maxAverageTime);

  console.log(`Total time: ${totalTime}ms`);
  console.log(`Average time: ${averageTime.toFixed(2)}ms`);
  console.log(
    `Requests per second: ${(numberOfRequests / (totalTime / 1000)).toFixed(2)}`
  );
});
```

---

## Podsumowanie

Gratulacje! Ukończyłeś tutorial frameworka testowego API.

### Co teraz umiesz:

✅ Rozumiesz architekturę frameworka
✅ Potrafisz pisać testy zgodnie z wzorcem AAA
✅ Znasz ApiClient i jego możliwości
✅ Umiesz walidować odpowiedzi API
✅ Potrafisz zarządzać danymi testowymi (Fixtures)
✅ Rozumiesz autoryzację JWT
✅ Umiesz pisać testy wydajnościowe
✅ Znasz dobre praktyki testowania API
✅ Potrafisz rozwiązywać typowe problemy

### Następne kroki:

1. **Przećwicz** - napisz własne testy dla Twojego API
2. **Eksperymentuj** - dodaj nowe funkcje do frameworka
3. **Udoskonal** - popraw istniejące testy
4. **Automatyzuj** - dodaj testy do CI/CD
5. **Dziel się wiedzą** - naucz innych

### Przydatne zasoby:

- [Dokumentacja Playwright](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Faker.js Dokumentacja](https://fakerjs.dev/)
- [JSON Schema](https://json-schema.org/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Happy Testing!** 🚀

_Jeśli masz pytania lub napotkałeś problemy, sprawdź [README.md](README.md) lub otwórz issue w repozytorium._
