# E2E Testing Guidelines for backend-circuito-br-116

## Overview
End-to-end tests verify the complete HTTP request-response cycle using the actual application setup. These tests use **production database** (AWS RDS) in **read-only mode** with careful data management.

## Critical Safety Rules

### ⚠️ Production Database Safety
1. **NEVER use `synchronize: true`** - This will destroy the production schema
2. **Clean up all created test data** in `afterAll` hooks
3. **Use existing production data** for read operations when possible
4. **Minimize writes** - Only create test data when absolutely necessary
5. **Use unique identifiers** (timestamps, UUIDs) to avoid conflicts

## E2E Test Structure

### Directory Organization
```
test/e2e/app/domain/[module]/
├── [endpoint-name]/           # One folder per endpoint
│   ├── [feature].e2e-spec.ts  # Main test file
│   └── mocks/                 # Endpoint-specific mocks (optional)
│       └── [feature].mock.ts
└── factories/                 # Shared test data factories
    ├── [entity].factory.ts    # Entity creation helpers
    └── relation.factory.ts    # Related entities helpers
```

### Example Structure
```
test/e2e/app/domain/business/
├── create/
│   └── create-business.e2e-spec.ts
├── by-id/
│   └── business-by-id.e2e-spec.ts
├── update/
│   └── update-business.e2e-spec.ts
├── delete/
│   ├── delete-business.e2e-spec.ts
│   └── mocks/
│       └── delete-business.mock.ts
├── filter/
│   ├── filter-businesses.e2e-spec.ts
│   └── mocks/
│       └── filter-business.mock.ts
├── search/
│   └── search-businesses.e2e-spec.ts
├── latest/
│   └── latest-businesses.e2e-spec.ts
├── proximity/
│   └── businesses-by-proximity.e2e-spec.ts
└── factories/
    ├── business.factory.ts
    └── relation.factory.ts
```

## Factory Pattern for Test Data

### Why Use Factories?
- **DRY Principle**: Avoid repeating entity structure across tests
- **Maintainability**: Update defaults in one place
- **Consistency**: Ensure valid test data across all tests
- **Readability**: `createBusinessPayload({ title: 'Custom' })` is clearer
- **Isolation**: Unique timestamps prevent cross-test pollution

### Factory Implementation Template

```typescript
// filepath: test/e2e/app/domain/[module]/factories/[entity].factory.ts

/**
 * Factory for creating [Entity] test data
 * Provides smart defaults and easy customization
 */

export interface Create[Entity]Options {
  // All entity fields as optional
  field1?: string;
  field2?: number;
  field3?: boolean;
  // ... other fields
}

/**
 * Creates a valid [entity] payload with smart defaults
 * Override any field as needed for specific test cases
 * 
 * @param options - Optional fields to override defaults
 * @returns Complete [entity] payload ready for API requests
 * 
 * @example
 * // Minimal usage with all defaults
 * const entity = create[Entity]Payload();
 * 
 * @example
 * // Override specific fields
 * const entity = create[Entity]Payload({
 *   title: 'Custom Title',
 *   isVerified: true
 * });
 */
export function create[Entity]Payload(
  options: Create[Entity]Options = {}
): Record<string, any> {
  const timestamp = Date.now();

  return {
    field1: options.field1 ?? `Default Value ${timestamp}`,
    field2: options.field2 ?? 1,
    field3: options.field3 ?? false,
    // ... all required fields with smart defaults
    // Use timestamp for uniqueness
    // Use helper functions for related entities
  };
}

/**
 * Creates a minimal valid [entity] (only required fields)
 * Useful for testing edge cases and validation
 */
export function createMinimal[Entity]Payload(): Record<string, any> {
  return {
    // Only required fields
    requiredField1: `Minimal ${Date.now()}`,
    requiredField2: 1,
  };
}

/**
 * Creates [entity] with specific feature enabled
 * Useful for testing specific scenarios
 */
export function create[Entity]With[Feature](): Record<string, any> {
  return create[Entity]Payload({
    featureField1: 'value',
    featureField2: true,
  });
}
```

### Relation Factory Template

