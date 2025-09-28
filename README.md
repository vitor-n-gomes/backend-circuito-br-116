# Circuito BR 116 

This project is a backend application built using the **NestJS** framework. It adheres to the SOLID principles and provides functionality to analyze and manage movie data, including identifying producers with the shortest and longest intervals between Golden Raspberry Awards.

## Prerequisites

- [Node.js](https://nodejs.org/) (v21 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vitor-n-gomes/backend-circuito-br-116.git
   cd backend-circuito-br-116
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Copy the `env.example` file to `.env` and configure the necessary variables:
   ```bash
   cp env.example .env
   ```

   Update the `.env` file with your specific configuration.

## Running the Application

### Development Mode
```bash
npm run start:dev
# or
yarn start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
# or
yarn build
yarn start:prod
```

### Running Tests
Run unit tests:
```bash
npm run test
# or
yarn test
```

Run end-to-end tests:
```bash
npm run test:e2e
# or
yarn test:e2e
```

Check test coverage:
```bash
npm run test:cov
# or
yarn test:cov
```

## Accessing the API

Once the application is running, you can access the API at the following URL:

- **Base URL**: `http://localhost:3000`

You can use tools like [Postman](https://www.postman.com/) or [cURL](https://curl.se/) to interact with the API.

## Code Coverage

The project uses **Istanbul** for code coverage. Coverage reports can be found in the `coverage/` directory after running the coverage command.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
