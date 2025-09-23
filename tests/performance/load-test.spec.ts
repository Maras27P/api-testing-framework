import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/utils/api-client';

test.describe('Performance Tests', () => {
  test('Load test - multiple concurrent requests', async ({ request }) => {
    // ARRANGE - Przygotowanie danych testowych
    const apiClient = new ApiClient(request);
    const concurrentRequests = 10;
    const endpoint = '/users';
    const expectedStatusCode = 200;
    const maxResponseTime = 5000; // 5 sekund dla 10 żądań

    // ACT - Wykonanie akcji: równoczesne żądania
    const startTime = Date.now();
    const promises = Array.from({ length: concurrentRequests }, () =>
      apiClient.get(endpoint)
    );
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // ASSERT - Weryfikacja rezultatów
    // Sprawdź czy wszystkie żądania się powiodły
    responses.forEach(response => {
      expect(response.status()).toBe(expectedStatusCode);
    });

    // Sprawdź czas odpowiedzi
    expect(totalTime).toBeLessThan(maxResponseTime);

    // Concurrent requests completed - time logged for debugging
  });

  test('Response time benchmark', async ({ request }) => {
    // ARRANGE - Przygotowanie danych testowych
    const apiClient = new ApiClient(request);
    const iterations = 5;
    const endpoint = '/users';
    const expectedStatusCode = 200;
    const maxAverageTime = 1000; // 1 sekunda średnio
    const maxResponseTime = 2000; // 2 sekundy maksymalnie
    const responseTimes: number[] = [];

    // ACT - Wykonanie akcji: wielokrotne żądania do pomiaru czasu odpowiedzi
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      const response = await apiClient.get(endpoint);
      const endTime = Date.now();

      expect(response.status()).toBe(expectedStatusCode);
      responseTimes.push(endTime - startTime);
    }

    // Oblicz statystyki czasu odpowiedzi
    const averageTime = responseTimes.reduce((a, b) => a + b, 0) / iterations;
    const maxTime = Math.max(...responseTimes);

    // ASSERT - Weryfikacja rezultatów
    expect(averageTime).toBeLessThan(maxAverageTime);
    expect(maxTime).toBeLessThan(maxResponseTime);

    // Response times logged for debugging
  });
});
