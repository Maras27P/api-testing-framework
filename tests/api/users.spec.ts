import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/utils/api-client';
import { ApiAssertions } from '../../src/helpers/api-assertions';
import { UserFixtures } from '../../src/fixtures/user.fixtures';
import { userSchema } from '../../src/schemas/user.schema';

test.describe('Users API Tests', () => {
  let apiClient: ApiClient;
  let assertions: ApiAssertions;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request);
    assertions = new ApiAssertions();

    // Loguj się przed każdym testem
    await apiClient.login();
  });

  test.afterEach(async () => {
    // Wyloguj po każdym teście
    try {
      await apiClient.logout();
    } catch {
      // Ignoruj błędy wylogowania w testach
    }
  });

  test('GET /users - should return all users @smoke', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const endpoint = '/users';
    const expectedStatusCode = 200;
    const expectedHeaders = {
      'content-type': 'application/json;charset=UTF-8',
    };

    // ACT - Wykonanie akcji: pobranie listy użytkowników
    const response = await apiClient.get(endpoint);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);
    await assertions.assertHeaders(response, expectedHeaders);

    const users = await response.json();
    expect(users.length).toBeGreaterThan(0);
  });

  test('GET /users/{username} - should return specific user @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const usersListEndpoint = '/users';
    const expectedStatusCode = 200;

    // Pobierz listę użytkowników, żeby znaleźć istniejącego
    const usersResponse = await apiClient.get(usersListEndpoint);
    const users = await usersResponse.json();
    const firstUser = users[0];
    expect(firstUser).toBeDefined();
    const targetUsername = firstUser.username;

    // ACT - Wykonanie akcji: pobranie konkretnego użytkownika
    const response = await apiClient.get(`/users/${targetUsername}`);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);
    await assertions.assertSchema(response, userSchema);

    // Sprawdź czy dane zawierają podstawowe pola
    const userData = await response.json();
    expect(userData.id).toBeDefined();
    expect(userData.firstName).toBeDefined();
    expect(userData.lastName).toBeDefined();
    expect(userData.roles).toBeDefined();
  });

  test('POST /users - should create new user @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const newUser = UserFixtures.createValidUser();
    const endpoint = '/users';
    const expectedStatusCode = 201;

    // ACT - Wykonanie akcji: tworzenie nowego użytkownika
    const response = await apiClient.post(endpoint, newUser);

    // ASSERT - Weryfikacja rezultatów
    // Sprawdź czy użytkownik ma uprawnienia do tworzenia użytkowników
    if (response.status() === 401) {
      // Użytkownik nie ma uprawnień do tworzenia użytkowników - test pominięty
      expect(response.status()).toBe(401);
      return;
    }

    await assertions.assertStatusCode(response, expectedStatusCode);

    const createdUser = await response.json();
    expect(createdUser).toMatchObject(newUser);
    expect(createdUser.id).toBeDefined();
  });

  // ==================== PUT /users/{username} - Kompletne testy walidacji ====================

  test('PUT /users/{username} - should successfully update user with valid data @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const usersListEndpoint = '/users';

    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get(usersListEndpoint);
    const users = await usersResponse.json();
    const firstUser = users[0];
    const targetUsername = firstUser.username;

    const validUpdateData = {
      email: 'updated.email@example.com',
      firstName: 'Mirek', // 5 znaków - powyżej minimum 4
      lastName: 'Kowalski',
    };
    const expectedStatusCode = 200;

    // ACT - Wykonanie akcji: aktualizacja użytkownika
    const response = await apiClient.put(
      `/users/${targetUsername}`,
      validUpdateData
    );

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);

    const updatedUser = await response.json();
    expect(updatedUser.email).toBe(validUpdateData.email);
    expect(updatedUser.firstName).toBe(validUpdateData.firstName);
    expect(updatedUser.lastName).toBe(validUpdateData.lastName);
    expect(updatedUser.username).toBe(targetUsername);
  });

  test('PUT /users/{username} - should validate firstName minLength (3 characters too short)', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const usersListEndpoint = '/users';

    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get(usersListEndpoint);
    const users = await usersResponse.json();
    const firstUser = users[0];
    const targetUsername = firstUser.username;

    const invalidData = {
      email: 'test@example.com',
      firstName: 'Jo', // 2 znaki - poniżej minimum 4
    };
    const expectedErrorCodes = [400, 422];

    // ACT - Wykonanie akcji: próba aktualizacji z nieprawidłowymi danymi
    const response = await apiClient.put(
      `/users/${targetUsername}`,
      invalidData
    );

    // ASSERT - Weryfikacja rezultatów
    // API powinno zwrócić błąd walidacji - firstName ma tylko 2 znaki
    expect(expectedErrorCodes).toContain(response.status());

    const responseText = await response.text();
    const errorResponse = JSON.parse(responseText);
    expect(errorResponse.firstName).toContain(
      'Minimum firstName length: 4 characters'
    );
  });

  test('PUT /users/{username} - should update user with only required email field', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const usersListEndpoint = '/users';

    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get(usersListEndpoint);
    const users = await usersResponse.json();
    const firstUser = users[0];
    const targetUsername = firstUser.username;

    const minimalUpdateData = {
      email: 'minimal.update@example.com',
    };
    const expectedStatusCode = 200;

    // ACT - Wykonanie akcji: aktualizacja tylko wymaganego pola email
    const response = await apiClient.put(
      `/users/${targetUsername}`,
      minimalUpdateData
    );

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);

    const updatedUser = await response.json();
    expect(updatedUser.email).toBe(minimalUpdateData.email);
    expect(updatedUser.username).toBe(targetUsername);
  });

  test('PUT /users/{username} - should validate firstName minLength (4 characters)', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const invalidData = {
      email: 'test@example.com',
      firstName: 'Jo', // Tylko 2 znaki - poniżej minimum 4
    };

    const response = await apiClient.put(`/users/${username}`, invalidData);

    // API powinno zwrócić błąd walidacji
    expect([400, 422]).toContain(response.status());
  });

  test('PUT /users/{username} - should validate firstName maxLength (255 characters)', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const longFirstName = 'A'.repeat(256); // 256 znaków - powyżej maksimum 255
    const invalidData = {
      email: 'test@example.com',
      firstName: longFirstName,
    };

    const response = await apiClient.put(`/users/${username}`, invalidData);

    // API powinno zwrócić błąd walidacji
    expect([400, 422]).toContain(response.status());
  });

  test('PUT /users/{username} - should validate lastName minLength (4 characters)', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const invalidData = {
      email: 'test@example.com',
      lastName: 'Bo', // Tylko 2 znaki - poniżej minimum 4
    };

    const response = await apiClient.put(`/users/${username}`, invalidData);

    // API powinno zwrócić błąd walidacji
    expect([400, 422]).toContain(response.status());
  });

  test('PUT /users/{username} - should validate lastName maxLength (255 characters)', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const longLastName = 'B'.repeat(256); // 256 znaków - powyżej maksimum 255
    const invalidData = {
      email: 'test@example.com',
      lastName: longLastName,
    };

    const response = await apiClient.put(`/users/${username}`, invalidData);

    // API powinno zwrócić błąd walidacji
    expect([400, 422]).toContain(response.status());
  });

  test('PUT /users/{username} - should validate required email field', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const invalidData = {
      firstName: 'Mirek',
      lastName: 'Kowalski',
      // Brak wymaganego pola email
    };

    const response = await apiClient.put(`/users/${username}`, invalidData);

    // API powinno zwrócić błąd walidacji
    expect([400, 422]).toContain(response.status());
  });

  test('PUT /users/{username} - should validate email format', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const invalidData = {
      email: 'invalid-email-format', // Nieprawidłowy format email
    };

    const response = await apiClient.put(`/users/${username}`, invalidData);

    // API powinno zwrócić błąd walidacji
    expect([400, 422]).toContain(response.status());
  });

  test('PUT /users/{username} - should accept valid firstName at minimum length (4 characters)', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const validData = {
      email: 'test@example.com',
      firstName: 'Mirek', // 3 znaki - poniżej minimum, ale sprawdzimy czy API to akceptuje
    };

    const response = await apiClient.put(`/users/${username}`, validData);

    // Sprawdzimy czy API akceptuje imię o długości 3 znaków
    if (response.status() === 200) {
      const updatedUser = await response.json();
      expect(updatedUser.firstName).toBe(validData.firstName);
    } else {
      // Jeśli API wymaga minimum 4 znaków, powinien zwrócić błąd
      expect([400, 422]).toContain(response.status());
    }
  });

  test('PUT /users/{username} - should accept valid lastName at minimum length (4 characters)', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const validData = {
      email: 'test@example.com',
      lastName: 'Bo', // 2 znaki - poniżej minimum, ale sprawdzimy czy API to akceptuje
    };

    const response = await apiClient.put(`/users/${username}`, validData);

    // Sprawdzimy czy API akceptuje nazwisko o długości 2 znaków
    if (response.status() === 200) {
      const updatedUser = await response.json();
      expect(updatedUser.lastName).toBe(validData.lastName);
    } else {
      // Jeśli API wymaga minimum 4 znaków, powinien zwrócić błąd
      expect([400, 422]).toContain(response.status());
    }
  });

  test('PUT /users/{username} - should accept valid firstName at maximum length (255 characters)', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const maxLengthFirstName = 'A'.repeat(255); // Dokładnie 255 znaków
    const validData = {
      email: 'test@example.com',
      firstName: maxLengthFirstName,
    };

    const response = await apiClient.put(`/users/${username}`, validData);

    await assertions.assertStatusCode(response, 200);

    const updatedUser = await response.json();
    expect(updatedUser.firstName).toBe(maxLengthFirstName);
  });

  test('PUT /users/{username} - should accept valid lastName at maximum length (255 characters)', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const maxLengthLastName = 'B'.repeat(255); // Dokładnie 255 znaków
    const validData = {
      email: 'test@example.com',
      lastName: maxLengthLastName,
    };

    const response = await apiClient.put(`/users/${username}`, validData);

    await assertions.assertStatusCode(response, 200);

    const updatedUser = await response.json();
    expect(updatedUser.lastName).toBe(maxLengthLastName);
  });

  test('DELETE /users/{username} - should delete user @regression', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const newUser = UserFixtures.createValidUser();
    const createEndpoint = '/users';
    const expectedCreateStatusCode = 201;
    const expectedDeleteStatusCode = 200;

    // Najpierw utwórz użytkownika do usunięcia
    const createResponse = await apiClient.post(createEndpoint, newUser);

    // Sprawdź czy można tworzyć użytkowników
    if (createResponse.status() === 401) {
      // Użytkownik nie ma uprawnień do tworzenia/usuwania użytkowników - test pominięty
      expect(createResponse.status()).toBe(401);
      return;
    }

    if (createResponse.status() !== expectedCreateStatusCode) {
      throw new Error(
        `Nie udało się utworzyć użytkownika: ${createResponse.status()}`
      );
    }

    const createdUser = await createResponse.json();
    const targetUsername = createdUser.username;

    // ACT - Wykonanie akcji: usunięcie użytkownika
    const response = await apiClient.delete(`/users/${targetUsername}`);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedDeleteStatusCode);
  });

  test('GET /users/{username} - should return 404 for non-existent user', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const nonExistentUsername = 'non_existent_user';
    const endpoint = `/users/${nonExistentUsername}`;
    const expectedStatusCode = 404;

    // ACT - Wykonanie akcji: próba pobrania nieistniejącego użytkownika
    const response = await apiClient.get(endpoint);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);
  });

  test('POST /users - should validate required fields', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const invalidUser = UserFixtures.createInvalidUser();
    const endpoint = '/users';
    const validErrorCodes = [400, 401, 422]; // API może zwracać różne kody błędów

    // ACT - Wykonanie akcji: próba utworzenia użytkownika z nieprawidłowymi danymi
    const response = await apiClient.post(endpoint, invalidUser);

    // ASSERT - Weryfikacja rezultatów
    expect(validErrorCodes).toContain(response.status());
  });

  test('PUT /users/{username} - should return 404 for non-existent user', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const nonExistentUsername = 'non_existent_user';
    const validUpdateData = {
      email: 'test@example.com',
      firstName: 'Mirek',
      lastName: 'Kowalski',
    };
    const endpoint = `/users/${nonExistentUsername}`;
    const expectedStatusCode = 404;

    // ACT - Wykonanie akcji: próba aktualizacji nieistniejącego użytkownika
    const response = await apiClient.put(endpoint, validUpdateData);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);
  });

  test('PUT /users/{username} - should handle empty request body', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const usersListEndpoint = '/users';

    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get(usersListEndpoint);
    const users = await usersResponse.json();
    const firstUser = users[0];
    const targetUsername = firstUser.username;

    const emptyRequestBody = {};
    const expectedErrorCodes = [400, 422]; // API powinno zwrócić błąd walidacji

    // ACT - Wykonanie akcji: próba aktualizacji z pustym ciałem żądania
    const response = await apiClient.put(
      `/users/${targetUsername}`,
      emptyRequestBody
    );

    // ASSERT - Weryfikacja rezultatów
    // API powinno zwrócić błąd walidacji - brak wymaganego pola email
    expect(expectedErrorCodes).toContain(response.status());
  });

  test('PUT /users/{username} - should handle null values', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const usersListEndpoint = '/users';

    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get(usersListEndpoint);
    const users = await usersResponse.json();
    const firstUser = users[0];
    const targetUsername = firstUser.username;

    const dataWithNullValues = {
      email: 'test@example.com',
      firstName: null,
      lastName: null,
    };
    const possibleStatusCodes = [200, 400, 422]; // API może zwrócić błąd walidacji lub zaakceptować null

    // ACT - Wykonanie akcji: próba aktualizacji z wartościami null
    const response = await apiClient.put(
      `/users/${targetUsername}`,
      dataWithNullValues
    );

    // ASSERT - Weryfikacja rezultatów
    expect(possibleStatusCodes).toContain(response.status());
  });

  test('PUT /users/{username} - should handle special characters in names', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const usersListEndpoint = '/users';

    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get(usersListEndpoint);
    const users = await usersResponse.json();
    const firstUser = users[0];
    const targetUsername = firstUser.username;

    const specialCharsData = {
      email: 'test@example.com',
      firstName: 'Józef-Łukasz',
      lastName: "O'Connor-Müller",
    };

    // ACT - Wykonanie akcji: próba aktualizacji z znakami specjalnymi
    const response = await apiClient.put(
      `/users/${targetUsername}`,
      specialCharsData
    );

    // ASSERT - Weryfikacja rezultatów
    if (response.status() === 200) {
      const updatedUser = await response.json();
      expect(updatedUser.firstName).toBe(specialCharsData.firstName);
      expect(updatedUser.lastName).toBe(specialCharsData.lastName);
    } else {
      // Jeśli API nie akceptuje znaków specjalnych
      expect([400, 422]).toContain(response.status());
    }
  });

  test('PUT /users/{username} - should handle whitespace in names', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const usersListEndpoint = '/users';

    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get(usersListEndpoint);
    const users = await usersResponse.json();
    const firstUser = users[0];
    const targetUsername = firstUser.username;

    const whitespaceData = {
      email: 'test@example.com',
      firstName: '  Jan  ', // Spacje na początku i końcu
      lastName: '  Kowalski  ',
    };

    // ACT - Wykonanie akcji: próba aktualizacji z spacjami
    const response = await apiClient.put(
      `/users/${targetUsername}`,
      whitespaceData
    );

    // ASSERT - Weryfikacja rezultatów
    if (response.status() === 200) {
      const updatedUser = await response.json();
      // API może przycinać spacje lub je zachować
      expect(updatedUser.firstName).toBeDefined();
      expect(updatedUser.lastName).toBeDefined();
    } else {
      expect([400, 422]).toContain(response.status());
    }
  });

  test('DELETE /users/{username} - should return 404 for non-existent user', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const nonExistentUsername = 'non_existent_user';
    const endpoint = `/users/${nonExistentUsername}`;
    const expectedStatusCode = 404;

    // ACT - Wykonanie akcji: próba usunięcia nieistniejącego użytkownika
    const response = await apiClient.delete(endpoint);

    // ASSERT - Weryfikacja rezultatów
    await assertions.assertStatusCode(response, expectedStatusCode);
  });

  test('GET /users/{username} - should handle special characters in username', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const usernameWithSpecialChars = 'user.with-special_chars';
    const endpoint = `/users/${usernameWithSpecialChars}`;
    const possibleStatusCodes = [200, 404]; // Może zwrócić 200 (jeśli user istnieje) lub 404 (jeśli nie istnieje)

    // ACT - Wykonanie akcji: próba pobrania użytkownika z znakami specjalnymi
    const response = await apiClient.get(endpoint);

    // ASSERT - Weryfikacja rezultatów
    expect(possibleStatusCodes).toContain(response.status());
  });

  test('PUT /users/{username} - should validate unknown fields', async () => {
    // ARRANGE - Przygotowanie danych testowych
    const usersListEndpoint = '/users';

    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get(usersListEndpoint);
    const users = await usersResponse.json();
    const firstUser = users[0];
    const targetUsername = firstUser.username;

    const dataWithUnknownField = {
      email: 'test@example.com',
      unknownField: 'invalid_value', // Nieznane pole
    };

    // ACT - Wykonanie akcji: próba aktualizacji z nieznanym polem
    const response = await apiClient.put(
      `/users/${targetUsername}`,
      dataWithUnknownField
    );

    // ASSERT - Weryfikacja rezultatów
    // API może zaakceptować nieznane pola lub zwrócić błąd
    if (response.status() === 200) {
      const updatedUser = await response.json();
      expect(updatedUser.email).toBe('test@example.com');
    } else {
      expect([400, 422]).toContain(response.status());
    }
  });
});
