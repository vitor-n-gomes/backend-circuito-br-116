# GitHub Copilot Instructions for backend-circuito-br-116

## Project Overview
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL with TypeORM
- **Purpose:** Backend API for the Circuito Br 116 website, replacing legacy infrastructure and modernizing the platform.
- **Architecture:** Clean Architecture with clear separation of concerns - domain logic, infrastructure, and presentation layers.

## Key Workflows
- **Install dependencies:** `npm install` or `yarn install`
- **Development server:** `npm run start:dev` or `yarn start:dev`
- **Production build:** `npm run build` + `npm run start:prod`
- **Unit tests:** `npm run test`
- **E2E tests:** `npm run test:e2e` (uses `jest-e2e.config.js`)
- **Coverage:** `npm run test:cov` (output in `coverage/`)

## Project Structure & Architecture

### Core Directories
```
src/
├── app/
│   ├── domain/               # Domain modules (business logic)
│   │   └── contact/        # Contact domain
│   │       ├── controllers/
│   │       ├── use-cases/  # Business logic use cases
│   │       └── dtos/       # Data transfer objects
│   └── infra/              # Infrastructure layer
│       └── repositories/   # Data access layer
│           ├── interfaces/ # Repository contracts
│           └── type-orm/   # TypeORM implementation
│               ├── models/
│               ├── mappers/
│               └── filters/
├── common/                 # Shared utilities
│   └── utils/
│       └── dtos/
└── main.ts                # Application entry point
```

### Module Organization
- **Domain Modules** (`src/app/domain`): Business logic organized by feature
  - Controllers handle HTTP requests
  - Use cases contain business logic
  - DTOs define data contracts
- **Infrastructure** (`src/app/infra`): Technical implementations
  - Repository pattern for data access
  - TypeORM entities and configurations
  - Database-specific filters and mappers

## Code Structure & Patterns

### Dependency Injection & Abstractions
- Use abstract classes for repository interfaces (e.g., `IContactRepository`)
- Concrete implementations in `type-orm/` directory
- Register providers in module files using `provide`/`useClass` pattern

### Repository Pattern
```typescript
// Interface definition in src/app/infra/repositories/interfaces/
export abstract class IContactRepository {
  abstract findById(id: number): Promise<ContactResponseDto | null>;
  abstract findWithFilters(...): Promise<PaginationResponseDto<ContactResponseDto[]>>;
}

// Implementation in src/app/infra/repositories/type-orm/
@Injectable()
export class ContactRepository implements IContactRepository {
  constructor(
    @InjectRepository(Contact)
    private readonly repository: Repository<Contact>
  ) {}
  
  async findById(id: number): Promise<ContactResponseDto | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? toObjectResponseMapper(ContactResponseDto, entity) : null;
  }
}
```

### Use Case Pattern
- Each business operation is a separate use case class
- Inject repository interfaces, not concrete implementations
- Example structure:
```typescript
@Injectable()
export class PaginateContactsByFilterCase {
  constructor(
    @Inject(IContactRepository)
    private readonly contactRepository: IContactRepository
  ) {}

  async execute(
    filters: FilterRequestDto,
    page: number,
    limit: number
  ): Promise<PaginationResponseDto<ContactResponseDto[]>> {
    return this.contactRepository.findWithFilters(filters, page, limit);
  }
}
```

### Data Mapping
- Use mapper functions to transform entities to DTOs
- `toPaginationResponseMapper` for paginated responses
- `toObjectResponseMapper` for single entities
- Uses `class-transformer` library (`plainToInstance`)

### Error Handling
- Custom TypeORM exception filter in `typeorm-exception.filter.ts`
- Handles `QueryFailedError`, `EntityNotFoundError`, and generic database errors
- Returns consistent HTTP error responses with proper status codes

### Testing Strategy
- **Unit tests:** Test business logic in isolation with mocked dependencies
  - Location: `test/unit/`
  - Mock factories in `mocks/` directories
  - Follow AAA pattern (Arrange, Act, Assert)
- **E2E tests:** Test full request-response cycle
  - Location: `test/e2e/`
  - Uses actual database connections

## Conventions & Best Practices

### Path Aliases
- Use `@/` prefix for imports from `src`
- Example: `import { PaginationResponseDto } from "@/common/utils/dtos/responses/pagination.response.dto"`
- Configured in `tsconfig.json`

### Import Consistency
- Infrastructure interfaces: Use `@/` alias or relative paths consistently
- Domain DTOs: Use relative paths from infrastructure layer (e.g., `../../../domain/contact/dtos/`)
- Common utilities: Always use `@/common/...`

### Module Structure
1. Create feature modules in `src/app/domain/[feature-name]/`
2. Implement use cases for business logic
3. Define DTOs for requests/responses with validation decorators
4. Create controllers that inject and call use cases
5. Register everything in the feature's `.module.ts`

### Repository Implementation
1. Define interface in `src/app/infra/repositories/interfaces/`
2. Implement with TypeORM in `src/app/infra/repositories/type-orm/`
3. Create entity models in `type-orm/models/`
4. Use mappers to transform entities to DTOs
5. Register in `typeorm.repository.module.ts` using:
   ```typescript
   providers: [
     {
       provide: IContactRepository,
       useClass: ContactRepository,
     },
   ]
   ```

