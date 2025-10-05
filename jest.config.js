const path = require('path');

function makeModuleNameMapper(tsConfigPath) {
    const { paths } = require(tsConfigPath).compilerOptions;
    const aliases = {};

    Object.keys(paths).forEach((item) => { 
        const key = item.replace('/*', '/(.*)');
        const value = paths[item][0].replace('/*', '/$1');
        aliases[key] = `<rootDir>/${value}`;
    });

    return aliases;
}

module.exports = {
    rootDir: path.resolve(__dirname, './'),
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: makeModuleNameMapper('./tsconfig.json'),
    modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
    resetMocks: true,
    restoreMocks: true,
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.dto.ts',
        '!src/**/*.module.ts',
        '!src/main.ts'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    testMatch: ['<rootDir>/test/**/*.spec.ts'],
    testPathIgnorePatterns: [
        '<rootDir>/dist/',
        '<rootDir>/node_modules/',
        '<rootDir>/src/.*\\.dto\\.ts$',
        '<rootDir>/src/.*\\.module\\.ts$',
        '<rootDir>/src/main.ts$'
    ]
}