```typescript
// filepath: test/e2e/app/domain/[module]/factories/relation.factory.ts

/**
 * Helper functions for working with related entities in tests
 * Provides access to existing production data safely
 */

// Valid IDs from production database (update these periodically)
const VALID_LOCATION_IDS = [1, 2, 3, 4, 5];
const VALID_CATEGORY_IDS = [1, 2, 3, 4, 5];

/**
 * Returns a random valid location ID from production database
 * Use this to avoid foreign key constraint violations
 */
export function getRandomLocationId(): number {
  return VALID_LOCATION_IDS[
    Math.floor(Math.random() * VALID_LOCATION_IDS.length)
  ];
}

/**
 * Returns a random valid category ID from production database
 */
export function getRandomCategoryId(): number {
  return VALID_CATEGORY_IDS[
    Math.floor(Math.random() * VALID_CATEGORY_IDS.length)
  ];
}

/**
 * Returns a specific valid location ID for consistent tests
 * @param index - Index of the location (0-based)
 */
export function getLocationId(index: number = 0): number {
  return VALID_LOCATION_IDS[index] ?? VALID_LOCATION_IDS[0];
}
```

## E2E Test File Template

```typescript
// filepath: test/e2e/app/domain/[module]/[endpoint]/[feature].e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { create[Entity]Payload } from '../factories/[entity].factory';

describe('[ModuleController] - [Operation] (e2e)', () => {
  let app: INestApplication;
  let testEntityId: number; // If test creates data

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup: Create test data if needed (minimize this)
    // Use factories for data creation
  });

  afterAll(async () => {
    // CRITICAL: Clean up all created test data
    if (testEntityId) {
      try {
        await request(app.getHttpServer())
          .delete(`/endpoint/${testEntityId}`);
      } catch (error) {
        console.warn(`Failed to delete test entity ${testEntityId}:`, error);
      }
    }

    await app.close();
  });

  describe('[HTTP_METHOD] /endpoint', () => {
    // Test 1: Structure validation
    it('should return correct response structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/endpoint')
        .expect(200);

      expect(res.body).toHaveProperty('expectedField');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    // Test 2: Data type validation
    it('should return data with correct types', async () => {
      const res = await request(app.getHttpServer())
        .get('/endpoint')
        .expect(200);

      if (res.body.data.length > 0) {
        const item = res.body.data[0];
        expect(typeof item.id).toBe('number');
        expect(typeof item.name).toBe('string');
        // ... validate all field types
      }
    });

    // Test 3: Business logic
    it('should [describe business rule]', async () => {
      // Use factory for test data
      const payload = create[Entity]Payload({
        specificField: 'test value',
      });

      const res = await request(app.getHttpServer())
        .post('/endpoint')
        .send(payload)
        .expect(201);

      expect(res.body.specificField).toBe(payload.specificField);
    });

    // Test 4: Query parameters
    it('should filter by query parameter', async () => {
      const res = await request(app.getHttpServer())
        .get('/endpoint')
        .query({ filter: 'value' })
        .expect(200);

      // Validate filtered results
    });

    // Test 5: Pagination
    it('should paginate results correctly', async () => {
      const res = await request(app.getHttpServer())
        .get('/endpoint')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('currentPage', 1);
      expect(res.body.meta).toHaveProperty('itemsPerPage', 10);
    });

    // Test 6: Validation errors
    it('should return 400 for invalid input', async () => {
      const invalidPayload = {
        invalidField: 'value',
      };

      const res = await request(app.getHttpServer())
        .post('/endpoint')
        .send(invalidPayload)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    // Test 7: Not found
    it('should return 404 for non-existent resource', async () => {
      const nonExistentId = 999999;

      const res = await request(app.getHttpServer())
        .get(`/endpoint/${nonExistentId}`)
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });

    // Test 8: Edge cases
    it('should handle edge case: [describe scenario]', async () => {
      // Test boundary conditions, special values, etc.
    });

    // Test 9: Data persistence (for write operations)
    it('should persist changes to database', async () => {
      const payload = create[Entity]Payload();

      const createRes = await request(app.getHttpServer())
        .post('/endpoint')
        .send(payload)
        .expect(201);

      const createdId = createRes.body.id;

      // Verify persistence with GET
      const getRes = await request(app.getHttpServer())
        .get(`/endpoint/${createdId}`)
        .expect(200);

      expect(getRes.body.field).toBe(payload.field);

      // Clean up
      await request(app.getHttpServer())
        .delete(`/endpoint/${createdId}`);
    });

    // Test 10: Related data (for endpoints with joins)
    it('should include related data in response', async () => {
      const res = await request(app.getHttpServer())
        .get('/endpoint/1')
        .expect(200);

      expect(res.body).toHaveProperty('relatedEntity');
      expect(res.body.relatedEntity).toHaveProperty('id');
    });
  });
});
```

## Test Categories & Patterns

