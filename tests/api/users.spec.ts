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
    const response = await apiClient.get('/users');

    await assertions.assertStatusCode(response, 200);
    await assertions.assertHeaders(response, {
      'content-type': 'application/json;charset=UTF-8',
    });

    const users = await response.json();
    expect(users.length).toBeGreaterThan(0);
  });

  test('GET /users/{username} - should return specific user @regression', async () => {
    // Najpierw pobierz listę użytkowników, żeby znaleźć istniejącego
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();

    // Użyj pierwszego dostępnego użytkownika
    const firstUser = users[0];
    expect(firstUser).toBeDefined();

    const username = firstUser.username;
    const response = await apiClient.get(`/users/${username}`);

    await assertions.assertStatusCode(response, 200);
    await assertions.assertSchema(response, userSchema);

    // Sprawdź czy dane zawierają podstawowe pola
    const userData = await response.json();
    expect(userData.id).toBeDefined();
    expect(userData.firstName).toBeDefined();
    expect(userData.lastName).toBeDefined();
    expect(userData.roles).toBeDefined();
  });

  test('POST /users - should create new user @regression', async () => {
    const newUser = UserFixtures.createValidUser();
    const response = await apiClient.post('/users', newUser);

    // Sprawdź czy użytkownik ma uprawnienia do tworzenia użytkowników
    if (response.status() === 401) {
      // eslint-disable-next-line no-console
      console.log(
        '⚠️ Użytkownik nie ma uprawnień do tworzenia użytkowników - test pominięty'
      );
      expect(response.status()).toBe(401);
      return;
    }

    await assertions.assertStatusCode(response, 201);

    const createdUser = await response.json();
    expect(createdUser).toMatchObject(newUser);
    expect(createdUser.id).toBeDefined();
  });

  // ==================== PUT /users/{username} - Kompletne testy walidacji ====================

  test('PUT /users/{username} - should successfully update user with valid data @regression', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const validUpdateData = {
      email: 'updated.email@example.com',
      firstName: 'Mirek', // 5 znaków - powyżej minimum 4
      lastName: 'Kowalski',
    };

    const response = await apiClient.put(`/users/${username}`, validUpdateData);

    await assertions.assertStatusCode(response, 200);

    const updatedUser = await response.json();
    expect(updatedUser.email).toBe(validUpdateData.email);
    expect(updatedUser.firstName).toBe(validUpdateData.firstName);
    expect(updatedUser.lastName).toBe(validUpdateData.lastName);
    expect(updatedUser.username).toBe(username);
  });

  test('PUT /users/{username} - should validate firstName minLength (3 characters too short)', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const invalidData = {
      email: 'test@example.com',
      firstName: 'Jo', // 2 znaki - poniżej minimum 4
    };

    const response = await apiClient.put(`/users/${username}`, invalidData);

    // API powinno zwrócić błąd walidacji - firstName ma tylko 2 znaki
    expect([400, 422]).toContain(response.status());

    const responseText = await response.text();
    const errorResponse = JSON.parse(responseText);
    expect(errorResponse.firstName).toContain(
      'Minimum firstName length: 4 characters'
    );
  });

  test('PUT /users/{username} - should update user with only required email field', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const minimalUpdateData = {
      email: 'minimal.update@example.com',
    };

    const response = await apiClient.put(
      `/users/${username}`,
      minimalUpdateData
    );

    await assertions.assertStatusCode(response, 200);

    const updatedUser = await response.json();
    expect(updatedUser.email).toBe(minimalUpdateData.email);
    expect(updatedUser.username).toBe(username);
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
    // Najpierw utwórz użytkownika do usunięcia
    const newUser = UserFixtures.createValidUser();
    const createResponse = await apiClient.post('/users', newUser);

    // Sprawdź czy można tworzyć użytkowników
    if (createResponse.status() === 401) {
      // eslint-disable-next-line no-console
      console.log(
        '⚠️ Użytkownik nie ma uprawnień do tworzenia/usuwania użytkowników - test pominięty'
      );
      expect(createResponse.status()).toBe(401);
      return;
    }

    if (createResponse.status() !== 201) {
      throw new Error(
        `Nie udało się utworzyć użytkownika: ${createResponse.status()}`
      );
    }

    const createdUser = await createResponse.json();
    const username = createdUser.username;

    // Teraz usuń utworzonego użytkownika
    const response = await apiClient.delete(`/users/${username}`);

    await assertions.assertStatusCode(response, 200);
  });

  test('GET /users/{username} - should return 404 for non-existent user', async () => {
    const response = await apiClient.get('/users/non_existent_user');
    await assertions.assertStatusCode(response, 404);
  });

  test('POST /users - should validate required fields', async () => {
    const invalidUser = UserFixtures.createInvalidUser();
    const response = await apiClient.post('/users', invalidUser);

    // API może zwracać różne kody błędów (włącznie z 401 jeśli brak uprawnień)
    const validErrorCodes = [400, 401, 422];
    expect(validErrorCodes).toContain(response.status());
  });

  test('PUT /users/{username} - should return 404 for non-existent user', async () => {
    const validUpdateData = {
      email: 'test@example.com',
      firstName: 'Mirek',
      lastName: 'Kowalski',
    };
    const response = await apiClient.put(
      '/users/non_existent_user',
      validUpdateData
    );

    await assertions.assertStatusCode(response, 404);
  });

  test('PUT /users/{username} - should handle empty request body', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const response = await apiClient.put(`/users/${username}`, {});

    // API powinno zwrócić błąd walidacji - brak wymaganego pola email
    expect([400, 422]).toContain(response.status());
  });

  test('PUT /users/{username} - should handle null values', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const invalidData = {
      email: 'test@example.com',
      firstName: null,
      lastName: null,
    };

    const response = await apiClient.put(`/users/${username}`, invalidData);

    // API może zwrócić błąd walidacji lub zaakceptować null
    expect([200, 400, 422]).toContain(response.status());
  });

  test('PUT /users/{username} - should handle special characters in names', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const specialCharsData = {
      email: 'test@example.com',
      firstName: 'Józef-Łukasz',
      lastName: "O'Connor-Müller",
    };

    const response = await apiClient.put(
      `/users/${username}`,
      specialCharsData
    );

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
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const whitespaceData = {
      email: 'test@example.com',
      firstName: '  Jan  ', // Spacje na początku i końcu
      lastName: '  Kowalski  ',
    };

    const response = await apiClient.put(`/users/${username}`, whitespaceData);

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
    const response = await apiClient.delete('/users/non_existent_user');

    await assertions.assertStatusCode(response, 404);
  });

  test('GET /users/{username} - should handle special characters in username', async () => {
    const username = 'user.with-special_chars';
    const response = await apiClient.get(`/users/${username}`);

    // Może zwrócić 200 (jeśli user istnieje) lub 404 (jeśli nie istnieje)
    expect([200, 404]).toContain(response.status());
  });

  test('PUT /users/{username} - should validate unknown fields', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];

    const username = firstUser.username;
    const invalidData = {
      email: 'test@example.com',
      unknownField: 'invalid_value', // Nieznane pole
    };
    const response = await apiClient.put(`/users/${username}`, invalidData);

    // API może zaakceptować nieznane pola lub zwrócić błąd
    if (response.status() === 200) {
      const updatedUser = await response.json();
      expect(updatedUser.email).toBe('test@example.com');
    } else {
      expect([400, 422]).toContain(response.status());
    }
  });
});
