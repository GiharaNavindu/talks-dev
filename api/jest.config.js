
module.exports = {
    testEnvironment: 'node',
    testTimeout: 10000,
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    collectCoverage: true,
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/models/*.js'
    ]
  };