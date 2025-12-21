import { faker } from '@faker-js/faker';
import { Business } from "@/app/infra/repositories/type-orm/models/business.entity";

const locationIds = [
  2,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
]

export const getRandomId = (range: number = 10): number => {
  return Math.floor(Math.random() * range) + 1;
};

export const getRandomLocationId = (): number => {
  const randomIndex = Math.floor(Math.random() * locationIds.length);
  return locationIds[randomIndex];
};


const getRandomCategoryId = (): number => {
    return Math.floor(Math.random() * 10) + 1;
};


/**
 * Factory to create business test data
 * @param count Number of business items to generate
 * @param overrides Optional partial business data to override defaults
 * @returns Array of partial Business entities
 */
export const createBusinessFactory = (
  count: number = 1,
  overrides?: Partial<Business>
): Partial<Business>[] => {
  return Array.from({ length: count }, () => {
    const companyName = faker.company.name();
    const now = new Date();

    return {
      title: companyName,
      description: faker.commerce.productDescription(),
      categoryId: getRandomCategoryId(),
      locationId: getRandomLocationId(),
      locationPretty: `Km ${faker.number.int({ min: 1, max: 999 })}, ${faker.location.city()} - ${faker.location.state({ abbreviated: true })}`,
      locationLat: faker.location.latitude({ min: -33.75, max: 5.27 }), // Brazil coordinates
      locationLong: faker.location.longitude({ min: -73.98, max: -34.79 }), // Brazil coordinates
      phoneNumber: faker.string.alphanumeric('##9########'),
      whatsapp: `55$ faker.string.alphanumeric('##9########')}`,
      email: faker.internet.email({ firstName: companyName.toLowerCase().replace(/\s/g, '') }),
      instagram: `@${faker.internet.userName().toLowerCase()}`,
      facebook: faker.internet.userName().toLowerCase(),
      tiktok: faker.helpers.maybe(() => `@${faker.internet.userName().toLowerCase()}`, { probability: 0.5 }),
      address: faker.location.streetAddress(true),
      classification: faker.helpers.arrayElement(['A1', 'A2', 'B1', 'B2', 'C']),
      isVerified: faker.datatype.boolean(),
      views: faker.number.int({ min: 0, max: 10000 }),
      accountId: getRandomId(6),
      promotedAt: faker.helpers.maybe(() => now, { probability: 0.3 }),
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  });
};

/**
 * Legacy export for backward compatibility
 * @deprecated Use createBusinessFactory instead
 */
export const businesses: Partial<Business>[] = createBusinessFactory(10);