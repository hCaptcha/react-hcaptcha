export default {
  collectCoverage: false,
  coverageDirectory: 'coverage',
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/__tests__/unit/*.(spec|test).js',
        '<rootDir>/__tests__/unit/*.(spec|test).tsx',
      ],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.js'],
      transform: {
        '^.+\\.(t|j)sx?$': [
          '@swc/jest',
          {
            jsc: {
              parser: {
                jsx: true
              },
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
            },
          },
        ],
      }
    },
  ],
};