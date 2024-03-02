module.exports = {
  rootDir: '../../',
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue',
    'ts',
    'tsx'
  ],
  coverageDirectory: './coverage-integration',
  testPathIgnorePatterns: [
    '<rootDir>/src/',
    '<rootDir>/test/unit/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/src/',
  ],
  transform: {
    'snippets\/(?!index)': '<rootDir>/test/unit/rawTransform.js',
    '^.+\\.vue$': '@vue/vue2-jest',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.svg$': '<rootDir>/test/unit/svgTransform.js',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': '<rootDir>/test/unit/stubTransform.js',
    '^.+\\.tsx?$': 'ts-jest'
  },
  transformIgnorePatterns: [
    '/test/e2e',
    '/node_modules/(?!(lottie-vuejs|uuid|pinia))'
  ],
  moduleNameMapper: {
    '^vue$': 'vue/dist/vue.common.js',
    '^@/storybook/(.*)$': '<rootDir>/config/storybook/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
    '^(.+).svg$': '<rootDir>/test/unit/svgTransform.js',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': '<rootDir>/test/unit/stubTransform.js',
    '^worker-loader!@/(.*)': '<rootDir>/src/$1'
  },
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: [
    '<rootDir>/test/integration/**/*.integration.(js|jsx|ts|tsx)'
  ],
  verbose: true,
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  globals: {
    'ts-jest': {
      babelConfig: true
    }
  },
  setupFilesAfterEnv: ['<rootDir>test/integration/setupTests.ts'],
  setupFiles: ['jest-date-mock']
}
