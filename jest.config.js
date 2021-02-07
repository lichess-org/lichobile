const esmModules = ['lodash-es', 'date-fns/esm'].join('|')

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
  transformIgnorePatterns: [
    `<rootDir>/node_modules/(?!${esmModules}/.*)`
  ],
  transform: {
    "^.+\\.(j|t)sx?$": "ts-jest"
  },
  globals: {
    'ts-jest': {
      'tsconfig': 'tsconfig.test.json'
    }
  },
  verbose: true
};
