import Ajv, { JSONSchemaType } from 'ajv';

export class SchemaValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  validate<T>(
    data: any,
    schema: JSONSchemaType<T>
  ): { valid: boolean; errors: string[] } {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    return {
      valid,
      errors:
        validate.errors?.map(
          error => `${error.instancePath || 'root'} ${error.message}`
        ) || [],
    };
  }
}
