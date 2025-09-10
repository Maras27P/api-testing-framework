import { faker } from '@faker-js/faker';
import { User } from '../models/user.model';

export class UserFixtures {
  static createValidUser(): Partial<User> {
    return {
      name: faker.person.fullName(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      website: faker.internet.url(),
      address: {
        street: faker.location.streetAddress(),
        suite: faker.location.secondaryAddress(),
        city: faker.location.city(),
        zipcode: faker.location.zipCode(),
        geo: {
          lat: faker.location.latitude().toString(),
          lng: faker.location.longitude().toString(),
        },
      },
      company: {
        name: faker.company.name(),
        catchPhrase: faker.company.catchPhrase(),
        bs: faker.company.buzzPhrase(),
      },
    };
  }

  static createInvalidUser(): any {
    return {
      name: '',
      email: 'invalid-email',
      phone: null,
    };
  }
}