### 1. Read Operations (GET)
**Pattern**: Test with existing production data
```typescript
describe('GET /endpoint', () => {
  it('should return list with correct structure', async () => {
    const res = await request(app.getHttpServer())
      .get('/endpoint')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should validate response data types', async () => {
    const res = await request(app.getHttpServer())
      .get('/endpoint')
      .expect(200);

    if (res.body.data.length > 0) {
      const item = res.body.data[0];
      expect(typeof item.id).toBe('number');
      expect(typeof item.createdAt).toBe('string');
      // Validate all fields
    }
  });
});
```

### 2. Create Operations (POST)
**Pattern**: Use factory → Create → Verify → Clean up
```typescript
describe('POST /endpoint', () => {
  let createdId: number;

  afterAll(async () => {
    if (createdId) {
      await request(app.getHttpServer()).delete(`/endpoint/${createdId}`);
    }
  });

  it('should create entity with valid data', async () => {
    const payload = createEntityPayload({
      title: `Test Create ${Date.now()}`,
    });

    const res = await request(app.getHttpServer())
      .post('/endpoint')
      .send(payload)
      .expect(201);

    createdId = res.body.id;
    expect(res.body.title).toBe(payload.title);
  });

  it('should reject invalid data', async () => {
    const invalidPayload = { invalidField: 'value' };

    await request(app.getHttpServer())
      .post('/endpoint')
      .send(invalidPayload)
      .expect(400);
  });
});
```

### 3. Update Operations (PUT/PATCH)
**Pattern**: Create → Update → Verify → Clean up
```typescript
describe('PUT /endpoint/:id', () => {
  let testId: number;

  beforeAll(async () => {
    const payload = createEntityPayload();
    const res = await request(app.getHttpServer())
      .post('/endpoint')
      .send(payload)
      .expect(201);
    testId = res.body.id;
  });

  afterAll(async () => {
    if (testId) {
      await request(app.getHttpServer()).delete(`/endpoint/${testId}`);
    }
  });

  it('should update single field', async () => {
    const updateData = { title: 'Updated Title' };

    const res = await request(app.getHttpServer())
      .put(`/endpoint/${testId}`)
      .send(updateData)
      .expect(200);

    expect(res.body.title).toBe(updateData.title);
  });

  it('should preserve unchanged fields', async () => {
    const beforeRes = await request(app.getHttpServer())
      .get(`/endpoint/${testId}`)
      .expect(200);

    const originalDescription = beforeRes.body.description;

    await request(app.getHttpServer())
      .put(`/endpoint/${testId}`)
      .send({ title: 'New Title' })
      .expect(200);

    const afterRes = await request(app.getHttpServer())
      .get(`/endpoint/${testId}`)
      .expect(200);

    expect(afterRes.body.description).toBe(originalDescription);
  });
});
```

### 4. Delete Operations (DELETE)
**Pattern**: Create → Delete → Verify deletion
```typescript
describe('DELETE /endpoint/:id', () => {
  it('should delete existing entity', async () => {
    // Create entity to delete
    const payload = createEntityPayload();
    const createRes = await request(app.getHttpServer())
      .post('/endpoint')
      .send(payload)
      .expect(201);

    const idToDelete = createRes.body.id;

    // Delete it
    await request(app.getHttpServer())
      .delete(`/endpoint/${idToDelete}`)
      .expect(200);

    // Verify deletion
    await request(app.getHttpServer())
      .get(`/endpoint/${idToDelete}`)
      .expect(404);
  });

  it('should return 404 for non-existent entity', async () => {
    await request(app.getHttpServer())
      .delete('/endpoint/999999')
      .expect(404);
  });
});
```

### 5. Filter/Search Operations
**Pattern**: Test with production data + verify filters work
```typescript
describe('GET /endpoint/filter', () => {
  it('should filter by specific field', async () => {
    const res = await request(app.getHttpServer())
      .get('/endpoint/filter')
      .query({ fieldName: 'value' })
      .expect(200);

    expect(res.body.data.every(item => item.fieldName === 'value')).toBe(true);
  });

  it('should support multiple filters', async () => {
    const res = await request(app.getHttpServer())
      .get('/endpoint/filter')
      .query({ field1: 'value1', field2: 'value2' })
      .expect(200);

    expect(res.body.data.every(item => 
      item.field1 === 'value1' && item.field2 === 'value2'
    )).toBe(true);
  });
});
```

