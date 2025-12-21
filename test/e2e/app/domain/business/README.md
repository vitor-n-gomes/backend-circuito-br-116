# Business E2E Tests

This directory contains end-to-end tests for the Business module routes.

## ⚠️ Important: Production Database

**These tests connect to the PRODUCTION database.** 

### Safety Guidelines:

1. **NEVER use `synchronize: true`** in TypeORM configuration - it will destroy database schema
2. **Only use READ operations** when possible
3. **Do NOT delete or modify existing data** unless absolutely necessary
4. **Use existing data** for testing instead of creating new test data
5. **Clean up any test data** created during tests

## Structure

Each route/endpoint has its own folder with dedicated test files:

```
business/
├── latest/
│   └── latest-businesses.e2e-spec.ts    # GET /businesses/latest
├── search/
│   └── search-businesses.e2e-spec.ts    # GET /businesses/search
├── filter/
│   └── filter-businesses.e2e-spec.ts    # POST /businesses/filter
├── proximity/
│   └── proximity-businesses.e2e-spec.ts # GET /businesses/proximity/:lat/:lng/:categoryId
├── account/
│   └── account-businesses.e2e-spec.ts   # GET /businesses/account/:accountId
├── by-id/
│   └── get-business-by-id.e2e-spec.ts   # GET /businesses/:id
├── create/
│   └── create-business.e2e-spec.ts      # POST /businesses
├── update/
│   └── update-business.e2e-spec.ts      # PUT /businesses/:id
├── delete/
│   └── delete-business.e2e-spec.ts      # DELETE /businesses/:id
└── views/
    └── increment-views.e2e-spec.ts      # POST /businesses/:id/increment-views
```

## Running Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run only business e2e tests
npm run test:e2e -- test/e2e/app/domain/business

# Run specific endpoint tests
npm run test:e2e -- test/e2e/app/domain/business/latest
```

## Test Patterns

### 1. Basic Response Structure
```typescript
it('should return expected structure', async () => {
  const res = await request(app.getHttpServer())
    .get('/businesses/latest')
    .expect(200);

  expect(Array.isArray(res.body)).toBe(true);
  if (res.body.length > 0) {
    expect(res.body[0]).toHaveProperty('auxId');
    expect(res.body[0]).toHaveProperty('title');
  }
});
```

### 2. Query Parameters
```typescript
it('should handle query parameters', async () => {
  const res = await request(app.getHttpServer())
    .get('/businesses/latest')
    .query({ limit: 5 })
    .expect(200);
});
```

### 3. Pagination
```typescript
it('should return paginated results', async () => {
  const res = await request(app.getHttpServer())
    .post('/businesses/filter')
    .send({ categories: [1] })
    .query({ page: 1, limit: 10 })
    .expect(200);

  expect(res.body).toHaveProperty('currentPage');
  expect(res.body).toHaveProperty('totalElements');
  expect(res.body).toHaveProperty('data');
});
```

## Current Tests

### ✅ Latest Businesses (`/businesses/latest`)
- Returns array of businesses
- Respects limit parameter
- Prioritizes promoted businesses
- Orders by creation date
- Handles edge cases (limit 0, very large limits)

## To Be Implemented

- [ ] Search businesses
- [ ] Filter businesses
- [ ] Get by proximity
- [ ] Get by account
- [ ] Get by ID
- [ ] Create business (⚠️ requires cleanup)
- [ ] Update business (⚠️ requires cleanup)
- [ ] Delete business (⚠️ requires cleanup)
- [ ] Increment views

## Best Practices

1. **Use existing data**: Query existing businesses instead of creating new ones
2. **Test read operations first**: They're safer and don't modify database
3. **Cleanup after write operations**: Always delete test data created during tests
4. **Verify data types**: Check both structure and types of responses
5. **Test edge cases**: Empty results, invalid parameters, boundary conditions
6. **Keep tests independent**: Each test should work in isolation

## Example: Safe Create/Delete Test

```typescript
describe('POST /businesses (create)', () => {
  let createdBusinessId: number;

  it('should create a business', async () => {
    const res = await request(app.getHttpServer())
      .post('/businesses')
      .query({ accountId: 1 })
      .send(businessData)
      .expect(201);

    createdBusinessId = res.body.auxId;
    expect(res.body).toHaveProperty('auxId');
  });

  afterAll(async () => {
    // Cleanup: Delete test business
    if (createdBusinessId) {
      await request(app.getHttpServer())
        .delete(`/businesses/${createdBusinessId}`)
        .expect(200);
    }
  });
});
```
