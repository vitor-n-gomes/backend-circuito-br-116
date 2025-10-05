# Circuito BR 116 Backend API

Backend service for the Circuito BR 116 website, built with NestJS. This modern API replaces the legacy infrastructure and provides a robust foundation for the platform's services.

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** MySQL 8.0
- **Testing:** Jest
- **Documentation:** Swagger/OpenAPI 
- **Code Coverage:** Istanbul
- **Node Version:** v21 or higher

## Project Structure

```
src/
├── app/            # Domain logic and business modules
├── common/         # Shared utilities and helpers
├── errors/         # Custom error definitions
├── filters/        # Global exception filters
└── main.ts        # Application entry point
```

## Prerequisites

- Node.js (v21+)
- npm or yarn
- MySQL (version 8.0 or higher)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/vitor-n-gomes/backend-circuito-br-116.git
   cd backend-circuito-br-116
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   Configure the following variables in `.env`:
   - `HOST`: API host (default: 127.0.0.1)
   - `PORT`: API port (default: 8081)
   - `NODE_ENV`: Environment (development/production)
   - `DB_HOST`: MySQL server host
   - `DB_PORT`: MySQL server port (default: 3306)
   - `DB_USER`: MySQL username
   - `DB_PASS`: MySQL password
   - `DB_NAME`: MySQL database name

## Development

```bash
# Development mode with hot-reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation

- API documentation is available via Swagger
- Access the Swagger UI at: `http://{HOST}:{PORT}/api-docs`
- OpenAPI specification: `swagger.json`

## Error Handling

The application implements a global exception filter and custom error classes for consistent error responses:
- Custom errors are defined in `src/common/errors/`
- Global exception handling in `src/common/filters/http-exception.filter.ts`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
