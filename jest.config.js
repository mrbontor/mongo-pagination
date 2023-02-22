module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/libs/**/*.js'],
    coverageThreshold: {
        global: {
            lines: 80
        }
    }
};
