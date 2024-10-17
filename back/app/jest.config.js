module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/app/jest.setup.js'],
  testMatch: ['**/tests/**/*.js', '**/?(*.)+(spec|test).js'],
  roots: ['<rootDir>/app'],
  moduleDirectories: ['node_modules', 'app'],
};