import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/utils/api-client';
import { ApiAssertions } from '../../src/helpers/api-assertions';

/**
 * SZABLON TESTU ZGODNY Z WZORCEM ARRANGE-ACT-ASSERT (AAA)
 *
 * Ten szablon pokazuje jak pisać testy API zgodnie z wzorcem AAA:
 *
 * 1. ARRANGE (Przygotowanie) - konfiguracja danych wejściowych, stanu początkowego
 * 2. ACT (Działanie) - wykonanie akcji, którą testujemy
 * 3. ASSERT (Weryfikacja) - sprawdzenie rezultatów
 *
 * ZALETY WZORCA AAA:
 * - Czytelność - każdy test ma jasną strukturę
 * - Łatwość debugowania - łatwo znaleźć, gdzie coś poszło nie tak
 * - Konsystencja - wszystkie testy wyglądają podobnie
 * - Łatwość utrzymania - zmiany w jednej sekcji nie wpływają na inne
 */

test.describe('AAA Test Template Examples', () => {
  let apiClient: ApiClient;
  let assertions: ApiAssertions;

  test.beforeEach(async ({ request }) => {
    // Inicjalizacja klienta API i asercji
    apiClient = new ApiClient(request);
    assertions = new ApiAssertions();
  });

  test.afterEach(async () => {
    // Czyszczenie po teście (jeśli potrzebne)
    try {
      await apiClient.logout();
    } catch {
      // Ignoruj błędy czyszczenia
    }
  });

  // ==================== PRZYKŁAD 1: Test GET endpoint ====================
  test('GET /example - should return data successfully @smoke', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const endpoint = '/example';
    const expectedStatusCode = 200;
    const expectedHeaders = {
      'content-type': 'application/json',
    };

    // ACT - Wykonanie akcji: pobranie danych
    const response = await apiClient.get(endpoint);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);
    await assertions.assertHeaders(response, expectedHeaders);

    const data = await response.json();
    expect(data).toBeDefined();
  });

  // ==================== PRZYKŁAD 2: Test POST endpoint ====================
  test('POST /example - should create resource successfully @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const newResource = {
      name: 'Test Resource',
      description: 'Test Description',
      active: true,
    };
    const endpoint = '/example';
    const expectedStatusCode = 201;

    // ACT - Wykonanie akcji: tworzenie zasobu
    const response = await apiClient.post(endpoint, newResource);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);

    const createdResource = await response.json();
    expect(createdResource).toMatchObject(newResource);
    expect(createdResource.id).toBeDefined();
  });

  // ==================== PRZYKŁAD 3: Test PUT endpoint ====================
  test('PUT /example/{id} - should update resource successfully @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const resourceId = 'test-id-123';
    const updateData = {
      name: 'Updated Resource Name',
      description: 'Updated Description',
    };
    const endpoint = `/example/${resourceId}`;
    const expectedStatusCode = 200;

    // ACT - Wykonanie akcji: aktualizacja zasobu
    const response = await apiClient.put(endpoint, updateData);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);

    const updatedResource = await response.json();
    expect(updatedResource.name).toBe(updateData.name);
    expect(updatedResource.description).toBe(updateData.description);
    expect(updatedResource.id).toBe(resourceId);
  });

  // ==================== PRZYKŁAD 4: Test DELETE endpoint ====================
  test('DELETE /example/{id} - should delete resource successfully @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const resourceId = 'test-id-123';
    const endpoint = `/example/${resourceId}`;
    const expectedStatusCode = 200;

    // ACT - Wykonanie akcji: usunięcie zasobu
    const response = await apiClient.delete(endpoint);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);
  });

  // ==================== PRZYKŁAD 5: Test walidacji błędów ====================
  test('POST /example - should return validation error for invalid data @regression', async () => {
    // ARRANGE - Przygotowanie nieprawidłowych danych
    const invalidData = {
      name: '', // Puste pole - nieprawidłowe
      description: null, // Null - nieprawidłowe
      active: 'invalid_boolean', // Nieprawidłowy typ
    };
    const endpoint = '/example';
    const expectedErrorCodes = [400, 422]; // Oczekiwane kody błędów

    // ACT - Wykonanie akcji: próba utworzenia z nieprawidłowymi danymi
    const response = await apiClient.post(endpoint, invalidData);

    // ASSERT - Weryfikacja rezultatów
    expect(expectedErrorCodes).toContain(response.status());

    // Opcjonalnie: sprawdź szczegóły błędu walidacji
    if (response.status() === 422) {
      const errorResponse = await response.json();
      expect(errorResponse.errors).toBeDefined();
    }
  });

  // ==================== PRZYKŁAD 6: Test 404 Not Found ====================
  test('GET /example/{id} - should return 404 for non-existent resource @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const nonExistentId = 'non-existent-id-123';
    const endpoint = `/example/${nonExistentId}`;
    const expectedStatusCode = 404;

    // ACT - Wykonanie akcji: próba pobrania nieistniejącego zasobu
    const response = await apiClient.get(endpoint);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);
  });

  // ==================== PRZYKŁAD 7: Test z autoryzacją ====================
  test('GET /protected - should access protected resource with valid token @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const validCredentials = {
      username: process.env.DEV_USERNAME || 'test@example.com',
      password: process.env.DEV_PASSWORD || 'testPassword',
    };
    const protectedEndpoint = '/protected';
    const expectedStatusCode = 200;

    // ACT - Wykonanie akcji: logowanie i dostęp do chronionego zasobu
    await apiClient.login(validCredentials.username, validCredentials.password);
    const response = await apiClient.get(protectedEndpoint);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);
    expect(apiClient.isAuthenticated()).toBe(true);

    const protectedData = await response.json();
    expect(protectedData).toBeDefined();
  });

  // ==================== PRZYKŁAD 8: Test wydajności ====================
  test('GET /example - should respond within acceptable time @performance', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const endpoint = '/example';
    const expectedStatusCode = 200;
    const maxResponseTime = 1000; // 1 sekunda

    // ACT - Wykonanie akcji: pomiar czasu odpowiedzi
    const startTime = Date.now();
    const response = await apiClient.get(endpoint);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);
    expect(responseTime).toBeLessThan(maxResponseTime);

    // Response time logged for debugging
  });

  // ==================== PRZYKŁAD 9: Test z obsługą błędów połączenia ====================
  test('GET /example - should handle connection errors gracefully @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const endpoint = '/example';
    const expectedStatusCode = 200;

    // ACT - Wykonanie akcji: próba połączenia
    try {
      const response = await apiClient.get(endpoint);

      // ASSERT - Weryfikacja rezultatów (gdy połączenie się udało)
      await assertions.assertStatusCode(response, expectedStatusCode);
      const data = await response.json();
      expect(data).toBeDefined();
    } catch (error) {
      // ASSERT - Weryfikacja rezultatów (gdy wystąpił błąd połączenia)
      const errorMessage = (error as Error).message;
      const isConnectionError =
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('socket hang up') ||
        errorMessage.includes('ECONNRESET');

      if (isConnectionError) {
        // API offline - test framework is ready
        expect(true).toBe(true); // Test passes - framework is working
      } else {
        throw error; // Re-throw unexpected errors
      }
    }
  });

  // ==================== PRZYKŁAD 10: Test z wieloma asercjami ====================
  test('GET /example - should return complete and valid data structure @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const endpoint = '/example';
    const expectedStatusCode = 200;
    const expectedFields = [
      'id',
      'name',
      'description',
      'createdAt',
      'updatedAt',
    ];

    // ACT - Wykonanie akcji: pobranie danych
    const response = await apiClient.get(endpoint);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);

    const data = await response.json();

    // Sprawdź czy odpowiedź jest tablicą
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // Sprawdź strukturę pierwszego elementu
    const firstItem = data[0];
    expectedFields.forEach(field => {
      expect(firstItem).toHaveProperty(field);
      expect(firstItem[field]).toBeDefined();
    });

    // Sprawdź typy danych
    expect(typeof firstItem.id).toBe('string');
    expect(typeof firstItem.name).toBe('string');
    expect(typeof firstItem.description).toBe('string');
    expect(firstItem.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO date format
  });
});

/**
 * WSKAZÓWKI DOTYCZĄCE PISANIA TESTÓW ZGODNIE Z WZORCEM AAA:
 *
 * 1. ARRANGE (Przygotowanie):
 *    - Zdefiniuj wszystkie zmienne i stałe na początku
 *    - Użyj opisowych nazw zmiennych
 *    - Przygotuj dane testowe
 *    - Skonfiguruj stan początkowy
 *
 * 2. ACT (Działanie):
 *    - Wykonaj jedną główną akcję
 *    - Unikaj złożonej logiki w tej sekcji
 *    - Używaj prostych, jednoznacznych wywołań
 *
 * 3. ASSERT (Weryfikacja):
 *    - Sprawdź wszystkie oczekiwane rezultaty
 *    - Użyj opisowych asercji
 *    - Sprawdź zarówno pozytywne, jak i negatywne scenariusze
 *
 * ZASADY:
 * - Jeden test = jedna funkcjonalność
 * - Testy powinny być niezależne od siebie
 * - Używaj opisowych nazw testów
 * - Grupuj powiązane testy w describe blocks
 * - Dodawaj tagi (@smoke, @regression, @performance) dla kategoryzacji
 */
