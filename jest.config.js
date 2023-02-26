module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/libs/**/*.js'],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
        'libs/mongoPagination.js': {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    }
};
