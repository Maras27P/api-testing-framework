import { APIRequestContext, APIResponse } from '@playwright/test';
import { getCurrentEnvironment } from '../config/environment';

export class ApiClient {
  private context: APIRequestContext;
  private baseURL: string;

  constructor(context: APIRequestContext) {
    this.context = context;
    this.baseURL = getCurrentEnvironment().baseUrl;
  }

  async get(endpoint: string, options?: any): Promise<APIResponse> {
    return await this.context.get(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...options?.headers,
      },
    });
  }

  async post(
    endpoint: string,
    data?: any,
    options?: any
  ): Promise<APIResponse> {
    return await this.context.post(`${this.baseURL}${endpoint}`, {
      data,
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...options?.headers,
      },
    });
  }

  async put(endpoint: string, data?: any, options?: any): Promise<APIResponse> {
    return await this.context.put(`${this.baseURL}${endpoint}`, {
      data,
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...options?.headers,
      },
    });
  }

  async delete(endpoint: string, options?: any): Promise<APIResponse> {
    return await this.context.delete(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...options?.headers,
      },
    });
  }

  async patch(
    endpoint: string,
    data?: any,
    options?: any
  ): Promise<APIResponse> {
    return await this.context.patch(`${this.baseURL}${endpoint}`, {
      data,
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...options?.headers,
      },
    });
  }

  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const env = getCurrentEnvironment();
    if (env.apiKey) {
      headers['X-API-Key'] = env.apiKey;
    }
    if (env.authToken) {
      headers['Authorization'] = `Bearer ${env.authToken}`;
    }

    return headers;
  }
}