### 6. Pagination Tests
**Pattern**: Verify pagination metadata and data limits
```typescript
describe('Pagination', () => {
  it('should paginate results with correct metadata', async () => {
    const page = 1;
    const limit = 5;

    const res = await request(app.getHttpServer())
      .get('/endpoint')
      .query({ page, limit })
      .expect(200);

    expect(res.body.meta).toMatchObject({
      currentPage: page,
      itemsPerPage: limit,
    });
    expect(res.body.data.length).toBeLessThanOrEqual(limit);
  });

  it('should return different data on different pages', async () => {
    const page1Res = await request(app.getHttpServer())
      .get('/endpoint')
      .query({ page: 1, limit: 5 })
      .expect(200);

    const page2Res = await request(app.getHttpServer())
      .get('/endpoint')
      .query({ page: 2, limit: 5 })
      .expect(200);

    if (page1Res.body.data.length > 0 && page2Res.body.data.length > 0) {
      expect(page1Res.body.data[0].id).not.toBe(page2Res.body.data[0].id);
    }
  });
});
```

## Common Test Scenarios

### Validation Testing
```typescript
it('should validate required fields', async () => {
  const incompletePayload = { field1: 'value' }; // Missing required fields

  const res = await request(app.getHttpServer())
    .post('/endpoint')
    .send(incompletePayload)
    .expect(400);

  expect(res.body).toHaveProperty('message');
  expect(Array.isArray(res.body.message)).toBe(true);
});

it('should validate field formats', async () => {
  const invalidPayload = createEntityPayload({
    email: 'not-an-email', // Invalid format
  });

  await request(app.getHttpServer())
    .post('/endpoint')
    .send(invalidPayload)
    .expect(400);
});

it('should validate numeric ranges', async () => {
  const invalidPayload = createEntityPayload({
    latitude: 200, // Invalid: should be -90 to 90
  });

  await request(app.getHttpServer())
    .post('/endpoint')
    .send(invalidPayload)
    .expect(400);
});
```

### Timestamp Testing
```typescript
it('should set createdAt timestamp on creation', async () => {
  const beforeTime = new Date();
  
  const payload = createEntityPayload();
  const res = await request(app.getHttpServer())
    .post('/endpoint')
    .send(payload)
    .expect(201);

  const afterTime = new Date();
  const createdAt = new Date(res.body.createdAt);

  expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
  expect(createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
});

it('should update updatedAt on modification', async () => {
  // Get current business
  const beforeRes = await request(app.getHttpServer())
    .get(`/endpoint/${testId}`)
    .expect(200);

  const beforeUpdatedAt = new Date(beforeRes.body.updatedAt);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await request(app.getHttpServer())
    .put(`/endpoint/${testId}`)
    .send({ field: 'new value' })
    .expect(200);

  const afterRes = await request(app.getHttpServer())
    .get(`/endpoint/${testId}`)
    .expect(200);

  const afterUpdatedAt = new Date(afterRes.body.updatedAt);
  expect(afterUpdatedAt.getTime()).toBeGreaterThan(beforeUpdatedAt.getTime());
});
```

### Relationship Testing
```typescript
it('should include related entities in response', async () => {
  const res = await request(app.getHttpServer())
    .get('/endpoint/1')
    .expect(200);

  expect(res.body).toHaveProperty('category');
  expect(res.body.category).toHaveProperty('id');
  expect(res.body.category).toHaveProperty('name');
});

it('should fail with invalid foreign key', async () => {
  const payload = createEntityPayload({
    categoryId: 999999, // Non-existent category
  });

  await request(app.getHttpServer())
    .post('/endpoint')
    .send(payload)
    .expect(400); // or 404 depending on API design
});
```

## Best Practices

### 1. Test Organization
- ✅ One test file per endpoint operation
- ✅ Group related tests with `describe` blocks
- ✅ Use clear, descriptive test names
- ✅ Order tests logically (happy path → edge cases → errors)

### 2. Data Management
- ✅ **Always clean up created data** in `afterAll` hooks
- ✅ Use unique identifiers (timestamps) for test data
- ✅ Minimize database writes - prefer testing with existing data
- ✅ Use factories for consistent test data creation

### 3. Assertions
- ✅ Test response structure first
- ✅ Validate data types
- ✅ Check business logic
- ✅ Verify edge cases
- ✅ Use specific matchers (`toBe`, `toEqual`, `toMatchObject`)

### 4. Error Handling
- ✅ Wrap cleanup in try-catch to prevent test failures from blocking cleanup
- ✅ Log warnings for cleanup failures
- ✅ Test all error scenarios (400, 404, 500)

### 5. Readability
- ✅ Use factories instead of inline object creation
- ✅ Extract magic numbers to named constants
- ✅ Add comments for complex test scenarios
- ✅ Keep tests focused on single responsibility

## Anti-Patterns to Avoid

