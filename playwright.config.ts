import { defineConfig, devices } from '@playwright/test';
import {
  getCurrentEnvironment,
  testConfig,
  validateEnvironment,
} from './src/config/environment';

// Waliduj konfigurację przed uruchomieniem testów
validateEnvironment();

const currentEnv = getCurrentEnvironment();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? currentEnv.retries : 0,
  workers: process.env.CI ? 1 : testConfig.parallelWorkers,
  timeout: currentEnv.timeout,

  reporter: [
    ['html'],
    ['allure-playwright'],
    ['json', { outputFile: 'test-results.json' }],
    // Dodaj więcej logów w trybie debug
    ...(currentEnv.debugMode ? [['line'] as const] : []),
  ],

  use: {
    baseURL: currentEnv.baseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // Dodaj API key do nagłówków jeśli jest dostępny
      ...(currentEnv.apiKey
        ? { Authorization: `Bearer ${currentEnv.apiKey}` }
        : {}),
    },
    trace: currentEnv.debugMode ? 'on' : 'on-first-retry',
    video: currentEnv.debugMode ? 'on' : 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'API Tests',
      testDir: './tests/api',
      use: {
        ...devices['Desktop Chrome'],
        // Możesz dodać specyficzne ustawienia dla testów API
      },
    },
    {
      name: 'Contract Tests',
      testDir: './tests/contract',
      use: {
        ...devices['Desktop Chrome'],
        // Testy kontraktowe mogą mieć inne ustawienia
      },
    },
    {
      name: 'Performance Tests',
      testDir: './tests/performance',
      timeout: currentEnv.timeout * 2, // Testy wydajnościowe potrzebują więcej czasu
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
