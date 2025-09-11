import { JSONSchemaType } from 'ajv';
import { User } from '../models/user.model';

export const userSchema: JSONSchemaType<User> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    username: { type: 'string', nullable: true },
    roles: {
      type: 'array',
      items: { type: 'string' },
    },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
  },
  required: ['id', 'roles', 'firstName', 'lastName'],
  additionalProperties: true,
};
