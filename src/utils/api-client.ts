import { APIRequestContext, APIResponse } from '@playwright/test';
import { getCurrentEnvironment } from '../config/environment';
import { AuthManager } from './auth-manager';

export class ApiClient {
  private context: APIRequestContext;
  private baseURL: string;
  private authManager: AuthManager;

  constructor(context: APIRequestContext) {
    this.context = context;
    this.baseURL = getCurrentEnvironment().baseUrl;
    this.authManager = new AuthManager(context);
  }

  async get(endpoint: string, options?: any): Promise<APIResponse> {
    const defaultHeaders = await this.getDefaultHeaders();
    return await this.context.get(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
  }

  async post(
    endpoint: string,
    data?: any,
    options?: any
  ): Promise<APIResponse> {
    const defaultHeaders = await this.getDefaultHeaders();
    return await this.context.post(`${this.baseURL}${endpoint}`, {
      data,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
  }

  async put(endpoint: string, data?: any, options?: any): Promise<APIResponse> {
    const defaultHeaders = await this.getDefaultHeaders();
    return await this.context.put(`${this.baseURL}${endpoint}`, {
      data,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
  }

  async delete(endpoint: string, options?: any): Promise<APIResponse> {
    const defaultHeaders = await this.getDefaultHeaders();
    return await this.context.delete(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
  }

  async patch(
    endpoint: string,
    data?: any,
    options?: any
  ): Promise<APIResponse> {
    const defaultHeaders = await this.getDefaultHeaders();
    return await this.context.patch(`${this.baseURL}${endpoint}`, {
      data,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
  }

  private async getDefaultHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const env = getCurrentEnvironment();
    
    // Dodaj API Key jeśli jest dostępny
    if (env.apiKey) {
      headers['X-API-Key'] = env.apiKey;
    }

    // Dodaj autoryzację JWT jeśli są dostępne dane logowania
    if (env.username && env.password) {
      try {
        const authHeaders = await this.authManager.getAuthHeaders();
        Object.assign(headers, authHeaders);
      } catch (error) {
        if (env.debugMode) {
          console.warn('⚠️ Nie udało się uzyskać tokena autoryzacji:', error);
        }
      }
    } else if (env.authToken) {
      // Fallback: użyj tokena z konfiguracji
      headers['Authorization'] = `Bearer ${env.authToken}`;
    }

    return headers;
  }

  /**
   * Metody do zarządzania autoryzacją
   */
  
  /**
   * Loguje użytkownika i uzyskuje token JWT
   */
  async login(username?: string, password?: string): Promise<string> {
    return await this.authManager.login(username, password);
  }

  /**
   * Wylogowuje użytkownika
   */
  async logout(): Promise<void> {
    await this.authManager.logout();
  }

  /**
   * Sprawdza czy użytkownik jest zalogowany (ma ważny token)
   */
  isAuthenticated(): boolean {
    return this.authManager.isTokenValid();
  }

  /**
   * Pobiera aktualny token JWT
   */
  async getToken(): Promise<string> {
    return await this.authManager.getValidToken();
  }
}
