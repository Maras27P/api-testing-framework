import { expect, APIResponse } from '@playwright/test';
import { SchemaValidator } from '../utils/schema-validator';
import { JSONSchemaType } from 'ajv';

export class ApiAssertions {
  private validator = new SchemaValidator();

  async assertStatusCode(
    response: APIResponse,
    expectedStatus: number
  ): Promise<void> {
    expect(response.status()).toBe(expectedStatus);
  }

  async assertResponseTime(
    response: APIResponse,
    maxTime: number
  ): Promise<void> {
    const responseHeaders = response.headers();
    // Można też użyć performance.now() do mierzenia czasu
    expect(parseInt(responseHeaders['x-response-time'] || '0')).toBeLessThan(
      maxTime
    );
  }

  async assertSchema<T>(
    response: APIResponse,
    schema: JSONSchemaType<T>
  ): Promise<void> {
    const body = await response.json();
    const validation = this.validator.validate(body, schema);

    if (!validation.valid) {
      throw new Error(
        `Schema validation failed: ${validation.errors.join(', ')}`
      );
    }
  }

  async assertHeaders(
    response: APIResponse,
    expectedHeaders: Record<string, string>
  ): Promise<void> {
    const headers = response.headers();
    Object.entries(expectedHeaders).forEach(([key, value]) => {
      expect(headers[key]).toBe(value);
    });
  }

  async assertJsonPath(
    response: APIResponse,
    path: string,
    expectedValue: any
  ): Promise<void> {
    const body = await response.json();
    const pathParts = path.split('.');
    let current = body;

    for (const part of pathParts) {
      current = current[part];
    }

    expect(current).toBe(expectedValue);
  }

  async assertArrayLength(
    response: APIResponse,
    expectedLength: number
  ): Promise<void> {
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBe(expectedLength);
  }
}
