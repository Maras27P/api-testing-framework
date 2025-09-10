import { test } from '@playwright/test';
import { ApiClient } from '../../src/utils/api-client';

test.describe('Performance Tests', () => {
  test('Load test - multiple concurrent requests', async ({ request }) => {
    const apiClient = new ApiClient(request);
    const concurrentRequests = 10;
    const startTime = Date.now();

    const promises = Array.from({ length: concurrentRequests }, (_, i) =>
      apiClient.get(`/users/${i + 1}`)
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Sprawdź czy wszystkie żądania się powiodły
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });

    // Sprawdź czas odpowiedzi
    expect(totalTime).toBeLessThan(5000); // 5 sekund dla 10 żądań

    console.log(
      `${concurrentRequests} concurrent requests completed in ${totalTime}ms`
    );
  });

  test('Response time benchmark', async ({ request }) => {
    const apiClient = new ApiClient(request);
    const iterations = 5;
    const responseTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      const response = await apiClient.get('/users/1');
      const endTime = Date.now();

      expect(response.status()).toBe(200);
      responseTimes.push(endTime - startTime);
    }

    const averageTime = responseTimes.reduce((a, b) => a + b, 0) / iterations;
    const maxTime = Math.max(...responseTimes);

    console.log(`Average response time: ${averageTime}ms`);
    console.log(`Max response time: ${maxTime}ms`);

    expect(averageTime).toBeLessThan(1000); // 1 sekunda średnio
    expect(maxTime).toBeLessThan(2000); // 2 sekundy maksymalnie
  });
});
