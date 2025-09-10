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
  });

  test('GET /users - should return all users @smoke', async () => {
    const response = await apiClient.get('/users');

    await assertions.assertStatusCode(response, 200);
    await assertions.assertHeaders(response, {
      'content-type': 'application/json; charset=utf-8',
    });

    const users = await response.json();
    expect(users.length).toBeGreaterThan(0);
  });

  test('GET /users/{id} - should return specific user @regression', async () => {
    const userId = 1;
    const response = await apiClient.get(`/users/${userId}`);

    await assertions.assertStatusCode(response, 200);
    await assertions.assertSchema(response, userSchema);
    await assertions.assertJsonPath(response, 'id', userId);
  });

  test('POST /users - should create new user @regression', async () => {
    const newUser = UserFixtures.createValidUser();
    const response = await apiClient.post('/users', newUser);

    await assertions.assertStatusCode(response, 201);

    const createdUser = await response.json();
    expect(createdUser).toMatchObject(newUser);
    expect(createdUser.id).toBeDefined();
  });

  test('PUT /users/{id} - should update user @regression', async () => {
    const userId = 1;
    const updatedUser = UserFixtures.createValidUser();
    const response = await apiClient.put(`/users/${userId}`, updatedUser);

    await assertions.assertStatusCode(response, 200);
    await assertions.assertJsonPath(response, 'id', userId);
  });

  test('DELETE /users/{id} - should delete user @regression', async () => {
    const userId = 1;
    const response = await apiClient.delete(`/users/${userId}`);

    await assertions.assertStatusCode(response, 200);
  });

  test('GET /users/{id} - should return 404 for non-existent user', async () => {
    const response = await apiClient.get('/users/999999');
    await assertions.assertStatusCode(response, 404);
  });

  test('POST /users - should validate required fields', async () => {
    const invalidUser = UserFixtures.createInvalidUser();
    const response = await apiClient.post('/users', invalidUser);

    // Różne API mogą zwracać różne kody błędów
    expect([400, 422]).toContain(response.status());
  });
});
