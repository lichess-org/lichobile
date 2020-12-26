module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: [
      "ts",
      "tsx",
      "js"
  ],
  testMatch: [
      "<rootDir>/src/**/__tests__/*.(ts|tsx|js)"
  ],
  verbose: true
};