### ❌ Don't
```typescript
// ❌ Manual object construction everywhere
const business = {
  title: 'Test',
  description: 'Test',
  categoryId: 1,
  locationId: 1,
  // ... 15 more fields
};

// ❌ Hard-coded IDs
const categoryId = 1;
const locationId = 5;

// ❌ No cleanup
it('should create business', async () => {
  await request(app.getHttpServer())
    .post('/businesses')
    .send(business);
  // Missing cleanup!
});

// ❌ Synchronize in e2e tests
TypeOrmModule.forRoot({
  synchronize: true, // NEVER DO THIS
});

// ❌ Vague test names
it('should work', async () => {});

// ❌ Testing multiple things in one test
it('should do everything', async () => {
  // Creates, updates, deletes, searches...
});
```

### ✅ Do
```typescript
// ✅ Use factories
const business = createBusinessPayload({
  title: 'Specific Test Case',
});

// ✅ Use factory helpers for related entities
const categoryId = getRandomCategoryId();
const locationId = getRandomLocationId();

// ✅ Always clean up
afterAll(async () => {
  if (testId) {
    try {
      await request(app.getHttpServer()).delete(`/endpoint/${testId}`);
    } catch (error) {
      console.warn(`Cleanup failed for ${testId}:`, error);
    }
  }
});

// ✅ Clear, specific test names
it('should return 404 when business does not exist', async () => {});

// ✅ One responsibility per test
it('should create business with valid data', async () => {});
it('should update business title', async () => {});
it('should delete business', async () => {});
```

## Running E2E Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- update-business.e2e-spec

# Run tests for specific module
npm run test:e2e -- test/e2e/app/domain/business

# Run with coverage
npm run test:e2e -- --coverage

# Run in watch mode (useful during development)
npm run test:e2e -- --watch
```

## Checklist for New E2E Tests

Before submitting e2e tests, ensure you've completed:

- [ ] Created endpoint folder under `test/e2e/app/domain/[module]/`
- [ ] Created or updated factory in `factories/[entity].factory.ts`
- [ ] Implemented test file following template structure
- [ ] Added cleanup in `afterAll` hook for created data
- [ ] Tested happy path scenarios
- [ ] Tested validation errors (400)
- [ ] Tested not found errors (404)
- [ ] Tested edge cases
- [ ] Verified data types in responses
- [ ] Tested pagination (if applicable)
- [ ] Tested filtering (if applicable)
- [ ] Tested relationships (if applicable)
- [ ] Used factories instead of manual object construction
- [ ] Added descriptive test names
- [ ] Verified tests pass: `npm run test:e2e -- [test-file]`
- [ ] No `synchronize: true` in test configuration
- [ ] All created test data is cleaned up properly

## Real-World Example

Here's a complete example from the business module:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { createBusinessPayload } from '../factories/business.factory';

describe('BusinessController - Update Business (e2e)', () => {
  let app: INestApplication;
  let testBusinessId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create test business using factory
    const accountId = 1;
    const newBusiness = createBusinessPayload({
      title: 'Test Business for Updates',
      description: 'Original description',
    });

    const createRes = await request(app.getHttpServer())
      .post('/businesses')
      .query({ accountId })
      .send(newBusiness)
      .expect(201);

    testBusinessId = createRes.body.auxId;
  });

  afterAll(async () => {
    // Clean up test business
    if (testBusinessId) {
      try {
        await request(app.getHttpServer())
          .delete(`/businesses/${testBusinessId}`);
      } catch (error) {
        console.warn(`Failed to delete test business ${testBusinessId}:`, error);
      }
    }

    await app.close();
  });

  describe('PUT /businesses/:id', () => {
    it('should update business title', async () => {
      const updateData = {
        title: 'Updated Business Title',
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.auxId).toBe(testBusinessId);
      expect(res.body.title).toBe(updateData.title);

      // Verify the update persisted
      const getRes = await request(app.getHttpServer())
        .get(`/businesses/${testBusinessId}`)
        .expect(200);

      expect(getRes.body.title).toBe(updateData.title);
    });

    it('should preserve unchanged fields when updating', async () => {
      const beforeRes = await request(app.getHttpServer())
        .get(`/businesses/${testBusinessId}`)
        .expect(200);

      const originalDescription = beforeRes.body.description;
      const originalCategoryId = beforeRes.body.categoryId;

      const updateData = {
        title: 'Partial Update Test',
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.title).toBe(updateData.title);
      expect(res.body.description).toBe(originalDescription);
      expect(res.body.categoryId).toBe(originalCategoryId);
    });

    it('should return 404 for non-existent business ID', async () => {
      const nonExistentId = 999999;
      const updateData = {
        title: 'This should fail',
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });
  });
});
```

---

**Remember**: E2E tests use production database. Always be careful with writes and ensure cleanup!
