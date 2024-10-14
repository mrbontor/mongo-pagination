module.exports = {
    testEnvironment: 'node',
    collectCoverage: false,
    collectCoverageFrom: ['<rootDir>/libs/**/*.js'],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        },
        'libs/mongoPagination.js': {
            branches: 30,
            functions: 50,
            lines: 50,
            statements: 50
        }
    }
};
