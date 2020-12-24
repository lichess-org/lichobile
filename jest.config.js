module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: [
      "ts",
      "tsx",
      "js"
  ],
  moduleNameMapper: {
    "~(.*)$": "<rootDir>/src/$1"
  },
  testMatch: [
      "<rootDir>/src/**/__tests__/*.(ts|tsx|js)"
  ],
  globals: {
    'ts-jest': {
      'tsconfig': 'tsconfig.test.json'
    }
  },
  verbose: true
};
