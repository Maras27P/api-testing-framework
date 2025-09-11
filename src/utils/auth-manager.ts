import { APIRequestContext, APIResponse } from '@playwright/test';
import { getCurrentEnvironment } from '../config/environment';

/**
 * Klasa do zarządzania autoryzacją JWT
 * Obsługuje logowanie, odświeżanie tokenów i ich przechowywanie
 */
export class AuthManager {
  private context: APIRequestContext;
  private baseURL: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(context: APIRequestContext) {
    this.context = context;
    this.baseURL = getCurrentEnvironment().baseUrl;
  }

  /**
   * Loguje użytkownika i pobiera token JWT
   */
  async login(username?: string, password?: string): Promise<string> {
    const env = getCurrentEnvironment();
    
    // Użyj danych z parametrów lub z konfiguracji środowiska
    const loginData = {
      username: username || env.username,
      password: password || env.password,
    };

    if (!loginData.username || !loginData.password) {
      throw new Error('Brak danych logowania! Sprawdź konfigurację środowiska.');
    }

    if (env.debugMode) {
      console.log(`🔐 Attempting login for: ${loginData.username}`);
    }

    try {
      const response: APIResponse = await this.context.post(
        `${this.baseURL}/users/signin`,
        {
          data: loginData,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok()) {
        const errorText = await response.text();
        throw new Error(
          `Logowanie nieudane! Status: ${response.status()}, Błąd: ${errorText}`
        );
      }

      const responseData = await response.json();
      
      // Różne API mogą zwracać token w różnych polach
      this.token = responseData.token || responseData.access_token || responseData.jwt;
      
      if (!this.token) {
        throw new Error('Nie znaleziono tokena w odpowiedzi API');
      }

      // Ustaw czas wygaśnięcia tokena (domyślnie 1 godzina)
      this.tokenExpiry = new Date(Date.now() + (responseData.expires_in || 3600) * 1000);

      if (env.debugMode) {
        console.log(`✅ Login successful! Token received.`);
        console.log(`⏰ Token expires: ${this.tokenExpiry.toISOString()}`);
      }

      return this.token;
    } catch (error) {
      if (env.debugMode) {
        console.error('❌ Login error:', error);
      }
      throw error;
    }
  }

  /**
   * Sprawdza czy token jest nadal ważny
   */
  isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }

    // Sprawdź czy token nie wygasł (z 5-minutowym buforem)
    const bufferTime = 5 * 60 * 1000; // 5 minut w milisekundach
    return Date.now() < (this.tokenExpiry.getTime() - bufferTime);
  }

  /**
   * Pobiera aktualny token JWT
   * Automatycznie loguje użytkownika jeśli token nie istnieje lub wygasł
   */
  async getValidToken(): Promise<string> {
    const env = getCurrentEnvironment();

    // Jeśli mamy token z konfiguracji środowiska, użyj go
    if (env.authToken) {
      if (env.debugMode) {
        console.log('🔑 Używam tokena z konfiguracji środowiska');
      }
      return env.authToken;
    }

    // Jeśli token nie istnieje lub wygasł, zaloguj się ponownie
    if (!this.isTokenValid()) {
      if (env.debugMode) {
        console.log('🔄 Token nieważny lub wygasł, loguję ponownie...');
      }
      await this.login();
    }

    if (!this.token) {
      throw new Error('Nie udało się uzyskać ważnego tokena');
    }

    return this.token;
  }

  /**
   * Wylogowuje użytkownika i czyści token
   */
  async logout(): Promise<void> {
    const env = getCurrentEnvironment();
    
    if (this.token && env.debugMode) {
      console.log('🚪 Wylogowuję użytkownika...');
    }

    try {
      // Opcjonalnie: wywołaj endpoint logout na serwerze
      if (this.token) {
        await this.context.post(`${this.baseURL}/users/signout`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      // Ignoruj błędy wylogowania - ważne jest wyczyszczenie lokalnego stanu
      if (env.debugMode) {
        console.warn('⚠️ Błąd podczas wylogowania:', error);
      }
    } finally {
      // Wyczyść lokalny stan
      this.token = null;
      this.tokenExpiry = null;
      
      if (env.debugMode) {
        console.log('✅ Użytkownik wylogowany');
      }
    }
  }

  /**
   * Pobiera nagłówki autoryzacji
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}
