import dotenv from 'dotenv';

// Ładuj zmienne środowiskowe z pliku .env
dotenv.config();

export interface Environment {
  name: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  apiKey?: string;
  authToken?: string;
  username?: string;
  password?: string;
  isProduction: boolean;
  debugMode: boolean;
}

export interface TestConfig {
  parallelWorkers: number;
  headless: boolean;
  verboseLogging: boolean;
}

// Funkcja pomocnicza do pobierania zmiennych środowiskowych
const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Zmienna środowiskowa ${name} nie jest ustawiona!`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (name: string, defaultValue: number): number => {
  const value = process.env[name];
  return value ? parseInt(value, 10) : defaultValue;
};

const getEnvBoolean = (name: string, defaultValue: boolean): boolean => {
  const value = process.env[name];
  return value ? value.toLowerCase() === 'true' : defaultValue;
};

export const environments: Record<string, Environment> = {
  dev: {
    name: 'Development',
    baseUrl: getEnvVar('DEV_BASE_URL', 'http://localhost:4001'),
    timeout: getEnvNumber('API_TIMEOUT', 30000),
    retries: getEnvNumber('RETRY_COUNT', 2),
    apiKey: process.env.DEV_API_KEY,
    authToken: process.env.DEV_AUTH_TOKEN || process.env.DEV_JWT_TOKEN,
    username: process.env.DEV_USERNAME,
    password: process.env.DEV_PASSWORD,
    isProduction: false,
    debugMode: getEnvBoolean('DEBUG_MODE', true),
  },
  staging: {
    name: 'Staging',
    baseUrl: getEnvVar('STAGING_BASE_URL', 'https://api-staging.example.com'),
    timeout: getEnvNumber('API_TIMEOUT', 30000),
    retries: getEnvNumber('RETRY_COUNT', 3),
    apiKey: process.env.STAGING_API_KEY,
    authToken: process.env.STAGING_AUTH_TOKEN || process.env.STAGING_JWT_TOKEN,
    username: process.env.STAGING_USERNAME,
    password: process.env.STAGING_PASSWORD,
    isProduction: false,
    debugMode: getEnvBoolean('DEBUG_MODE', false),
  },
  prod: {
    name: 'Production',
    baseUrl: getEnvVar('PROD_BASE_URL', 'https://api.example.com'),
    timeout: getEnvNumber('API_TIMEOUT', 60000),
    retries: getEnvNumber('RETRY_COUNT', 3),
    apiKey: process.env.PROD_API_KEY,
    authToken: process.env.PROD_AUTH_TOKEN || process.env.PROD_JWT_TOKEN,
    username: process.env.PROD_USERNAME,
    password: process.env.PROD_PASSWORD,
    isProduction: true,
    debugMode: false, // Nigdy nie debuguj na produkcji
  },
};

export const testConfig: TestConfig = {
  parallelWorkers: getEnvNumber('PARALLEL_WORKERS', 4),
  headless: getEnvBoolean('HEADLESS', true),
  verboseLogging: getEnvBoolean('VERBOSE_LOGGING', false),
};

export const getCurrentEnvironment = (): Environment => {
  const envName = process.env.NODE_ENV || 'dev';
  const environment = environments[envName];

  if (!environment) {
    console.warn(`⚠️ Nieznane środowisko: ${envName}. Używam 'dev'.`);
    return environments.dev!;
  }

  if (environment.debugMode) {
    console.log(`🔧 Uruchamiam testy w środowisku: ${environment.name}`);
    console.log(`🌐 Base URL: ${environment.baseUrl}`);
  }

  return environment;
};

// Walidacja konfiguracji przy starcie
export const validateEnvironment = (): void => {
  const env = getCurrentEnvironment();

  if (!env.baseUrl) {
    throw new Error('Base URL nie może być pusty!');
  }

  if (env.timeout < 1000) {
    throw new Error('Timeout musi być co najmniej 1000ms!');
  }

  if (env.isProduction && !env.apiKey) {
    console.warn('⚠️ Brak API key dla środowiska produkcyjnego!');
  }
};
