# 📋 Historia zmian

## 🎯 **Wersja 2.0.0 - Autoryzacja JWT** (2025-01-16)

### ✅ **Dodane funkcjonalności:**

#### **🔐 Autoryzacja JWT**
- **`AuthManager`** - kompleksowe zarządzanie tokenami JWT
- **Automatyczne logowanie** z danymi z konfiguracji środowiska
- **Automatyczne odświeżanie tokenów** przy wygaśnięciu
- **Graceful error handling** dla błędów połączenia i autoryzacji
- **Obsługa różnych środowisk** (dev/staging/prod)

#### **🛠️ Rozszerzone API Client**
- **Automatyczne dodawanie nagłówków autoryzacji** do wszystkich żądań
- **Metody zarządzania sesją**: `login()`, `logout()`, `isAuthenticated()`, `getToken()`
- **Asynchroniczne nagłówki** z lazy loading tokenów
- **Fallback na tokeny z konfiguracji** środowiska

#### **⚙️ Konfiguracja środowiska**
- **Wsparcie dla danych logowania** (`username`, `password`)
- **Aktualizacja dla awesome-localstack** (`http://localhost:4001`)
- **Dokumentacja konfiguracji** w README

#### **🧪 Testy autoryzacji**
- **Kompletny zestaw testów JWT** w `auth.spec.ts`
- **Inteligentne obsługiwanie błędów** (offline API vs błędne dane)
- **Testy przepływu autoryzacji** (login → request → logout)
- **Informacyjne komunikaty** dla różnych scenariuszy

### 🧹 **Usunięte pliki eksploracyjne:**
- ❌ `connection-test.spec.ts`
- ❌ `url-test.spec.ts` 
- ❌ `simple-auth-test.spec.ts`

### 📚 **Zaktualizowana dokumentacja:**
- **README.md** - sekcje o autoryzacji JWT i awesome-localstack
- **Instrukcje konfiguracji** danych logowania
- **Przykłady użycia** frameworka autoryzacji

### 🎯 **Kompatybilność:**
- **Backward compatible** - stare testy nadal działają
- **Graceful degradation** - framework działa bez API
- **Elastyczna konfiguracja** - można używać z różnymi API

---

## 📈 **Wersja 1.0.0 - Framework podstawowy**

### ✅ **Funkcjonalności bazowe:**
- **Playwright** jako silnik testowy
- **TypeScript** z pełnym typowaniem
- **Multi-environment** support (dev/staging/prod)
- **Modułowa architektura** (models, fixtures, helpers, utils)
- **Walidacja schematów JSON** z Ajv
- **Raporty testowe** (HTML, Allure)
- **Code quality** (ESLint, Prettier, Husky)

### 📁 **Struktura projektu:**
```
src/
├── config/environment.ts      # Zarządzanie środowiskami
├── fixtures/user.fixtures.ts  # Dane testowe
├── helpers/api-assertions.ts  # Asercje API
├── models/user.model.ts       # Modele danych
├── schemas/user.schema.ts     # Schematy walidacji
└── utils/
    ├── api-client.ts          # HTTP client
    └── schema-validator.ts    # Walidator schematów

tests/
├── api/users.spec.ts          # Testy API
├── contract/user-contract.spec.ts  # Testy kontraktowe
└── performance/load-test.spec.ts   # Testy wydajnościowe
```

---

## 🚀 **Następne kroki:**

### **Planowane funkcjonalności:**
- 🔄 **Integracja z prawdziwymi danymi** z awesome-localstack
- 📊 **Rozszerzone modele danych** (produkty, zamówienia, etc.)
- 🧪 **Testy end-to-end** całych przepływów biznesowych
- 📈 **Metryki i monitoring** testów
- 🤖 **CI/CD pipeline** z automatycznymi testami
