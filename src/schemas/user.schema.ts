import { JSONSchemaType } from 'ajv';
import { User } from '../models/user.model';

export const userSchema: JSONSchemaType<User> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    username: { type: 'string' },
    email: { type: 'string', format: 'email' },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        suite: { type: 'string' },
        city: { type: 'string' },
        zipcode: { type: 'string' },
        geo: {
          type: 'object',
          properties: {
            lat: { type: 'string' },
            lng: { type: 'string' },
          },
          required: ['lat', 'lng'],
          additionalProperties: false,
        },
      },
      required: ['street', 'suite', 'city', 'zipcode', 'geo'],
      additionalProperties: false,
    },
    phone: { type: 'string' },
    website: { type: 'string' },
    company: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        catchPhrase: { type: 'string' },
        bs: { type: 'string' },
      },
      required: ['name', 'catchPhrase', 'bs'],
      additionalProperties: false,
    },
  },
  required: [
    'id',
    'name',
    'username',
    'email',
    'address',
    'phone',
    'website',
    'company',
  ],
  additionalProperties: false,
};
