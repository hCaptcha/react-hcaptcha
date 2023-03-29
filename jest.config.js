// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

export default {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // The glob patterns Jest uses to detect test files
    testMatch: ["**/?(*.)+(spec|test).js?(x)"],

    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    testPathIgnorePatterns: ["/node_modules/", "webpack.config.test.js"],

    testEnvironment: 'jsdom'
};