### API Documentation
- Use Swagger decorators (`@ApiProperty`, `@ApiResponse`, `@ApiOperation`, etc.)
- Document all DTOs and controller endpoints
- Swagger UI available at `/api-docs`
- Auto-generated spec saved to `swagger.json`

## Database & ORM

### TypeORM Configuration
- Dynamic configuration using `@nestjs/config`
- Connection settings in `typeorm.repository.module.ts`
- PostgreSQL with SSL enabled (`ssl: { rejectUnauthorized: false }`)
- Environment variables for connection details

### Entity Definitions
- Entities in `src/app/infra/repositories/type-orm/models/`
- Use decorators: `@Entity`, `@Column`, `@PrimaryGeneratedColumn`
- Map database column names to camelCase properties using `name` option
- Example:
```typescript
@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;
}
```

### Migrations
- TypeORM CLI commands available
- `npm run migration:generate` - Generate migration from entities
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- Keep `synchronize: false` in production

## Testing Patterns

### Unit Test Structure
```typescript
describe('ComponentName', () => {
  let component: ComponentType;
  let dependency: jest.Mocked<DependencyType>;

  beforeEach(() => {
    dependency = { method: jest.fn() } as any;
    component = new ComponentType(dependency);
  });

  it('should ...', async () => {
    // Arrange
    dependency.method.mockResolvedValue(mockData);
    
    // Act
    const result = await component.execute(params);
    
    // Assert
    expect(dependency.method).toHaveBeenCalledWith(expectedParams);
    expect(result).toEqual(expectedResult);
  });
});
```

### Mock Data Organization
- Create factories for entity mocks in `test/unit/.../mocks/`
- Factory example: `contact.factory.ts`
- Mock lists: `contact-list.mock.ts`
- Reuse mocks across tests

## Environment Configuration
- Copy `.env.example` to `.env` before running
- Required variables:
  ```env
  # Server
  HOST=127.0.0.1
  PORT=8081
  NODE_ENV=development
  
  # PostgreSQL
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASS=postgres
  DB_NAME=circuito_br_116
  DB_CONNECTION_MAX_POOL=90
  ```
- Access via `ConfigService` from `@nestjs/config`

## Common Tasks

### Adding a New Feature Module
1. Create directory: `src/app/domain/[feature-name]/`
2. Add subdirectories: `controllers/`, `use-cases/`, `dtos/`
3. Create DTOs with validation decorators
4. Create use cases with business logic
5. Create controllers using use cases
6. Create `[feature-name].module.ts`:
   ```typescript
   @Module({
     imports: [InfraModule],
     controllers: [FeatureController],
     providers: [FeatureUseCase],
   })
   export class FeatureModule {}
   ```
7. Import in `domain.module.ts`

### Adding a New Repository
1. Define interface in `src/app/infra/repositories/interfaces/[entity].interface.repository.ts`
2. Create entity in `src/app/infra/repositories/type-orm/models/[entity].entity.ts`
3. Implement repository in `src/app/infra/repositories/type-orm/[entity].repository.ts`
4. Register in `typeorm.repository.module.ts`:
   - Add entity to `TypeOrmModule.forFeature([Entity])`
   - Add provider mapping interface to implementation
   - Export interface
5. Inject in use cases using `@Inject(IEntityRepository)`

### Creating Tests
- **Unit tests:** `test/unit/app/[module]/[component].spec.ts`
- **E2E tests:** `test/e2e/app/[module]/[feature].e2e-spec.ts`
- Use existing mock factories and patterns
- Follow AAA pattern (Arrange, Act, Assert)
- Mock all external dependencies in unit tests

### Adding Validation to DTOs
```typescript
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ description: 'Contact name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Contact email', required: false })
  @IsString()
  @IsOptional()
  email?: string;
}
```

## Key Dependencies
- **@nestjs/core** - NestJS framework
- **@nestjs/typeorm** - TypeORM integration
- **typeorm** - ORM for PostgreSQL
- **pg** - PostgreSQL driver
- **class-transformer** - Object transformation
- **class-validator** - DTO validation
- **@nestjs/swagger** - API documentation
- **@nestjs/config** - Environment configuration
- **jest** - Testing framework

## SOLID Principles Applied
- **Single Responsibility:** Each use case handles one business operation
- **Open/Closed:** Use interfaces for repositories, extend with new implementations
- **Liskov Substitution:** Repository implementations are interchangeable via interfaces
- **Interface Segregation:** Repository interfaces are focused and minimal
- **Dependency Inversion:** Depend on abstractions (interfaces), not concretions

---

**For AI Assistants:**
- Always use dependency injection with abstract classes for repositories
- Follow the repository pattern with interfaces in `interfaces/` and implementations in `type-orm/`
- Use mappers (`toObjectResponseMapper`, `toPaginationResponseMapper`) to transform entities to DTOs
- Maintain separation between domain logic (use cases in `domain/`) and infrastructure (repositories in `infra/`)
- Reference existing patterns in `ContactRepository` and `PaginateContactsByFilterCase`
- Use `@/` path alias for imports from `src/` when possible
- When creating new features, follow the structure in `src/app/domain/contact/`
- Always validate DTOs with `class-validator` decorators
- Document APIs with Swagger decorators
- Write tests for all business logic (use cases) and API endpoints (controllers)
