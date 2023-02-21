module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: ['./libs/mongoPagination.js', './libs/validation.js', './libs/generateAgregation.js'],
    coverageThreshold: {
        global: {
            lines: 90
        }
    }
};
