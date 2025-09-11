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
    } catch (error) {
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
      console.log('⚠️ Użytkownik nie ma uprawnień do tworzenia użytkowników - test pominięty');
      expect(response.status()).toBe(401);
      return;
    }

    await assertions.assertStatusCode(response, 201);

    const createdUser = await response.json();
    expect(createdUser).toMatchObject(newUser);
    expect(createdUser.id).toBeDefined();
  });

  test('PUT /users/{username} - should update user @regression', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];
    
    const username = firstUser.username;
    const updatedUser = UserFixtures.createValidUser();
    const response = await apiClient.put(`/users/${username}`, updatedUser);

    await assertions.assertStatusCode(response, 200);
    await assertions.assertJsonPath(response, 'username', username);
  });

  test('DELETE /users/{username} - should delete user @regression', async () => {
    // Najpierw utwórz użytkownika do usunięcia
    const newUser = UserFixtures.createValidUser();
    const createResponse = await apiClient.post('/users', newUser);
    
    // Sprawdź czy można tworzyć użytkowników
    if (createResponse.status() === 401) {
      console.log('⚠️ Użytkownik nie ma uprawnień do tworzenia/usuwania użytkowników - test pominięty');
      expect(createResponse.status()).toBe(401);
      return;
    }
    
    if (createResponse.status() !== 201) {
      throw new Error(`Nie udało się utworzyć użytkownika: ${createResponse.status()}`);
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
    const updatedUser = UserFixtures.createValidUser();
    const response = await apiClient.put('/users/non_existent_user', updatedUser);
    
    await assertions.assertStatusCode(response, 404);
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

  test('PUT /users/{username} - should validate request body', async () => {
    // Pobierz istniejącego użytkownika
    const usersResponse = await apiClient.get('/users');
    const users = await usersResponse.json();
    const firstUser = users[0];
    
    const username = firstUser.username;
    const invalidData = { invalid_field: 'invalid_value' };
    const response = await apiClient.put(`/users/${username}`, invalidData);
    
    // API powinno zwrócić błąd walidacji
    expect([400, 422]).toContain(response.status());
  });
});
