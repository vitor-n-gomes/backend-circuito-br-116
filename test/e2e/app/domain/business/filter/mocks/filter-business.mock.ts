import { createBusinessFactory } from "../../../factories/business.mock";

/**
 * Creates a comprehensive set of businesses for filter testing
 * This ensures we have businesses covering all filter scenarios:
 * - Different categories
 * - Different locations
 * - Different classifications
 * - Verified and unverified
 * - Promoted and non-promoted
 * - Different view counts for sorting tests
 */
export const listOfBusinessToBeFiltered = [
  // Category 1, Location 2, A1 classification, verified, promoted
  ...createBusinessFactory(3, {
    categoryId: 1,
    locationId: 2,
    classification: 'A1',
    isVerified: true,
    promotedAt: new Date(),
    views: 5000,
  }),
  
  // Category 2, Location 6, B1 classification, verified, not promoted
  ...createBusinessFactory(3, {
    categoryId: 2,
    locationId: 6,
    classification: 'B1',
    isVerified: true,
    promotedAt: null,
    views: 3000,
  }),
  
  // Category 3, Location 8, A2 classification, not verified, not promoted
  ...createBusinessFactory(2, {
    categoryId: 3,
    locationId: 8,
    classification: 'A2',
    isVerified: false,
    promotedAt: null,
    views: 1000,
  }),
  
  // Category 4, Location 10, C classification, verified, promoted
  ...createBusinessFactory(2, {
    categoryId: 4,
    locationId: 10,
    classification: 'C',
    isVerified: true,
    promotedAt: new Date(),
    views: 8000,
  }),
  
  // Category 5, Location 12, B2 classification, not verified, not promoted
  ...createBusinessFactory(2, {
    categoryId: 5,
    locationId: 12,
    classification: 'B2',
    isVerified: false,
    promotedAt: null,
    views: 500,
  }),
  
  // Mixed for pagination tests - with varied dates
  ...createBusinessFactory(8, {
    views: 2000,
  }),
];