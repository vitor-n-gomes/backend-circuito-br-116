import { createBusinessFactory } from "../../../factories/business.mock";

/**
 * Creates businesses for increment views testing
 * - Multiple businesses with known view counts for independent testing
 * - A specific business for search testing
 */
export const listOfBusinessForIncrementViews = [
  // Business 1: For basic increment tests
  ...createBusinessFactory(1, {
    title: 'Test Business for Views Increment',
    views: 100,
    isVerified: true,
    categoryId: 1,
    locationId: 2,
  }),
  
  // Business 2: For independent increment testing
  ...createBusinessFactory(1, {
    title: 'Second Test Business',
    views: 200,
    isVerified: true,
    categoryId: 2,
    locationId: 6,
  }),
  
  // Business 3: For concurrent/atomic increment testing
  ...createBusinessFactory(1, {
    title: 'Third Test Business',
    views: 300,
    isVerified: true,
    categoryId: 3,
    locationId: 8,
  }),
  
  // Business 4: For search testing (contains "Shell" in title)
  ...createBusinessFactory(1, {
    title: 'Shell Test Station',
    description: 'Test gas station for increment views',
    views: 50,
    isVerified: true,
    categoryId: 4,
    locationId: 10,
  }),
];
